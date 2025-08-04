import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  Matches,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { Gender } from '../../users/entities/gender.enum';

export class RegisterDto {
  @ApiProperty({
    description: 'Email address',
    example: 'user@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Password',
    example: 'Password123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password is too weak',
  })
  password!: string;

  @ApiProperty({
    description: 'Full name',
    example: 'John Doe',
  })
  @IsString()
  full_name!: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+90 555 123 4567',
  })
  @IsString()
  phone_number!: string;

  @ApiProperty({
    description: 'Profile image URL',
    example: 'https://example.com/profile.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  profile_image_url?: string;

  @ApiProperty({
    description: 'Birthday',
    example: '1990-01-01',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  birthday?: string;

  @ApiProperty({
    description: 'Gender',
    enum: Gender,
    example: Gender.MALE,
    required: false,
  })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;
}
