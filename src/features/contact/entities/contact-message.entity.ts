import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('contact_messages')
export class ContactMessage extends BaseEntity {
  @ApiProperty({
    description: 'Name of the sender',
    example: 'John Doe',
  })
  @Column()
  name!: string;

  @ApiProperty({
    description: 'Email of the sender',
    example: 'john@example.com',
  })
  @Column()
  email!: string;

  @ApiProperty({
    description: 'Subject of the message',
    example: 'Question about business verification',
  })
  @Column()
  subject!: string;

  @ApiProperty({
    description: 'Content of the message',
    example:
      'I would like to know more about the business verification process...',
  })
  @Column({ type: 'text' })
  message!: string;

  @ApiProperty({
    description: 'Whether the message has been resolved',
    example: false,
  })
  @Column({ default: false })
  is_resolved!: boolean;

  @ApiProperty({
    description: 'The user who sent the message (if authenticated)',
    type: () => User,
    nullable: true,
  })
  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;
}
