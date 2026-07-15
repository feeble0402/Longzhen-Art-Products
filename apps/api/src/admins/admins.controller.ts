import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Req } from '@nestjs/common';
import type { AdminRequest } from '../auth/admin-auth.guard';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Controller('admin/admins')
export class AdminsController {
  constructor(private readonly service: AdminsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('me')
  findMe(@Req() request: AdminRequest) {
    return this.service.findById(request.admin!.sub);
  }

  @Post()
  create(@Body() dto: CreateAdminDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAdminDto,
    @Req() request: AdminRequest,
  ) {
    return this.service.update(id, dto, request.admin!.sub);
  }

  @Post(':id/reset-password')
  resetPassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ResetPasswordDto,
  ) {
    return this.service.resetPassword(id, dto);
  }
}
