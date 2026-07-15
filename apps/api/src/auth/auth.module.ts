import 'dotenv/config';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AUTH_RULES } from './auth.constants';
import { AdminAuthGuard } from './admin-auth.guard';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret || sessionSecret.length < 32) {
  throw new Error('SESSION_SECRET 必須設定為至少 32 字元');
}

@Module({
  imports: [
    JwtModule.register({
      secret: sessionSecret,
      signOptions: { expiresIn: AUTH_RULES.accessTokenLifetime },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthRepository,
    AuthService,
    AdminAuthGuard,
    { provide: APP_GUARD, useExisting: AdminAuthGuard },
  ],
  exports: [JwtModule, AuthRepository],
})
export class AuthModule {}
