import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { OrderStatus } from '../../orders/entities/order-status.enum';

export class BusinessOrdersFilterDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by order status',
    enum: OrderStatus,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: 'Sort field',
    enum: ['createdAt', 'status', 'total_price', 'quantity'],
  })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['ASC', 'DESC', 'asc', 'desc'],
    default: 'DESC',
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) => value?.toUpperCase())
  @IsString()
  order?: 'ASC' | 'DESC' = 'DESC';
}
