import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateContactStatusDto {
  @ApiProperty({
    description: 'Whether the message has been resolved',
    example: true,
  })
  @IsBoolean()
  is_resolved!: boolean;
}
