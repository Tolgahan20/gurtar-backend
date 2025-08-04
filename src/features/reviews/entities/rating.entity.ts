import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Business } from '../../businesses/entities/business.entity';

@Entity('ratings')
export class Rating extends BaseEntity {
  @ApiProperty({
    description: 'Rating value (1-5)',
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  @Column({ type: 'decimal', precision: 2, scale: 1 })
  rating!: number;

  @ApiProperty({
    description: 'The user who rated',
    type: () => User,
  })
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ApiProperty({
    description: 'The rated business',
    type: () => Business,
  })
  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'business_id' })
  business!: Business;
}
