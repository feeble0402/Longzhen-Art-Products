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
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { ReorderImagesDto } from './dto/reorder-images.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UploadImagesDto } from './dto/upload-images.dto';
import { ProductsService } from './products.service';

const imageUploadOptions = {
  limits: { fileSize: 10 * 1024 * 1024, files: 10 },
  fileFilter: (
    _request: Express.Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    const accepted = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
    callback(accepted ? null : new BadRequestException('僅支援 JPEG、PNG 與 WebP'), accepted);
  },
};

@Controller()
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Get('products')
  findPublic(@Query() query: ProductQueryDto) {
    return this.service.findPublic(query);
  }

  @Get('products/:slug')
  findPublicBySlug(@Param('slug') slug: string) {
    return this.service.findPublicBySlug(slug);
  }

  @Get('admin/products')
  findAdmin(@Query() query: ProductQueryDto) {
    return this.service.findAdmin(query);
  }

  @Post('admin/products')
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  @Patch('admin/products/:id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete('admin/products/:id')
  @HttpCode(204)
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.delete(id);
  }

  @Post('admin/products/:id/images')
  @UseInterceptors(FilesInterceptor('images', 10, imageUploadOptions))
  uploadImages(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: UploadImagesDto,
  ) {
    return this.service.uploadImages(id, files ?? [], dto.altTexts);
  }

  @Patch('admin/products/:id/images/order')
  reorderImages(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReorderImagesDto,
  ) {
    return this.service.reorderImages(id, dto.imageIds);
  }

  @Patch('admin/products/:productId/images/:imageId/primary')
  setPrimaryImage(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ) {
    return this.service.setPrimaryImage(productId, imageId);
  }

  @Delete('admin/products/:productId/images/:imageId')
  @HttpCode(204)
  deleteImage(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ) {
    return this.service.deleteImage(productId, imageId);
  }
}
