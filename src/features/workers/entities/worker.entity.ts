import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Business } from '../../businesses/entities/business.entity';

@Entity('workers')
export class Worker extends BaseEntity {
  @ApiProperty({
    description: 'The user assigned as worker',
    type: () => User,
  })
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ApiProperty({
    description: 'The business the worker belongs to',
    type: () => Business,
  })
  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'business_id' })
  business!: Business;

  @ApiProperty({
    description: 'Whether the worker is active',
    example: true,
  })
  @Column({ type: 'boolean', default: true })
  is_active!: boolean;
}
