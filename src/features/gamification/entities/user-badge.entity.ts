import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Badge } from './badge.entity';

@Entity('user_badges')
export class UserBadge extends BaseEntity {
  @ApiProperty({
    description: 'When the badge was earned',
    example: '2024-06-01T16:00:00Z',
  })
  @Column({ type: 'timestamp with time zone' })
  earned_at!: Date;

  @ApiProperty({
    description: 'The user who earned the badge',
    type: () => User,
  })
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ApiProperty({
    description: 'The earned badge',
    type: () => Badge,
  })
  @ManyToOne(() => Badge, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'badge_id' })
  badge!: Badge;
}
