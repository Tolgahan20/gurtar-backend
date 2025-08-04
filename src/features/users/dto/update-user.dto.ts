import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEmail,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { Gender } from '../entities/gender.enum';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  full_name?: string;

  @ApiProperty({
    description: 'Email address',
    example: 'john@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+90 555 123 4567',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone_number?: string;

  @ApiProperty({
    description: 'Profile image URL',
    example: 'https://example.com/profile.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  profile_image_url?: string;

  @ApiProperty({
    description: 'Birthday',
    example: '1990-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  birthday?: string;

  @ApiProperty({
    description: 'Gender',
    enum: Gender,
    example: 'male',
    required: false,
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;
}
