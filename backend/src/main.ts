// Load environment variables FIRST, before any other imports
import * as dotenv from 'dotenv';
dotenv.config();

// CRITICAL: Set server timezone to UTC to ensure all dates are stored correctly
// This ensures TypeORM @CreateDateColumn and @UpdateDateColumn store UTC times
process.env.TZ = 'UTC';

import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  // CORS configuration - restrict to specific origins in production
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : process.env.NODE_ENV === 'production'
    ? ['https://yourdomain.com'] // Replace with your production domain
    : ['http://localhost:3000', 'http://localhost:3001']; // Development origins

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  const logger = new (require('@nestjs/common').Logger)('Bootstrap');
  logger.log('🚀 Starting League Dhor Backend...');
  logger.debug(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.debug(`Database URL: ${process.env.DATABASE_URL ? 'Set (using pooler endpoint)' : 'Not set'}`);
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('-pooler')) {
    logger.warn('⚠️  DATABASE_URL does not use pooler endpoint. For Neon PostgreSQL, use pooler endpoint for better connection handling.');
  }
  logger.debug(`Resend API Key: ${process.env.RESEND_API_KEY ? 'Set' : 'Not set'}`);
  logger.debug(`ImageKit Config: ${process.env.IMAGEKIT_PUBLIC_KEY ? 'Set' : 'Not set'}`);

  // Global response transformation
  app.useGlobalInterceptors(new TransformInterceptor());
  
  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('League Dhor API')
    .setDescription('API documentation for League Dhor crime reporting platform')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('persons', 'Person management')
    .addTag('crimes', 'Crime reporting')
    .addTag('users', 'User management')
    .addTag('upload', 'File upload')
    .addTag('health', 'Health check')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Backend running on http://localhost:${port}`);
  console.log(`📚 Swagger docs available at http://localhost:${port}/api`);
  console.log(`💚 Health check: http://localhost:${port}/health`);
}

// For serverless (Vercel)
export default async function handler(req: any, res: any) {
  const app = await NestFactory.create(AppModule);
  await app.init();
  const instance = app.getHttpAdapter().getInstance();
  return instance(req, res);
}

// For local development
if (process.env.NODE_ENV !== 'production' && require.main === module) {
  bootstrap();
}
