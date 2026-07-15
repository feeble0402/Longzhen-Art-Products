import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

const safeAdminSelect = {
  id: true,
  email: true,
  displayName: true,
  active: true,
  failedLoginCount: true,
  lockedUntil: true,
  lastLoginAt: true,
  passwordChangedAt: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class AdminsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.admin.findMany({
      select: safeAdminSelect,
      orderBy: { createdAt: 'asc' },
    });
  }

  findById(id: string) {
    return this.prisma.admin.findUnique({
      where: { id },
      select: safeAdminSelect,
    });
  }

  create(data: {
    email: string;
    displayName: string;
    passwordHash: string;
    active: boolean;
  }) {
    return this.prisma.admin.create({ data, select: safeAdminSelect });
  }

  update(id: string, data: { displayName?: string; active?: boolean }) {
    return this.prisma.admin.update({ where: { id }, data, select: safeAdminSelect });
  }

  resetPassword(id: string, passwordHash: string) {
    return this.prisma.admin.update({
      where: { id },
      data: {
        passwordHash,
        passwordChangedAt: new Date(),
        failedLoginCount: 0,
        lockedUntil: null,
      },
      select: safeAdminSelect,
    });
  }

  countActive() {
    return this.prisma.admin.count({ where: { active: true } });
  }
}
