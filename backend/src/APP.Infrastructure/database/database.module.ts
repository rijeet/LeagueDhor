import { Module, Global, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { User } from '../../APP.Entity/user.entity';
import { Person } from '../../APP.Entity/person.entity';
import { Crime } from '../../APP.Entity/crime.entity';
import { Admin } from '../../APP.Entity/admin.entity';
import { UserSession } from '../../APP.Entity/user-session.entity';
import { AdminSession } from '../../APP.Entity/admin-session.entity';

// Ensure dotenv is loaded before module initialization
config();

const logger = new Logger('DatabaseModule');

@Global()
@Module({
  imports: [
    // Load environment variables first
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      // dotenv.config() is already called at the top of this file as fallback
    }),
    // Use factory function to ensure env vars are loaded
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // Try ConfigService first, then fallback to process.env
        const databaseUrl = configService.get<string>('DATABASE_URL') || process.env.DATABASE_URL;
        
        if (!databaseUrl) {
          const errorMsg = 
            '❌ DATABASE_URL is not set in environment variables.\n' +
            'Please check:\n' +
            '  1. Your .env file exists in the backend directory\n' +
            '  2. DATABASE_URL is set in the .env file\n' +
            '  3. The .env file format is: DATABASE_URL=postgresql://user:password@host:port/database\n' +
            '  4. For Neon PostgreSQL, use the pooler endpoint: postgresql://user:password@host-pooler.neon.tech/database?sslmode=require';
          
          logger.error(errorMsg);
          throw new Error('DATABASE_URL is required but not set');
        }

        const isNeon = databaseUrl.includes('neon.tech') || databaseUrl.includes('sslmode=require');
        const nodeEnv = configService.get<string>('NODE_ENV') || process.env.NODE_ENV || 'development';
        
        logger.log(`🔌 Connecting to database...`);
        logger.debug(`Database URL: ${databaseUrl.substring(0, 30)}... (hidden for security)`);
        logger.debug(`Environment: ${nodeEnv}`);
        logger.debug(`SSL: ${isNeon ? 'Enabled (Neon)' : 'Disabled'}`);
        
        return {
          type: 'postgres',
          url: databaseUrl,
          // Use direct entity imports (works with NestJS dependency injection)
          entities: [User, Person, Crime, Admin, UserSession, AdminSession],
          // Migrations should only be loaded via CLI, not at runtime
          // Use: npm run migration:run (via data-source.ts)
          migrations: [],
          synchronize: false, // Always false - use migrations instead
          logging: nodeEnv === 'development',
          ssl: isNeon ? { rejectUnauthorized: false } : false,
          // Disable auto-loading entities to avoid strict mode issues
          autoLoadEntities: false,
          extra: {
            max: 10, // Maximum number of connections in the pool
            connectionTimeoutMillis: 5000,
          },
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Person, Crime, Admin, UserSession, AdminSession]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
