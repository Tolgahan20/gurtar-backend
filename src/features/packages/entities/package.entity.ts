import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Business } from '../../businesses/entities/business.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity('packages')
export class Package extends BaseEntity {
  @ApiProperty({
    description: 'Package name',
    example: 'Surprise Box - Bakery',
  })
  @Column()
  name!: string;

  @ApiProperty({
    description: 'Package description',
    example: 'A delicious mix of our fresh bakery items',
  })
  @Column()
  description!: string;

  @ApiProperty({
    description: 'Package image URL',
    example: 'https://example.com/images/surprise-box.jpg',
  })
  @Column()
  image_url!: string;

  @ApiProperty({
    description: 'Original price before discount',
    example: 100.0,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  original_price!: number;

  @ApiProperty({
    description: 'Discounted surprise box price',
    example: 35.0,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @ApiProperty({
    description: 'Estimated weight of food in kilograms',
    example: 0.5,
  })
  @Column({ type: 'decimal', precision: 5, scale: 2 })
  estimated_weight!: number;

  @ApiProperty({
    description: 'Number of packages available',
    example: 5,
    minimum: 0,
  })
  @Column()
  quantity_available!: number;

  @ApiProperty({
    description: 'Pickup start time',
    example: '2024-06-01T16:00:00Z',
  })
  @Column({ type: 'timestamp with time zone' })
  pickup_start_time!: Date;

  @ApiProperty({
    description: 'Pickup end time',
    example: '2024-06-01T18:00:00Z',
  })
  @Column({ type: 'timestamp with time zone' })
  pickup_end_time!: Date;

  @ApiProperty({
    description: 'List of allergens',
    example: ['nuts', 'dairy'],
    type: [String],
  })
  @Column({ type: 'text', array: true, default: '{}' })
  allergens!: string[];

  @ApiProperty({
    description: 'Whether the package is active',
    example: true,
  })
  @Column({ default: true })
  is_active!: boolean;

  @ApiProperty({
    description: 'The business offering this package',
    type: () => Business,
  })
  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'business_id' })
  business!: Business;

  @ApiProperty({
    description: 'The category of this package',
    type: () => Category,
  })
  @ManyToOne(() => Category, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category!: Category;

  @ApiProperty({
    description: 'The subcategory of this package (optional)',
    type: () => Category,
    nullable: true,
  })
  @ManyToOne(() => Category, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'subcategory_id' })
  subcategory?: Category;
}
