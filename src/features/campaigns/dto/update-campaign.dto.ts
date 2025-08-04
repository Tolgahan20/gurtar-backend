import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsDateString,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DiscountType } from '../entities/discount-type.enum';

export class UpdateCampaignDto {
  @ApiProperty({
    description: 'Campaign title',
    example: 'Summer Sale',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'Campaign description',
    example: 'Get amazing discounts on all summer packages!',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Type of discount',
    enum: DiscountType,
    example: DiscountType.PERCENTAGE,
  })
  @IsEnum(DiscountType)
  @IsOptional()
  discount_type?: DiscountType;

  @ApiProperty({
    description: 'Value of the discount (percentage or fixed amount)',
    example: 20,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  discount_value?: number;

  @ApiProperty({
    description: 'Campaign start date',
    example: '2024-06-01T00:00:00Z',
  })
  @IsDateString()
  @IsOptional()
  start_date?: string;

  @ApiProperty({
    description: 'Campaign end date',
    example: '2024-08-31T23:59:59Z',
  })
  @IsDateString()
  @IsOptional()
  end_date?: string;

  @ApiProperty({
    description: 'Whether the campaign is active',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
