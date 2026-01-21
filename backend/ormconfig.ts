import { DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

// Load environment variables
config();

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['src/APP.Entity/**/*.entity.ts'],
  migrations: ['src/migrations/**/*.ts'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.DATABASE_URL?.includes('sslmode=require') || 
       process.env.DATABASE_URL?.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false,
};

export default dataSourceOptions;
