import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { PrismaService } from '../database/prisma.service';
import type { Prisma } from '../generated/prisma/client';
import { SaleStatus } from '../generated/prisma/enums';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { StoredImage } from './image-storage.service';

const productInclude = {
  categories: { include: { category: true }, orderBy: { sortOrder: 'asc' as const } },
  images: { orderBy: { sortOrder: 'asc' as const } },
  tags: { include: { tag: true } },
  recommendations: {
    include: { targetProduct: { select: { id: true, name: true, sku: true } } },
    orderBy: { sortOrder: 'asc' as const },
  },
};

const publicProductInclude = {
  categories: productInclude.categories,
  images: productInclude.images,
  tags: productInclude.tags,
};

type PublicProductRecord = Prisma.ProductGetPayload<{ include: typeof publicProductInclude }>;

function tagSlug(name: string) {
  return `tag-${createHash('sha256').update(name).digest('hex').slice(0, 24)}`;
}

@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAdmin(query: ProductQueryDto) {
    const where = this.buildWhere(query, false);
    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: productInclude,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.product.count({ where }),
    ]);
    return { items, total };
  }

  async findPublic(query: ProductQueryDto) {
    const where = this.buildWhere(query, true);
    const orderBy =
      query.sort === 'priceAsc'
        ? [{ salePrice: { sort: 'asc' as const, nulls: 'last' as const } }, { publishedAt: 'desc' as const }]
        : query.sort === 'priceDesc'
          ? [{ salePrice: { sort: 'desc' as const, nulls: 'last' as const } }, { publishedAt: 'desc' as const }]
          : [{ publishedAt: 'desc' as const }, { createdAt: 'desc' as const }];
    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: publicProductInclude,
        orderBy,
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.product.count({ where }),
    ]);
    return { items, total };
  }

  findById(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: productInclude,
    });
  }

  async findRelatedProducts(
    productId: string,
    categoryIds: string[],
    includeSoldOut: boolean,
    limit = 4,
  ) {
    const saleStatus = {
      in: includeSoldOut
        ? [SaleStatus.ON_SALE, SaleStatus.SOLD_OUT]
        : [SaleStatus.ON_SALE],
    };
    const selected = new Set<string>([productId]);
    const result: PublicProductRecord[] = [];
    const append = (products: PublicProductRecord[]) => {
      for (const product of products) {
        if (selected.has(product.id) || result.length >= limit) continue;
        selected.add(product.id);
        result.push(product);
      }
    };

    const manual = await this.prisma.productRecommendation.findMany({
      where: { sourceProductId: productId, targetProduct: { saleStatus } },
      include: { targetProduct: { include: publicProductInclude } },
      orderBy: { sortOrder: 'asc' },
    });
    append(manual.map((item) => item.targetProduct));

    if (result.length < limit && categoryIds.length) {
      append(await this.prisma.product.findMany({
        where: {
          id: { notIn: [...selected] },
          saleStatus,
          categories: { some: { categoryId: { in: categoryIds } } },
        },
        include: publicProductInclude,
        orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }],
        take: limit - result.length,
      }));
    }

    if (result.length < limit) {
      append(await this.prisma.product.findMany({
        where: { id: { notIn: [...selected] }, saleStatus, isFeatured: true },
        include: publicProductInclude,
        orderBy: { publishedAt: 'desc' },
        take: limit - result.length,
      }));
    }

    return result;
  }

  findPublicBySlug(slug: string) {
    return this.prisma.product.findFirst({
      where: { slug, saleStatus: { in: [SaleStatus.ON_SALE, SaleStatus.SOLD_OUT, SaleStatus.PAUSED] } },
      include: publicProductInclude,
    });
  }

  countCategories(ids: string[]) {
    return this.prisma.category.count({ where: { id: { in: ids } } });
  }

  countProducts(ids: string[]) {
    return this.prisma.product.count({ where: { id: { in: ids } } });
  }

  create(dto: CreateProductDto) {
    const { categoryIds, publicPrice, tagNames, recommendationIds, ...product } = dto;
    return this.prisma.product.create({
      data: {
        ...product,
        salePrice: dto.priceMode === 'PUBLIC_PRICE' ? publicPrice : null,
        categories: {
          create: categoryIds.map((categoryId, sortOrder) => ({ categoryId, sortOrder })),
        },
        tags: tagNames?.length ? {
          create: tagNames.map((name) => ({
            tag: {
              connectOrCreate: {
                where: { name },
                create: { name, slug: tagSlug(name) },
              },
            },
          })),
        } : undefined,
        recommendations: recommendationIds?.length ? {
          create: recommendationIds.map((targetProductId, sortOrder) => ({ targetProductId, sortOrder })),
        } : undefined,
      },
      include: productInclude,
    });
  }

  update(id: string, dto: UpdateProductDto) {
    const { categoryIds, publicPrice, tagNames, recommendationIds, ...product } = dto;
    return this.prisma.$transaction(async (tx) => {
      if (categoryIds) {
        await tx.productCategory.deleteMany({ where: { productId: id } });
      }
      if (tagNames) await tx.productTag.deleteMany({ where: { productId: id } });
      if (recommendationIds) {
        await tx.productRecommendation.deleteMany({ where: { sourceProductId: id } });
      }
      return tx.product.update({
        where: { id },
        data: {
          ...product,
          ...(dto.priceMode && dto.priceMode !== 'PUBLIC_PRICE'
            ? { salePrice: null }
            : publicPrice !== undefined
              ? { salePrice: publicPrice }
              : {}),
          ...(categoryIds
            ? {
                categories: {
                  create: categoryIds.map((categoryId, sortOrder) => ({ categoryId, sortOrder })),
                },
              }
            : {}),
          ...(tagNames
            ? {
                tags: {
                  create: tagNames.map((name) => ({
                    tag: {
                      connectOrCreate: {
                        where: { name },
                        create: { name, slug: tagSlug(name) },
                      },
                    },
                  })),
                },
              }
            : {}),
          ...(recommendationIds
            ? {
                recommendations: {
                  create: recommendationIds.map((targetProductId, sortOrder) => ({
                    targetProductId,
                    sortOrder,
                  })),
                },
              }
            : {}),
        },
        include: productInclude,
      });
    });
  }

  delete(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }

  async addImages(
    productId: string,
    images: Array<StoredImage & { altText: string }>,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.productImage.aggregate({
        where: { productId },
        _count: true,
        _max: { sortOrder: true },
      });
      const start = (current._max.sortOrder ?? -1) + 1;
      for (const [index, image] of images.entries()) {
        await tx.productImage.create({
          data: {
            productId,
            ...image,
            sortOrder: start + index,
            isPrimary: current._count === 0 && index === 0,
          },
        });
      }
      return tx.productImage.findMany({
        where: { productId },
        orderBy: { sortOrder: 'asc' },
      });
    });
  }

  findImage(productId: string, imageId: string) {
    return this.prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });
  }

  async reorderImages(productId: string, imageIds: string[]) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.productImage.findMany({ where: { productId } });
      if (existing.length !== imageIds.length) return null;
      const existingIds = new Set(existing.map((image) => image.id));
      if (imageIds.some((id) => !existingIds.has(id))) return null;
      await tx.productImage.updateMany({
        where: { productId },
        data: { sortOrder: { increment: 10000 } },
      });
      for (const [sortOrder, id] of imageIds.entries()) {
        await tx.productImage.update({ where: { id }, data: { sortOrder } });
      }
      return tx.productImage.findMany({
        where: { productId },
        orderBy: { sortOrder: 'asc' },
      });
    });
  }

  async setPrimaryImage(productId: string, imageId: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.productImage.updateMany({ where: { productId }, data: { isPrimary: false } });
      return tx.productImage.update({ where: { id: imageId }, data: { isPrimary: true } });
    });
  }

  async deleteImage(productId: string, imageId: string) {
    return this.prisma.$transaction(async (tx) => {
      const image = await tx.productImage.delete({ where: { id: imageId } });
      if (image.isPrimary) {
        const next = await tx.productImage.findFirst({
          where: { productId },
          orderBy: { sortOrder: 'asc' },
        });
        if (next) await tx.productImage.update({ where: { id: next.id }, data: { isPrimary: true } });
      }
      return image;
    });
  }

  private buildWhere(query: ProductQueryDto, publicOnly: boolean) {
    return {
      ...(publicOnly
        ? { saleStatus: { in: [SaleStatus.ON_SALE, SaleStatus.SOLD_OUT, SaleStatus.PAUSED] } }
        : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' as const } },
              { sku: { contains: query.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
      ...(query.categoryId
        ? { categories: { some: { categoryId: query.categoryId } } }
        : {}),
      ...(query.homeOnly === 'true' ? { showOnHome: true } : {}),
    };
  }
}
