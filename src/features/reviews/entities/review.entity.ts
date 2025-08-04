import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Business } from '../../businesses/entities/business.entity';

@Entity('reviews')
export class Review extends BaseEntity {
  @ApiProperty({
    description: 'Review content',
    example: 'Great food and excellent service!',
  })
  @Column({ type: 'text' })
  content!: string;

  @ApiProperty({
    description: 'The user who wrote the review',
    type: () => User,
  })
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ApiProperty({
    description: 'The reviewed business',
    type: () => Business,
  })
  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'business_id' })
  business!: Business;
}
