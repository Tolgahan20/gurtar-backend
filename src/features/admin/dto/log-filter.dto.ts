import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { AdminActionType, AdminTargetType } from '../entities/admin-log.entity';

export class LogFilterDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by action type',
    enum: AdminActionType,
  })
  @IsOptional()
  @IsEnum(AdminActionType)
  action_type?: AdminActionType;

  @ApiPropertyOptional({
    description: 'Filter by target type',
    enum: AdminTargetType,
  })
  @IsOptional()
  @IsEnum(AdminTargetType)
  target_type?: AdminTargetType;

  @ApiPropertyOptional({
    description: 'Search in description',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Sort field',
    enum: ['createdAt', 'action_type', 'target_type'],
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
  action?: { action: any };
  admin_id?: { admin_id: any };
  target_id?: { target_id: any };
}
