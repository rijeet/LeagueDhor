import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Pool, neonConfig } from '@neondatabase/serverless';
import * as ws from 'ws';

@Injectable()
export class NeonService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NeonService.name);
  private pool: Pool;
  private isConnected = false;

  constructor() {
    // Configure WebSocket for Node.js environment
    neonConfig.webSocketConstructor = ws;
    
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      this.logger.error('❌ DATABASE_URL is not set in environment variables');
      this.logger.warn('Application will continue but database operations will fail');
      // Create a dummy pool that will fail on first use
      this.pool = new Pool({ connectionString: 'postgresql://dummy:dummy@localhost:5432/dummy' });
      return;
    }

    // Create connection pool
    this.pool = new Pool({ connectionString: databaseUrl });

    // Log successful configuration
    if (databaseUrl.includes('neon.tech')) {
      this.logger.debug('Neon PostgreSQL configured');
    }
  }

  async onModuleInit() {
    this.logger.log('Connecting to database...');
    await this.connectWithRetry();
  }

  async onModuleDestroy() {
    this.logger.log('Disconnecting from database...');
    try {
      await this.pool.end();
      this.isConnected = false;
      this.logger.log('✅ Database disconnected');
    } catch (error: any) {
      this.logger.error(`Error disconnecting from database: ${error.message}`, error.stack);
    }
  }

  private async connectWithRetry(maxRetries = 5, delay = 2000): Promise<void> {
    const dbUrl = process.env.DATABASE_URL;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Test connection with a simple query
        const result = await this.pool.query('SELECT 1 as test');
        if (result.rows[0]?.test === 1) {
          this.isConnected = true;
          this.logger.log('✅ Database connected successfully');
          if (dbUrl?.includes('neon.tech')) {
            this.logger.debug('Using Neon PostgreSQL serverless driver');
          }
          return;
        }
      } catch (error: any) {
        this.logger.warn(`Connection attempt ${attempt}/${maxRetries} failed: ${error.message}`);
        if (attempt < maxRetries) {
          this.logger.debug(`Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 1.5; // Exponential backoff
        } else {
          this.logger.error(`❌ Database connection failed after ${maxRetries} attempts: ${error.message}`, error.stack);
          throw error;
        }
      }
    }
  }

  /**
   * Execute a SQL query and return the results
   */
  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    try {
      // Only log queries in development mode, and sanitize params to avoid logging sensitive data
      if (process.env.NODE_ENV === 'development') {
        const sanitizedParams = params.map((p) => {
          if (typeof p === 'string' && p.length > 50) {
            return `${p.substring(0, 50)}... (truncated)`;
          }
          // Don't log password hashes or tokens
          if (typeof p === 'string' && (p.includes('$argon2') || p.length > 100)) {
            return '[REDACTED]';
          }
          return p;
        });
        this.logger.debug(`Query: ${sql} | Params: ${JSON.stringify(sanitizedParams)}`);
      }
      
      const result = await this.pool.query(sql, params);
      return result.rows as T[];
    } catch (error: any) {
      this.logger.error(`Query error: ${error.message}`, error.stack);
      // Don't log full SQL in production to avoid information disclosure
      if (process.env.NODE_ENV === 'development') {
        this.logger.debug(`Failed query: ${sql}`);
      }
      throw error;
    }
  }

  /**
   * Execute a SQL query and return the first row
   */
  async queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const results = await this.query<T>(sql, params);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Execute a transaction with multiple queries
   */
  async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error: any) {
      await client.query('ROLLBACK');
      this.logger.error(`Transaction error: ${error.message}`, error.stack);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get the underlying pool for advanced usage
   */
  getPool(): Pool {
    return this.pool;
  }
}
