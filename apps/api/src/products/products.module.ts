import { Module } from '@nestjs/common';
import { ImageStorageService } from './image-storage.service';
import { ProductsController } from './products.controller';
import { ProductsRepository } from './products.repository';
import { ProductsService } from './products.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsRepository, ProductsService, ImageStorageService],
  exports: [ImageStorageService],
})
export class ProductsModule {}
