import { BadRequestException } from '@nestjs/common';
import { CarouselImageStorageService } from './carousel-image-storage.service';
import { CarouselRepository } from './carousel.repository';
import { CarouselService } from './carousel.service';

describe('CarouselService', () => {
  const repository = { create: jest.fn(), findById: jest.fn(), findPublic: jest.fn() };
  const storage = { save: jest.fn(), delete: jest.fn(), read: jest.fn() };
  const service = new CarouselService(
    repository as unknown as CarouselRepository,
    storage as unknown as CarouselImageStorageService,
  );

  beforeEach(() => jest.clearAllMocks());

  it('requires separate desktop and mobile images when creating a slide', async () => {
    await expect(service.create({ title: '輪播' }, {
      desktopImage: [{ originalname: 'desktop.jpg' } as Express.Multer.File],
    })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects an end time that is not later than the start time', async () => {
    await expect(service.create({
      startsAt: '2026-07-20T12:00:00.000Z',
      endsAt: '2026-07-20T11:00:00.000Z',
    }, {})).rejects.toBeInstanceOf(BadRequestException);
  });

  it('stores both responsive images before creating the slide', async () => {
    storage.save.mockResolvedValueOnce('desktop.jpg').mockResolvedValueOnce('mobile.jpg');
    repository.create.mockResolvedValue({ id: 'slide-id' });
    const desktop = { originalname: 'desktop.jpg' } as Express.Multer.File;
    const mobile = { originalname: 'mobile.jpg' } as Express.Multer.File;

    await service.create({ title: '輪播' }, { desktopImage: [desktop], mobileImage: [mobile] });

    expect(storage.save).toHaveBeenNthCalledWith(1, desktop);
    expect(storage.save).toHaveBeenNthCalledWith(2, mobile);
    expect(repository.create).toHaveBeenCalledWith(
      { title: '輪播' }, 'desktop.jpg', 'mobile.jpg',
    );
  });
});
