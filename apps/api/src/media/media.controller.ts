import { Controller, Get, Param, StreamableFile } from '@nestjs/common';
import { ImageStorageService } from '../products/image-storage.service';

@Controller('media/products')
export class MediaController {
  constructor(private readonly storage: ImageStorageService) {}

  @Get(':objectKey')
  async getImage(@Param('objectKey') objectKey: string) {
    const buffer = await this.storage.read(objectKey);
    const type = objectKey.endsWith('.png')
      ? 'image/png'
      : objectKey.endsWith('.webp')
        ? 'image/webp'
        : 'image/jpeg';
    return new StreamableFile(buffer, { type, disposition: 'inline' });
  }
}
