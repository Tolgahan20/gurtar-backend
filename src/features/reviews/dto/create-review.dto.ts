import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    description: 'Business ID to review',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  business_id!: string;

  @ApiProperty({
    description: 'Review content',
    example: 'Great food and excellent service!',
    minLength: 10,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  content!: string;
}
