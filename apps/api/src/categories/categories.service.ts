import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly repository: CategoriesRepository) {}

  findAll() {
    return this.repository.findAll();
  }

  async create(dto: CreateCategoryDto) {
    if (dto.parentId) await this.requireCategory(dto.parentId);
    return this.repository.create(dto);
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.requireCategory(id);
    if (dto.parentId === id) {
      throw new ConflictException('分類不可將自己設為上層分類');
    }
    if (dto.parentId) await this.requireCategory(dto.parentId);
    return this.repository.update(id, dto);
  }

  async delete(id: string): Promise<void> {
    await this.requireCategory(id);
    const [products, children] = await this.repository.countRelations(id);
    if (products > 0 || children > 0) {
      throw new ConflictException('分類仍有商品或子分類，無法刪除');
    }
    await this.repository.delete(id);
  }

  private async requireCategory(id: string) {
    const category = await this.repository.findById(id);
    if (!category) throw new NotFoundException('找不到分類');
    return category;
  }
}
