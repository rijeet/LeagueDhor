import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from '../../APP.Entity/user.entity';
import { Person } from '../../APP.Entity/person.entity';
import { Crime } from '../../APP.Entity/crime.entity';
import { Admin } from '../../APP.Entity/admin.entity';
import { UserSession } from '../../APP.Entity/user-session.entity';
import { AdminSession } from '../../APP.Entity/admin-session.entity';

// Load environment variables
config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Person, Crime, Admin, UserSession, AdminSession],
  migrations: ['src/migrations/**/*.ts'],
  synchronize: false, // Never use synchronize in production
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.DATABASE_URL?.includes('sslmode=require') || 
       process.env.DATABASE_URL?.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false,
});
