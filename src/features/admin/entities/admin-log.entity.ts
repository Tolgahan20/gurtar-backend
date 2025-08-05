import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

export enum AdminActionType {
  SUSPEND_BUSINESS = 'suspend_business',
  DELETE_USER = 'delete_user',
  BAN_USER = 'ban_user',
  VERIFY_BUSINESS = 'verify_business',
  RESOLVE_CONTACT = 'resolve_contact',
}

export enum AdminTargetType {
  BUSINESS = 'business',
  USER = 'user',
  ORDER = 'order',
  CONTACT = 'contact',
}

@Entity('admin_logs')
export class AdminLog extends BaseEntity {
  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn()
  admin!: User;

  @Column({
    type: 'enum',
    enum: AdminActionType,
  })
  action_type!: AdminActionType;

  @Column({
    type: 'enum',
    enum: AdminTargetType,
  })
  target_type!: AdminTargetType;

  @Column()
  target_id!: string;

  @Column()
  description!: string;
}
