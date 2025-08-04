import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { LeaderboardType } from './leaderboard-type.enum';

@Entity('leaderboard_snapshots')
export class LeaderboardSnapshot extends BaseEntity {
  @ApiProperty({
    description: 'Type of leaderboard',
    enum: LeaderboardType,
    example: LeaderboardType.WEEKLY_CO2,
  })
  @Column({
    type: 'enum',
    enum: LeaderboardType,
  })
  type!: LeaderboardType;

  @ApiProperty({
    description: 'Value for ranking (CO2 saved, order count, etc.)',
    example: 25.5,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value!: number;

  @ApiProperty({
    description: 'Rank position in the leaderboard',
    example: 1,
  })
  @Column()
  rank!: number;

  @ApiProperty({
    description: 'When the snapshot was taken',
    example: '2024-06-01T00:00:00Z',
  })
  @Column({ type: 'timestamp with time zone' })
  snapshot_date!: Date;

  @ApiProperty({
    description: 'The user in the leaderboard',
    type: () => User,
  })
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
