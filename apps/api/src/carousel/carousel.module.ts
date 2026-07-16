import { Module } from '@nestjs/common';
import { CarouselImageStorageService } from './carousel-image-storage.service';
import { CarouselController } from './carousel.controller';
import { CarouselRepository } from './carousel.repository';
import { CarouselService } from './carousel.service';

@Module({
  controllers: [CarouselController],
  providers: [CarouselRepository, CarouselService, CarouselImageStorageService],
})
export class CarouselModule {}
