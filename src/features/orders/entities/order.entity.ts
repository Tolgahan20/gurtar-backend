import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Package } from '../../packages/entities/package.entity';
import { OrderStatus } from './order-status.enum';

@Entity('orders')
export class Order extends BaseEntity {
  @ApiProperty({
    description: 'Order quantity',
    example: 2,
    minimum: 1,
  })
  @Column()
  quantity!: number;

  @ApiProperty({
    description: 'Total price',
    example: 59.98,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_price!: number;

  @ApiProperty({
    description: 'Money saved compared to original price',
    example: 140.02,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  money_saved!: number;

  @ApiProperty({
    description: 'CO2 emissions saved in kilograms',
    example: 2.5,
  })
  @Column({ type: 'decimal', precision: 5, scale: 2 })
  co2_saved_kg!: number;

  @ApiProperty({
    description: 'Order status',
    enum: OrderStatus,
    example: OrderStatus.PENDING,
  })
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status!: OrderStatus;

  @ApiProperty({
    description: 'The user who placed the order',
    type: () => User,
  })
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ApiProperty({
    description: 'The ordered package',
    type: () => Package,
  })
  @ManyToOne(() => Package, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'package_id' })
  package!: Package;

  @ApiProperty({
    description: 'The worker who handled the pickup',
    type: () => User,
    nullable: true,
  })
  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'picked_up_by_worker_id' })
  picked_up_by_worker?: User;
}
