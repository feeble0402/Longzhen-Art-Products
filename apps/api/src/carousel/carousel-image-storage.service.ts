import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const IMAGE_FORMATS = new Map([['jpeg', '.jpg'], ['png', '.png'], ['webp', '.webp']]);

@Injectable()
export class CarouselImageStorageService {
  private readonly root = join(process.cwd(), 'uploads', 'carousel');

  async save(file: Express.Multer.File): Promise<string> {
    let metadata: sharp.Metadata;
    try {
      metadata = await sharp(file.buffer).metadata();
    } catch {
      throw new BadRequestException(`${file.originalname} 不是有效圖片`);
    }
    const extension = metadata.format ? IMAGE_FORMATS.get(metadata.format) : null;
    if (!extension || !metadata.width || !metadata.height) {
      throw new BadRequestException('僅支援 JPEG、PNG 與 WebP 圖片');
    }
    await mkdir(this.root, { recursive: true });
    const objectKey = `${randomUUID()}${extension}`;
    await writeFile(join(this.root, objectKey), file.buffer, { flag: 'wx' });
    return objectKey;
  }

  async read(objectKey: string): Promise<Buffer> {
    this.assertSafeKey(objectKey);
    try {
      return await readFile(join(this.root, objectKey));
    } catch {
      throw new NotFoundException('找不到輪播圖片');
    }
  }

  async delete(objectKey: string): Promise<void> {
    this.assertSafeKey(objectKey);
    await unlink(join(this.root, objectKey)).catch(() => undefined);
  }

  private assertSafeKey(objectKey: string): void {
    if (!/^[0-9a-f-]{36}\.(?:jpg|png|webp)$/.test(objectKey)) {
      throw new BadRequestException('無效的輪播圖片路徑');
    }
  }
}
