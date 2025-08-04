import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateBusinessDto {
  @ApiProperty({
    description: 'Business name',
    example: 'Delicious Bakery',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Business description',
    example: 'A local bakery specializing in fresh bread and pastries',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    description: 'Business phone number',
    example: '+90 533 123 4567',
  })
  @IsString()
  @IsNotEmpty()
  phone_number!: string;

  @ApiProperty({
    description: 'Business email',
    example: 'contact@deliciousbakery.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    description: 'Business address',
    example: '123 Main Street',
  })
  @IsString()
  @IsNotEmpty()
  address!: string;

  @ApiProperty({
    description: 'Business city',
    example: 'Nicosia',
  })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty({
    description: 'Business country',
    example: 'North Cyprus',
  })
  @IsString()
  @IsNotEmpty()
  country!: string;

  @ApiProperty({
    description: 'Business postal code',
    example: '99010',
  })
  @IsString()
  @IsNotEmpty()
  postal_code!: string;

  @ApiProperty({
    description: 'Business category ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  category_id!: string;

  @ApiProperty({
    description: 'Business logo URL',
    example: 'https://example.com/logo.png',
  })
  @IsString()
  @IsNotEmpty()
  logo_url!: string;

  @ApiProperty({
    description: 'Business cover image URL',
    example: 'https://example.com/cover.png',
  })
  @IsString()
  @IsNotEmpty()
  cover_image_url!: string;
}
