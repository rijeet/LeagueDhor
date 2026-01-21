import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { VerificationStatus } from '../APP.Shared/enums/verification-status.enum';
import { Person } from './person.entity';

@Entity('Crime')
export class Crime {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'personId' })
  personId!: string;

  @Column({ nullable: true })
  location?: string;

  @Column('text', { array: true, name: 'crimeImages' })
  crimeImages!: string[];

  @Column('text', { array: true })
  sources!: string[];

  @Column({ name: 'profileUrl', nullable: true })
  profileUrl?: string;

  @Column('jsonb', { nullable: true })
  tags?: string[];

  @Column({
    type: 'enum',
    enum: VerificationStatus as any, // Type assertion to avoid strict mode issues
    name: 'verificationStatus',
    default: VerificationStatus.UNVERIFIED,
  })
  verificationStatus!: VerificationStatus;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt!: Date;

  @ManyToOne(() => Person, (person) => person.crimes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'personId' })
  person!: Person;
}
