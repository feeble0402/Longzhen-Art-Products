import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCarouselSlideDto } from './dto/create-carousel-slide.dto';
import { UpdateCarouselSlideDto } from './dto/update-carousel-slide.dto';

@Injectable()
export class CarouselRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAdmin() {
    return this.prisma.carouselSlide.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] });
  }

  findPublic(now: Date) {
    return this.prisma.carouselSlide.findMany({
      where: {
        active: true,
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
        ],
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  findById(id: string) {
    return this.prisma.carouselSlide.findUnique({ where: { id } });
  }

  create(dto: CreateCarouselSlideDto, desktopKey: string, mobileKey: string) {
    return this.prisma.carouselSlide.create({
      data: {
        ...dto,
        desktopKey,
        mobileKey,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
      },
    });
  }

  update(
    id: string,
    dto: UpdateCarouselSlideDto,
    imageKeys: { desktopKey?: string; mobileKey?: string },
  ) {
    return this.prisma.carouselSlide.update({
      where: { id },
      data: {
        ...dto,
        ...imageKeys,
        ...(dto.startsAt !== undefined
          ? { startsAt: dto.startsAt ? new Date(dto.startsAt) : null }
          : {}),
        ...(dto.endsAt !== undefined
          ? { endsAt: dto.endsAt ? new Date(dto.endsAt) : null }
          : {}),
      },
    });
  }

  delete(id: string) {
    return this.prisma.carouselSlide.delete({ where: { id } });
  }
}
