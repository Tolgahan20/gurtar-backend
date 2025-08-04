import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsUrl,
  IsUUID,
  IsDateString,
  IsArray,
  ArrayMinSize,
  Min,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePackageDto {
  @ApiProperty({
    description: 'Package name',
    example: 'Surprise Box - Bakery',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Package description',
    example: 'A delicious mix of our fresh bakery items',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    description: 'Package image URL',
    example: 'https://example.com/images/surprise-box.jpg',
  })
  @IsUrl()
  @IsNotEmpty()
  image_url!: string;

  @ApiProperty({
    description: 'Original price before discount',
    example: 100.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  original_price!: number;

  @ApiProperty({
    description: 'Discounted surprise box price',
    example: 35.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price!: number;

  @ApiProperty({
    description: 'Estimated weight of food in kilograms',
    example: 0.5,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  estimated_weight!: number;

  @ApiProperty({
    description: 'Number of packages available',
    example: 5,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity_available!: number;

  @ApiProperty({
    description: 'Pickup start time',
    example: '2024-06-01T16:00:00Z',
  })
  @IsDateString()
  pickup_start_time!: string;

  @ApiProperty({
    description: 'Pickup end time',
    example: '2024-06-01T18:00:00Z',
  })
  @IsDateString()
  pickup_end_time!: string;

  @ApiProperty({
    description: 'Category ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  category_id!: string;

  @ApiProperty({
    description: 'Subcategory ID (optional)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  subcategory_id?: string;

  @ApiProperty({
    description: 'List of allergens',
    example: ['nuts', 'dairy'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(0)
  @IsOptional()
  allergens?: string[];
}
