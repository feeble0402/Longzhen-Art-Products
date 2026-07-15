import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';
import { MediaController } from './media.controller';

@Module({
  imports: [ProductsModule],
  controllers: [MediaController],
})
export class MediaModule {}
