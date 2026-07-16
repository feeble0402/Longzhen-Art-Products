import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PriceMode } from '../generated/prisma/enums';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ImageStorageService } from './image-storage.service';
import { ProductsRepository } from './products.repository';

@Injectable()
export class ProductsService {
  constructor(
    private readonly repository: ProductsRepository,
    private readonly storage: ImageStorageService,
  ) {}

  async findAdmin(query: ProductQueryDto) {
    const result = await this.repository.findAdmin(query);
    return this.paginate(result, query);
  }

  async findPublic(query: ProductQueryDto) {
    const result = await this.repository.findPublic(query);
    return {
      ...this.paginate(result, query),
      items: result.items.map((product) => this.toPublicProduct(product)),
    };
  }

  async findPublicBySlug(slug: string) {
    const product = await this.repository.findPublicBySlug(slug);
    if (!product) throw new NotFoundException('找不到商品');
    const relatedProducts = await this.repository.findRelatedProducts(
      product.id,
      product.categories.map((item) => item.categoryId),
      product.showSoldOutInRelated,
    );
    return {
      ...this.toPublicProduct(product),
      relatedProducts: relatedProducts.map((item) => this.toPublicProduct(item)),
    };
  }

  async create(dto: CreateProductDto) {
    const normalized = this.normalizeProductInput(dto);
    this.validateCommerceRules(normalized);
    await this.validateCategories(normalized.categoryIds);
    await this.validateRecommendations(normalized.recommendationIds ?? []);
    return this.repository.create(normalized);
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.requireProduct(id);
    const normalized = this.normalizeProductInput(dto);
    const merged = {
      priceMode: normalized.priceMode ?? existing.priceMode,
      publicPrice:
        normalized.publicPrice ?? (existing.salePrice ? existing.salePrice.toString() : undefined),
      originalPrice: normalized.originalPrice ?? undefined,
      acceptsShopee: normalized.acceptsShopee ?? existing.acceptsShopee,
      shopeeUrl:
        normalized.shopeeUrl !== undefined
          ? normalized.shopeeUrl ?? undefined
          : existing.shopeeUrl ?? undefined,
    };
    this.validateCommerceRules(merged);
    if (normalized.categoryIds) await this.validateCategories(normalized.categoryIds);
    if (normalized.recommendationIds) {
      if (normalized.recommendationIds.includes(id)) {
        throw new BadRequestException('不可將商品推薦給自己');
      }
      await this.validateRecommendations(normalized.recommendationIds);
    }
    return this.repository.update(id, normalized);
  }

  async delete(id: string): Promise<void> {
    const product = await this.requireProduct(id);
    await this.repository.delete(id);
    await Promise.all(product.images.map((image) => this.storage.delete(image.objectKey)));
  }

  async uploadImages(
    productId: string,
    files: Express.Multer.File[],
    altTextsInput?: string[] | string,
  ) {
    const product = await this.requireProduct(productId);
    if (!files.length) throw new BadRequestException('請至少上傳一張圖片');
    const altTexts = Array.isArray(altTextsInput)
      ? altTextsInput
      : altTextsInput
        ? [altTextsInput]
        : [];
    if (altTexts.length > 0 && altTexts.length !== files.length) {
      throw new BadRequestException('altTexts 數量必須與圖片數量相同');
    }

    const stored = [];
    try {
      for (const [index, file] of files.entries()) {
        const image = await this.storage.save(file);
        stored.push({
          ...image,
          altText: (altTexts[index] || product.name).slice(0, 250),
        });
      }
      return await this.repository.addImages(productId, stored);
    } catch (error) {
      await Promise.all(stored.map((image) => this.storage.delete(image.objectKey)));
      throw error;
    }
  }

  async reorderImages(productId: string, imageIds: string[]) {
    await this.requireProduct(productId);
    const images = await this.repository.reorderImages(productId, imageIds);
    if (!images) {
      throw new BadRequestException('imageIds 必須完整包含該商品的所有圖片');
    }
    return images;
  }

  async setPrimaryImage(productId: string, imageId: string) {
    await this.requireImage(productId, imageId);
    return this.repository.setPrimaryImage(productId, imageId);
  }

  async deleteImage(productId: string, imageId: string): Promise<void> {
    const image = await this.requireImage(productId, imageId);
    await this.repository.deleteImage(productId, imageId);
    await this.storage.delete(image.objectKey);
  }

  private async requireProduct(id: string) {
    const product = await this.repository.findById(id);
    if (!product) throw new NotFoundException('找不到商品');
    return product;
  }

  private async requireImage(productId: string, imageId: string) {
    const image = await this.repository.findImage(productId, imageId);
    if (!image) throw new NotFoundException('找不到商品圖片');
    return image;
  }

  private async validateCategories(ids: string[]): Promise<void> {
    const count = await this.repository.countCategories(ids);
    if (count !== ids.length) throw new BadRequestException('包含不存在的商品分類');
  }

  private async validateRecommendations(ids: string[]): Promise<void> {
    if (!ids.length) return;
    const count = await this.repository.countProducts(ids);
    if (count !== ids.length) throw new BadRequestException('包含不存在的推薦商品');
  }

  private normalizeProductInput<T extends CreateProductDto | UpdateProductDto>(dto: T): T {
    return {
      ...dto,
      ...(dto.tagNames
        ? { tagNames: [...new Set(dto.tagNames.map((name) => name.trim()).filter(Boolean))] }
        : {}),
    };
  }

  private validateCommerceRules(dto: {
    priceMode: PriceMode;
    publicPrice?: string;
    originalPrice?: string | null;
    acceptsShopee?: boolean;
    shopeeUrl?: string | null;
  }): void {
    if (dto.priceMode === PriceMode.PUBLIC_PRICE && !dto.publicPrice) {
      throw new BadRequestException('公開價格商品必須提供 publicPrice');
    }
    if (dto.publicPrice !== undefined && Number(dto.publicPrice) < 0) {
      throw new BadRequestException('publicPrice 不可小於零');
    }
    if (dto.originalPrice != null && Number(dto.originalPrice) < 0) {
      throw new BadRequestException('originalPrice 不可小於零');
    }
    if (dto.acceptsShopee && !dto.shopeeUrl) {
      throw new BadRequestException('啟用蝦皮導流時必須提供 shopeeUrl');
    }
  }

  private paginate<T>(result: { items: T[]; total: number }, query: ProductQueryDto) {
    return {
      ...result,
      page: query.page,
      pageSize: query.pageSize,
      totalPages: Math.ceil(result.total / query.pageSize),
    };
  }

  private toPublicProduct<T extends { priceMode: PriceMode; salePrice: unknown; originalPrice: unknown }>(
    product: T,
  ) {
    const { salePrice, originalPrice, ...safe } = product;
    return {
      ...safe,
      ...(product.priceMode === PriceMode.PUBLIC_PRICE
        ? {
            publicPrice: salePrice,
            originalPrice,
          }
        : {}),
    };
  }
}
