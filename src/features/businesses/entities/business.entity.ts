import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity('businesses')
export class Business extends BaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  owner!: User;

  @Column()
  name!: string;

  @Column()
  description!: string;

  @Column()
  phone_number!: string;

  @Column()
  email!: string;

  @Column()
  address!: string;

  @Column()
  city!: string;

  @Column()
  country!: string;

  @Column()
  postal_code!: string;

  @ManyToOne(() => Category, { onDelete: 'RESTRICT' })
  @JoinColumn()
  category!: Category;

  @Column({ nullable: true })
  logo_url?: string;

  @Column({ nullable: true })
  cover_image_url?: string;

  @Column({ default: false })
  is_verified!: boolean;

  @Column({ default: true })
  is_active!: boolean;
}
