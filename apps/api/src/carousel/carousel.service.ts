import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CarouselImageStorageService } from './carousel-image-storage.service';
import { CarouselRepository } from './carousel.repository';
import { CreateCarouselSlideDto } from './dto/create-carousel-slide.dto';
import { UpdateCarouselSlideDto } from './dto/update-carousel-slide.dto';

export interface CarouselFiles {
  desktopImage?: Express.Multer.File[];
  mobileImage?: Express.Multer.File[];
}

@Injectable()
export class CarouselService {
  constructor(
    private readonly repository: CarouselRepository,
    private readonly storage: CarouselImageStorageService,
  ) {}

  findAdmin() { return this.repository.findAdmin(); }
  findPublic() { return this.repository.findPublic(new Date()); }

  async create(dto: CreateCarouselSlideDto, files: CarouselFiles) {
    this.validateSchedule(dto.startsAt, dto.endsAt);
    const desktop = files.desktopImage?.[0];
    const mobile = files.mobileImage?.[0];
    if (!desktop || !mobile) throw new BadRequestException('請同時上傳桌機版與手機版圖片');
    const saved: string[] = [];
    try {
      const desktopKey = await this.storage.save(desktop);
      saved.push(desktopKey);
      const mobileKey = await this.storage.save(mobile);
      saved.push(mobileKey);
      return await this.repository.create(dto, desktopKey, mobileKey);
    } catch (error) {
      await Promise.all(saved.map((key) => this.storage.delete(key)));
      throw error;
    }
  }

  async update(id: string, dto: UpdateCarouselSlideDto, files: CarouselFiles) {
    const existing = await this.requireSlide(id);
    this.validateSchedule(
      dto.startsAt !== undefined ? dto.startsAt : existing.startsAt?.toISOString(),
      dto.endsAt !== undefined ? dto.endsAt : existing.endsAt?.toISOString(),
    );
    const newKeys: string[] = [];
    try {
      const imageKeys: { desktopKey?: string; mobileKey?: string } = {};
      if (files.desktopImage?.[0]) {
        imageKeys.desktopKey = await this.storage.save(files.desktopImage[0]);
        newKeys.push(imageKeys.desktopKey);
      }
      if (files.mobileImage?.[0]) {
        imageKeys.mobileKey = await this.storage.save(files.mobileImage[0]);
        newKeys.push(imageKeys.mobileKey);
      }
      const updated = await this.repository.update(id, dto, imageKeys);
      await Promise.all([
        ...(imageKeys.desktopKey ? [this.storage.delete(existing.desktopKey)] : []),
        ...(imageKeys.mobileKey ? [this.storage.delete(existing.mobileKey)] : []),
      ]);
      return updated;
    } catch (error) {
      await Promise.all(newKeys.map((key) => this.storage.delete(key)));
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const slide = await this.requireSlide(id);
    await this.repository.delete(id);
    await Promise.all([this.storage.delete(slide.desktopKey), this.storage.delete(slide.mobileKey)]);
  }

  readImage(objectKey: string) { return this.storage.read(objectKey); }

  private async requireSlide(id: string) {
    const slide = await this.repository.findById(id);
    if (!slide) throw new NotFoundException('找不到輪播項目');
    return slide;
  }

  private validateSchedule(startsAt?: string | null, endsAt?: string | null) {
    if (startsAt && endsAt && new Date(startsAt) >= new Date(endsAt)) {
      throw new BadRequestException('結束時間必須晚於開始時間');
    }
  }
}
