import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query } from '@nestjs/common';
import { AuditService } from './audit.service';

@Controller('admin/audit-logs')
export class AuditController {
  constructor(private readonly service: AuditService) {}

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
  ) {
    return this.service.findAll(Math.max(1, page), Math.min(100, Math.max(1, pageSize)));
  }
}
