import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { from, map, mergeMap, Observable } from 'rxjs';
import type { AdminRequest } from '../auth/admin-auth.guard';
import { AuditAction } from '../generated/prisma/enums';
import { AuditService } from './audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly audit: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AdminRequest>();
    const action = this.actionFor(request.method);
    if (!request.path.startsWith('/api/v1/admin') || !action) return next.handle();

    return next.handle().pipe(
      mergeMap((result: { id?: string } | undefined) => {
        if (!request.admin) return [result];
        const parts = request.path.split('/').filter(Boolean);
        const adminIndex = parts.indexOf('admin');
        const entityType = (parts[adminIndex + 1] ?? 'unknown').toUpperCase();
        const rawEntityId =
          request.params.id ??
          request.params.productId ??
          request.params.imageId ??
          result?.id;
        const entityId = Array.isArray(rawEntityId) ? rawEntityId[0] : rawEntityId;
        return from(this.audit.record({
          adminId: request.admin.sub,
          action,
          entityType,
          entityId,
          ipAddress: request.ip,
          userAgent: request.get('user-agent'),
        })).pipe(map(() => result));
      }),
    );
  }

  private actionFor(method: string): AuditAction | null {
    if (method === 'POST') return AuditAction.CREATE;
    if (method === 'PATCH' || method === 'PUT') return AuditAction.UPDATE;
    if (method === 'DELETE') return AuditAction.DELETE;
    return null;
  }
}
