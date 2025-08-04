import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('token_blacklist')
export class TokenBlacklist extends BaseEntity {
  @Column()
  token!: string;

  @Column({ type: 'timestamp' })
  expires_at!: Date;
}
