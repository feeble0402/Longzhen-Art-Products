import { BadRequestException } from '@nestjs/common';
import { PriceMode, SaleStatus } from '../generated/prisma/enums';
import { ImageStorageService } from './image-storage.service';
import { ProductsRepository } from './products.repository';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  const repository = {
    findPublic: jest.fn(),
    findPublicBySlug: jest.fn(),
    findRelatedProducts: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    addImages: jest.fn(),
  };
  const storage = { save: jest.fn(), delete: jest.fn() };
  const service = new ProductsService(
    repository as unknown as ProductsRepository,
    storage as unknown as ImageStorageService,
  );

  beforeEach(() => jest.clearAllMocks());

  it('never exposes a non-public price from the public list', async () => {
    repository.findPublic.mockResolvedValue({
      total: 1,
      items: [{
        id: 'product-id',
        name: '沉香作品',
        priceMode: PriceMode.LINE_OFFER,
        salePrice: { toString: () => '999999' },
        originalPrice: { toString: () => '1000000' },
      }],
    });

    const result = await service.findPublic({ page: 1, pageSize: 20 });

    expect(result.items[0]).not.toHaveProperty('salePrice');
    expect(result.items[0]).not.toHaveProperty('publicPrice');
    expect(result.items[0]).not.toHaveProperty('originalPrice');
  });

  it('never exposes a non-public price from related products', async () => {
    repository.findPublicBySlug.mockResolvedValue({
      id: 'source-id',
      priceMode: PriceMode.PUBLIC_PRICE,
      salePrice: '1200',
      originalPrice: null,
      showSoldOutInRelated: false,
      categories: [{ categoryId: 'category-id' }],
    });
    repository.findRelatedProducts.mockResolvedValue([{
      id: 'related-id',
      priceMode: PriceMode.LINE_OFFER,
      salePrice: '999999',
      originalPrice: '1000000',
    }]);

    const result = await service.findPublicBySlug('source-product');

    expect(result.relatedProducts[0]).not.toHaveProperty('salePrice');
    expect(result.relatedProducts[0]).not.toHaveProperty('publicPrice');
    expect(result.relatedProducts[0]).not.toHaveProperty('originalPrice');
  });

  it('rejects a public-price product without a public price', async () => {
    await expect(service.create({
      sku: 'LZ-001',
      slug: 'lz-001',
      name: '作品',
      shortDescription: '簡介',
      description: '說明',
      categoryIds: ['6570a6a4-9b50-4cc1-bff0-643dd2c33da7'],
      priceMode: PriceMode.PUBLIC_PRICE,
      saleStatus: SaleStatus.DRAFT,
    })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('stores every image from a multi-file upload', async () => {
    repository.findById.mockResolvedValue({ id: 'product-id', name: '作品' });
    storage.save
      .mockResolvedValueOnce({ objectKey: 'first.jpg', mimeType: 'image/jpeg', byteSize: 100, width: 800, height: 600 })
      .mockResolvedValueOnce({ objectKey: 'second.webp', mimeType: 'image/webp', byteSize: 120, width: 900, height: 700 });
    repository.addImages.mockImplementation((_id, images) => Promise.resolve(images));
    const files = [
      { originalname: 'first.jpg' },
      { originalname: 'second.webp' },
    ] as Express.Multer.File[];

    const result = await service.uploadImages('product-id', files, ['正面', '側面']);

    expect(storage.save).toHaveBeenCalledTimes(2);
    expect(repository.addImages).toHaveBeenCalledWith(
      'product-id',
      expect.arrayContaining([
        expect.objectContaining({ altText: '正面' }),
        expect.objectContaining({ altText: '側面' }),
      ]),
    );
    expect(result).toHaveLength(2);
  });
});
