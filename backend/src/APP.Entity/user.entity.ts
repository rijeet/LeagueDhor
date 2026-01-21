import { Entity, Column, PrimaryColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { UserRole } from '../APP.Shared/enums/user-role.enum';
import { UserSession } from './user-session.entity';

@Entity('User')
export class User {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'anonymousName', nullable: true })
  anonymousName?: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'passwordHash' })
  passwordHash!: string;

  @Column({
    type: 'enum',
    enum: UserRole as any, // Type assertion to avoid strict mode issues
    default: UserRole.USER,
  })
  role!: UserRole;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt!: Date;

  @OneToMany(() => UserSession, (session) => session.user, { cascade: true })
  userSessions!: UserSession[];
}
