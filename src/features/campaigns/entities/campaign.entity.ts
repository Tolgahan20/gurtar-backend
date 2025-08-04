import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Business } from '../../businesses/entities/business.entity';
import { DiscountType } from './discount-type.enum';

@Entity('campaigns')
export class Campaign extends BaseEntity {
  @ApiProperty({
    description: 'Campaign title',
    example: 'Summer Sale',
  })
  @Column()
  title!: string;

  @ApiProperty({
    description: 'Campaign description',
    example: 'Get amazing discounts on all summer packages!',
  })
  @Column()
  description!: string;

  @ApiProperty({
    description: 'Type of discount',
    enum: DiscountType,
    example: DiscountType.PERCENTAGE,
  })
  @Column({
    type: 'enum',
    enum: DiscountType,
  })
  discount_type!: DiscountType;

  @ApiProperty({
    description: 'Value of the discount (percentage or fixed amount)',
    example: 20,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  discount_value!: number;

  @ApiProperty({
    description: 'Campaign start date',
    example: '2024-06-01T00:00:00Z',
  })
  @Column({ type: 'timestamp with time zone' })
  start_date!: Date;

  @ApiProperty({
    description: 'Campaign end date',
    example: '2024-08-31T23:59:59Z',
  })
  @Column({ type: 'timestamp with time zone' })
  end_date!: Date;

  @ApiProperty({
    description: 'Whether the campaign is active',
    example: true,
  })
  @Column({ default: true })
  is_active!: boolean;

  @ApiProperty({
    description: 'The business running the campaign',
    type: () => Business,
  })
  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'business_id' })
  business!: Business;
}
