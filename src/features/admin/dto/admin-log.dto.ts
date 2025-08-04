import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AdminLogDto {
  @ApiProperty({
    description: 'Reason for the admin action',
    example: 'Multiple violations of terms of service',
  })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}
