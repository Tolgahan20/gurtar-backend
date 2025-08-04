import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('email_verifications')
export class EmailVerification extends BaseEntity {
  @ApiProperty({
    description: 'Verification token',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column()
  token!: string;

  @ApiProperty({
    description: 'Token expiration date',
    example: '2024-06-01T16:00:00Z',
  })
  @Column({ type: 'timestamp with time zone' })
  expires_at!: Date;

  @ApiProperty({
    description: 'Whether the email has been verified',
    example: false,
  })
  @Column({ default: false })
  is_verified!: boolean;

  @ApiProperty({
    description: 'When the email was verified',
    example: '2024-06-01T16:00:00Z',
    nullable: true,
  })
  @Column({ type: 'timestamp with time zone', nullable: true })
  verified_at?: Date;

  @ApiProperty({
    description: 'IP address used for verification',
    example: '192.168.1.1',
    nullable: true,
  })
  @Column({ nullable: true })
  verification_ip?: string;

  @ApiProperty({
    description: 'User agent used for verification',
    example: 'Mozilla/5.0 ...',
    nullable: true,
  })
  @Column({ nullable: true })
  verification_user_agent?: string;

  @ApiProperty({
    description: 'The user this verification belongs to',
    type: () => User,
  })
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
