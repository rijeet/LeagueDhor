import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Admin } from './admin.entity';

@Entity('admin_sessions')
export class AdminSession {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'adminId' })
  @Index()
  adminId!: string;

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

  @ManyToOne(() => Admin, (admin) => admin.adminSessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'adminId' })
  admin!: Admin;
}
