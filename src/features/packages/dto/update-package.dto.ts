import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsUUID,
  IsUrl,
  IsArray,
  IsDateString,
  IsOptional,
  Min,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePackageDto {
  @ApiPropertyOptional({
    description: 'Package name',
    example: 'Surprise Bakery Box',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Package description',
    example: 'A delightful mix of fresh pastries and bread',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Package image URL',
    example: 'https://example.com/images/bakery-box.jpg',
  })
  @IsOptional()
  @IsUrl()
  image_url?: string;

  @ApiPropertyOptional({
    description: 'Package price',
    example: 29.99,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price?: number;

  @ApiPropertyOptional({
    description: 'Available quantity',
    example: 5,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity_available?: number;

  @ApiPropertyOptional({
    description: 'Pickup start time',
    example: '2024-03-20T18:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  pickup_start_time?: string;

  @ApiPropertyOptional({
    description: 'Pickup end time',
    example: '2024-03-20T20:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  pickup_end_time?: string;

  @ApiPropertyOptional({
    description: 'Category ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  category_id?: string;

  @ApiPropertyOptional({
    description: 'Subcategory ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  subcategory_id?: string;

  @ApiPropertyOptional({
    description: 'List of allergens',
    example: ['nuts', 'dairy', 'gluten'],
    isArray: true,
    minItems: 0,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(0)
  @ValidateNested({ each: true })
  allergens?: string[];

  @ApiPropertyOptional({
    description: 'Whether the package is active',
    example: true,
  })
  @IsOptional()
  is_active?: boolean;
}
