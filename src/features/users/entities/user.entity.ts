import { Entity, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserRole } from './user-role.enum';
import { Gender } from './gender.enum';
import { EcoLevel } from './eco-level.enum';

@Entity('users')
export class User extends BaseEntity {
  @ApiProperty({
    description: 'User email',
    example: 'john@example.com',
  })
  @Column({ unique: true })
  email!: string;

  @ApiProperty({
    description: 'Hashed password (nullable if using OAuth)',
    example: 'hashedPassword123',
    nullable: true,
  })
  @Column({ nullable: true })
  password_hash?: string;

  @ApiProperty({
    description: 'Google OAuth ID (nullable)',
    example: '123456789',
    nullable: true,
  })
  @Column({ nullable: true })
  google_id?: string;

  @ApiProperty({
    description: 'Full name',
    example: 'John Doe',
  })
  @Column()
  full_name!: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+1234567890',
  })
  @Column()
  phone_number!: string;

  @ApiProperty({
    description: 'Profile image URL',
    example: 'https://example.com/images/profile.jpg',
  })
  @Column()
  profile_image_url!: string;

  @ApiProperty({
    description: 'Birthday',
    example: '1990-01-01',
    nullable: true,
  })
  @Column({ type: 'date', nullable: true })
  birthday?: Date;

  @ApiProperty({
    description: 'Gender',
    enum: Gender,
    example: Gender.MALE,
    nullable: true,
  })
  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender?: Gender;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    example: UserRole.USER,
  })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role!: UserRole;

  @ApiProperty({
    description: 'Whether the user has premium features',
    example: false,
  })
  @Column({ default: false })
  is_premium!: boolean;

  @ApiProperty({
    description: 'Whether the user is banned',
    example: false,
  })
  @Column({ default: false })
  is_banned!: boolean;

  @ApiProperty({
    description: 'Total eco score based on CO2 savings',
    example: 75,
  })
  @Column({ default: 0 })
  eco_score!: number;

  @ApiProperty({
    description: 'Eco level based on total CO2 savings',
    enum: EcoLevel,
    example: EcoLevel.SAVER,
  })
  @Column({
    type: 'enum',
    enum: EcoLevel,
    default: EcoLevel.BEGINNER,
  })
  eco_level!: EcoLevel;

  @ApiProperty({
    description: 'Total CO2 saved in kilograms',
    example: 25.5,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_co2_saved!: number;

  @ApiProperty({
    description: 'Total money saved',
    example: 150.75,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_money_saved!: number;

  @ApiProperty({
    description: 'Total number of orders completed',
    example: 10,
  })
  @Column({ default: 0 })
  total_orders!: number;
}
