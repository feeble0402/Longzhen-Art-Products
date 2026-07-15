import { Injectable } from '@nestjs/common';
import { AuditAction } from '../generated/prisma/enums';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  record(data: {
    adminId: string;
    action: AuditAction;
    entityType: string;
    entityId?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        ...data,
        userAgent: data.userAgent?.slice(0, 500),
      },
    });
  }

  async findAll(page: number, pageSize: number) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        include: { admin: { select: { email: true, displayName: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.auditLog.count(),
    ]);
    return {
      items: items.map((item) => ({ ...item, id: item.id.toString() })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
