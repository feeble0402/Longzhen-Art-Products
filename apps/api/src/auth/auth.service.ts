import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { randomUUID } from 'node:crypto';
import { AuditAction } from '../generated/prisma/enums';
import { AUTH_RULES } from './auth.constants';
import { AuthRepository } from './auth.repository';
import { AdminTokenPayload } from './auth.types';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly dummyHash = argon2.hash(randomUUID(), { type: argon2.argon2id });

  constructor(
    private readonly repository: AuthRepository,
    private readonly jwt: JwtService,
  ) {}

  async login(
    dto: LoginDto,
    context: { ipAddress?: string; userAgent?: string },
  ) {
    const email = dto.email.trim().toLowerCase();
    const admin = await this.repository.findByEmail(email);
    const passwordMatches = await argon2.verify(
      admin?.passwordHash ?? (await this.dummyHash),
      dto.password,
    );
    const now = new Date();

    if (admin?.lockedUntil && admin.lockedUntil > now) {
      await this.auditFailure(admin.id, context, 'ACCOUNT_LOCKED');
      throw new UnauthorizedException('帳號暫時鎖定，請稍後再試');
    }

    if (!admin || !admin.active || !passwordMatches) {
      if (admin) {
        const failures = admin.failedLoginCount + 1;
        const lockedUntil =
          failures >= AUTH_RULES.maxFailedLogins
            ? new Date(now.getTime() + AUTH_RULES.lockMinutes * 60_000)
            : null;
        await this.repository.recordFailure(admin.id, failures, lockedUntil);
        await this.auditFailure(
          admin.id,
          context,
          lockedUntil ? 'MAX_FAILURES_REACHED' : 'INVALID_CREDENTIALS',
        );
      } else {
        await this.auditFailure(null, context, 'INVALID_CREDENTIALS');
      }
      throw new UnauthorizedException('電子郵件或密碼錯誤');
    }

    await this.repository.recordSuccess(admin.id);
    await this.repository.auditLogin(
      admin.id,
      AuditAction.LOGIN,
      context.ipAddress,
      context.userAgent,
    );
    const payload: AdminTokenPayload = {
      sub: admin.id,
      email: admin.email,
      displayName: admin.displayName,
      passwordVersion: admin.passwordChangedAt?.getTime() ?? 0,
    };
    return {
      accessToken: await this.jwt.signAsync(payload),
      tokenType: 'Bearer',
      expiresInSeconds: 30 * 60,
      admin: payload,
    };
  }

  private auditFailure(
    adminId: string | null,
    context: { ipAddress?: string; userAgent?: string },
    reason: string,
  ) {
    return this.repository.auditLogin(
      adminId,
      AuditAction.LOGIN_FAILED,
      context.ipAddress,
      context.userAgent,
      { reason },
    );
  }
}
