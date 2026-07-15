import { Body, Controller, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto, @Req() request: Request) {
    return this.service.login(dto, {
      ipAddress: request.ip,
      userAgent: request.get('user-agent'),
    });
  }
}
