import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { PaginationDto } from '../dto/pagination.dto';

interface PaginationQuery {
  page?: string;
  limit?: string;
}

export const Pagination = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): PaginationDto => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const query = request.query as PaginationQuery;

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));

    return {
      page,
      limit,
    };
  },
);
