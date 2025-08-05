import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class ContactFilterDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by resolution status',
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) => value === 'true')
  @IsBoolean()
  is_resolved?: boolean;

  @ApiPropertyOptional({
    description: 'Search in name, email, subject, or message',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Sort field',
    enum: ['createdAt', 'name', 'email', 'subject', 'is_resolved'],
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