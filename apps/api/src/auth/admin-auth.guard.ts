import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { AuthRepository } from './auth.repository';
import { AdminTokenPayload } from './auth.types';

export interface AdminRequest extends Request {
  admin?: AdminTokenPayload;
}

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly repository: AuthRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AdminRequest>();
    if (!request.path.startsWith('/api/v1/admin')) return true;

    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('需要管理員登入');
    }

    try {
      const payload = await this.jwt.verifyAsync<AdminTokenPayload>(token);
      const admin = await this.repository.findActiveById(payload.sub);
      if (!admin) throw new UnauthorizedException('管理員帳號已停用');
      if ((admin.passwordChangedAt?.getTime() ?? 0) !== payload.passwordVersion) {
        throw new UnauthorizedException('密碼已變更，請重新登入');
      }
      request.admin = {
        sub: admin.id,
        email: admin.email,
        displayName: admin.displayName,
        passwordVersion: payload.passwordVersion,
      };
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('登入憑證已失效');
    }
  }
}
