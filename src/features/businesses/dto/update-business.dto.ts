import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsUUID } from 'class-validator';

export class UpdateBusinessDto {
  @ApiPropertyOptional({
    description: 'Business name',
    example: 'Delicious Bakery',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Business description',
    example: 'A local bakery specializing in fresh bread and pastries',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Business phone number',
    example: '+90 533 123 4567',
  })
  @IsString()
  @IsOptional()
  phone_number?: string;

  @ApiPropertyOptional({
    description: 'Business email',
    example: 'contact@deliciousbakery.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Business address',
    example: '123 Main Street',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    description: 'Business city',
    example: 'Nicosia',
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({
    description: 'Business country',
    example: 'North Cyprus',
  })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({
    description: 'Business postal code',
    example: '99010',
  })
  @IsString()
  @IsOptional()
  postal_code?: string;

  @ApiPropertyOptional({
    description: 'Business category ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  category_id?: string;

  @ApiPropertyOptional({
    description: 'Business logo URL',
    example: 'https://example.com/logo.png',
  })
  @IsString()
  @IsOptional()
  logo_url?: string;

  @ApiPropertyOptional({
    description: 'Business cover image URL',
    example: 'https://example.com/cover.png',
  })
  @IsString()
  @IsOptional()
  cover_image_url?: string;
}
