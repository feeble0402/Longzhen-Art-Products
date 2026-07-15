import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { AdminsRepository } from './admins.repository';
import { CreateAdminDto } from './dto/create-admin.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Injectable()
export class AdminsService {
  constructor(private readonly repository: AdminsRepository) {}

  findAll() {
    return this.repository.findAll();
  }

  async findById(id: string) {
    const admin = await this.repository.findById(id);
    if (!admin) throw new NotFoundException('找不到管理員');
    return admin;
  }

  async create(dto: CreateAdminDto) {
    return this.repository.create({
      email: dto.email.trim().toLowerCase(),
      displayName: dto.displayName.trim(),
      passwordHash: await argon2.hash(dto.password, { type: argon2.argon2id }),
      active: dto.active ?? true,
    });
  }

  async update(id: string, dto: UpdateAdminDto, actorId: string) {
    const admin = await this.findById(id);
    if (id === actorId && dto.active === false) {
      throw new BadRequestException('不可停用目前登入的帳號');
    }
    if (admin.active && dto.active === false && (await this.repository.countActive()) <= 1) {
      throw new BadRequestException('至少必須保留一個啟用中的管理員');
    }
    return this.repository.update(id, dto);
  }

  async resetPassword(id: string, dto: ResetPasswordDto) {
    await this.findById(id);
    const hash = await argon2.hash(dto.password, { type: argon2.argon2id });
    return this.repository.resetPassword(id, hash);
  }
}
