import { Injectable } from '@nestjs/common';
import { AuditAction } from '../generated/prisma/enums';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.admin.findUnique({ where: { email } });
  }

  findActiveById(id: string) {
    return this.prisma.admin.findFirst({ where: { id, active: true } });
  }

  recordFailure(
    id: string,
    failedLoginCount: number,
    lockedUntil: Date | null,
  ) {
    return this.prisma.admin.update({
      where: { id },
      data: { failedLoginCount, lockedUntil },
    });
  }

  recordSuccess(id: string) {
    return this.prisma.admin.update({
      where: { id },
      data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() },
    });
  }

  auditLogin(
    adminId: string | null,
    action: AuditAction,
    ipAddress?: string,
    userAgent?: string,
    metadata?: Record<string, string>,
  ) {
    return this.prisma.auditLog.create({
      data: {
        adminId,
        action,
        entityType: 'AUTH',
        entityId: adminId,
        ipAddress,
        userAgent: userAgent?.slice(0, 500),
        metadata,
      },
    });
  }
}
