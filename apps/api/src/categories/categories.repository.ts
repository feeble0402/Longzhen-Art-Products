import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { products: true, children: true } } },
    });
  }

  findById(id: string) {
    return this.prisma.category.findUnique({ where: { id } });
  }

  create(data: CreateCategoryDto) {
    return this.prisma.category.create({ data });
  }

  update(id: string, data: UpdateCategoryDto) {
    return this.prisma.category.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.category.delete({ where: { id } });
  }

  countRelations(id: string) {
    return Promise.all([
      this.prisma.productCategory.count({ where: { categoryId: id } }),
      this.prisma.category.count({ where: { parentId: id } }),
    ]);
  }
}
