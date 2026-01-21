import { Entity, Column, PrimaryColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { UserRole } from '../APP.Shared/enums/user-role.enum';
import { AdminSession } from './admin-session.entity';

@Entity('admin')
export class Admin {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'passwordHash' })
  passwordHash!: string;

  @Column({
    type: 'enum',
    enum: UserRole as any, // Type assertion to avoid strict mode issues
    default: UserRole.SUPER_ADMIN,
  })
  role!: UserRole;

  @Column({ name: 'otpHash', nullable: true })
  otpHash?: string;

  @Column({ name: 'otpExpiresAt', type: 'timestamp', nullable: true })
  otpExpiresAt?: Date;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt!: Date;

  @OneToMany(() => AdminSession, (session) => session.admin, { cascade: true })
  adminSessions!: AdminSession[];
}
