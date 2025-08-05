import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Business } from '../../businesses/entities/business.entity';

@Entity('categories')
export class Category extends BaseEntity {
  @ApiProperty({
    description: 'Category name',
    example: 'Restaurant',
  })
  @Column()
  name!: string;

  @ApiProperty({
    description: 'Category description',
    example: 'Restaurants and dining establishments',
  })
  @Column()
  description!: string;

  @ApiProperty({
    description: 'Parent category ID (null for top-level categories)',
    example: null,
    nullable: true,
  })
  @Column({ type: 'uuid', nullable: true })
  parent_id!: string | null;

  @ApiProperty({
    description: 'Parent category',
    type: () => Category,
    nullable: true,
  })
  @ManyToOne(() => Category, (category) => category.subcategories)
  @JoinColumn({ name: 'parent_id' })
  parent?: Category;

  @ApiProperty({
    description: 'Subcategories',
    type: () => [Category],
  })
  @OneToMany(() => Category, (category) => category.parent)
  subcategories?: Category[];

  @ApiProperty({
    description: 'Businesses in this category',
    type: () => [Business],
  })
  @OneToMany(() => Business, (business) => business.category)
  businesses!: Business[];
}
