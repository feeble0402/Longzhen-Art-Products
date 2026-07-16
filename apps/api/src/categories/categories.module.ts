import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesRepository } from './categories.repository';
import { CategoriesService } from './categories.service';
import { PublicCategoriesController } from './public-categories.controller';

@Module({
  controllers: [CategoriesController, PublicCategoriesController],
  providers: [CategoriesRepository, CategoriesService],
})
export class CategoriesModule {}
