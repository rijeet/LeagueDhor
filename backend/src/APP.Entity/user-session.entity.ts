import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_sessions')
export class UserSession {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'userId' })
  @Index()
  userId!: string;

  @Column({ name: 'refreshToken', unique: true })
  @Index()
  refreshToken!: string;

  @Column({ name: 'deviceInfo', nullable: true })
  deviceInfo?: string;

  @Column({ name: 'ipAddress', nullable: true })
  ipAddress?: string;

  @Column({ name: 'userAgent', nullable: true })
  userAgent?: string;

  @Column({ name: 'expiresAt', type: 'timestamp' })
  expiresAt!: Date;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt!: Date;

  @Column({ name: 'lastUsedAt', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastUsedAt!: Date;

  @ManyToOne(() => User, (user) => user.userSessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;
}
