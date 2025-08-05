import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class CategoryFilterDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search in name and description',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by parent category ID',
    type: 'string',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  parent_id?: string;

  @ApiPropertyOptional({
    description: 'Sort field',
    enum: ['createdAt', 'name', 'description'],
  })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['ASC', 'DESC', 'asc', 'desc'],
    default: 'ASC',
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) => value?.toUpperCase())
  @IsString()
  order?: 'ASC' | 'DESC' = 'ASC';

  @ApiPropertyOptional({
    description: 'Include subcategories in the response',
    default: false,
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) => value === 'true')
  include_subcategories?: boolean;
}
