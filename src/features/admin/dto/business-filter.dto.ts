import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class BusinessFilterDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by verification status',
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) => value === 'true')
  @IsBoolean()
  is_verified?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by active status',
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) => value === 'true')
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Search in name, description, email, or city',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by city',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'Sort field',
    enum: ['createdAt', 'name', 'city', 'is_verified'],
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
