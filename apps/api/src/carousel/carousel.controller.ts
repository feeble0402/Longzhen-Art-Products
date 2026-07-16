import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  StreamableFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CarouselService } from './carousel.service';
import type { CarouselFiles } from './carousel.service';
import { CreateCarouselSlideDto } from './dto/create-carousel-slide.dto';
import { UpdateCarouselSlideDto } from './dto/update-carousel-slide.dto';

const uploadOptions = {
  limits: { fileSize: 10 * 1024 * 1024, files: 2 },
  fileFilter: (
    _request: Express.Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    const accepted = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
    callback(accepted ? null : new BadRequestException('僅支援 JPEG、PNG 與 WebP'), accepted);
  },
};

const slideImages = FileFieldsInterceptor([
  { name: 'desktopImage', maxCount: 1 },
  { name: 'mobileImage', maxCount: 1 },
], uploadOptions);

@Controller()
export class CarouselController {
  constructor(private readonly service: CarouselService) {}

  @Get('carousel-slides')
  findPublic() { return this.service.findPublic(); }

  @Get('admin/carousel-slides')
  findAdmin() { return this.service.findAdmin(); }

  @Post('admin/carousel-slides')
  @UseInterceptors(slideImages)
  create(
    @Body() dto: CreateCarouselSlideDto,
    @UploadedFiles() files: CarouselFiles,
  ) {
    return this.service.create(dto, files ?? {});
  }

  @Patch('admin/carousel-slides/:id')
  @UseInterceptors(slideImages)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCarouselSlideDto,
    @UploadedFiles() files: CarouselFiles,
  ) {
    return this.service.update(id, dto, files ?? {});
  }

  @Delete('admin/carousel-slides/:id')
  @HttpCode(204)
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.delete(id);
  }

  @Get('media/carousel/:objectKey')
  async image(@Param('objectKey') objectKey: string) {
    const buffer = await this.service.readImage(objectKey);
    const type = objectKey.endsWith('.png')
      ? 'image/png'
      : objectKey.endsWith('.webp')
        ? 'image/webp'
        : 'image/jpeg';
    return new StreamableFile(buffer, { type, disposition: 'inline' });
  }
}
