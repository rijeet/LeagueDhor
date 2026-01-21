import { Entity, Column, PrimaryColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { Crime } from './crime.entity';

@Entity('Person')
export class Person {
  @PrimaryColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ name: 'imageUrl', nullable: true })
  imageUrl?: string;

  @Column({ unique: true })
  slug!: string;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt!: Date;

  @OneToMany(() => Crime, (crime) => crime.person, { cascade: true })
  crimes!: Crime[];
}
