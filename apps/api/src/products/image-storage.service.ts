import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import sharp from 'sharp';

export interface StoredImage {
  objectKey: string;
  mimeType: string;
  byteSize: number;
  width: number;
  height: number;
}

const IMAGE_FORMATS = new Map([
  ['jpeg', { extension: '.jpg', mimeType: 'image/jpeg' }],
  ['png', { extension: '.png', mimeType: 'image/png' }],
  ['webp', { extension: '.webp', mimeType: 'image/webp' }],
]);

@Injectable()
export class ImageStorageService {
  private readonly root = join(process.cwd(), 'uploads', 'products');

  async save(file: Express.Multer.File): Promise<StoredImage> {
    let metadata: sharp.Metadata;
    try {
      metadata = await sharp(file.buffer).metadata();
    } catch {
      throw new BadRequestException(`${file.originalname} 不是有效圖片`);
    }

    const format = metadata.format ? IMAGE_FORMATS.get(metadata.format) : null;
    if (!format || !metadata.width || !metadata.height) {
      throw new BadRequestException('僅支援 JPEG、PNG 與 WebP 圖片');
    }

    await mkdir(this.root, { recursive: true });
    const objectKey = `${randomUUID()}${format.extension}`;
    await writeFile(join(this.root, objectKey), file.buffer, { flag: 'wx' });
    return {
      objectKey,
      mimeType: format.mimeType,
      byteSize: file.size,
      width: metadata.width,
      height: metadata.height,
    };
  }

  async read(objectKey: string): Promise<Buffer> {
    this.assertSafeKey(objectKey);
    try {
      return await readFile(join(this.root, objectKey));
    } catch {
      throw new NotFoundException('找不到圖片');
    }
  }

  async delete(objectKey: string): Promise<void> {
    this.assertSafeKey(objectKey);
    await unlink(join(this.root, objectKey)).catch(() => undefined);
  }

  private assertSafeKey(objectKey: string): void {
    if (
      !/^[0-9a-f-]{36}\.(?:jpg|png|webp)$/.test(objectKey) ||
      extname(objectKey) === ''
    ) {
      throw new BadRequestException('無效的圖片路徑');
    }
  }
}
