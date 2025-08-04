import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { UserRole } from '../../users/entities/user-role.enum';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as { role: UserRole } | undefined;

    if (!user || user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Access denied - Admin only');
    }

    return true;
  }
}
