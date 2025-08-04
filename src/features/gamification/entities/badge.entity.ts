import { Entity, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { BadgeTriggerType } from './badge-trigger-type.enum';

@Entity('badges')
export class Badge extends BaseEntity {
  @ApiProperty({
    description: 'Badge name',
    example: 'First Saver',
  })
  @Column()
  name!: string;

  @ApiProperty({
    description: 'Badge description',
    example: 'Place your first order and start saving food!',
  })
  @Column()
  description!: string;

  @ApiProperty({
    description: 'Badge icon URL or emoji',
    example: '🥇',
  })
  @Column()
  icon!: string;

  @ApiProperty({
    description: 'Type of trigger for earning the badge',
    enum: BadgeTriggerType,
    example: BadgeTriggerType.ORDER_COUNT,
  })
  @Column({
    type: 'enum',
    enum: BadgeTriggerType,
  })
  trigger_type!: BadgeTriggerType;

  @ApiProperty({
    description: 'Value required to trigger the badge',
    example: 1,
  })
  @Column()
  trigger_value!: number;
}
