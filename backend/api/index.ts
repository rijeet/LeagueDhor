// Vercel serverless function entry point
// This wraps the NestJS application for serverless deployment
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

let appInstance: any = null;

export default async function handler(req: any, res: any) {
  if (!appInstance) {
    appInstance = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log'],
    });
    
    // Enable CORS
    appInstance.enableCors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });
    
    // Global response transformation
    appInstance.useGlobalInterceptors(new TransformInterceptor());
    
    // Global exception filter
    appInstance.useGlobalFilters(new HttpExceptionFilter());
    
    // Global validation pipe
    appInstance.useGlobalPipes(
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

    const document = SwaggerModule.createDocument(appInstance, config);
    SwaggerModule.setup('api', appInstance, document);
    
    await appInstance.init();
  }
  
  const instance = appInstance.getHttpAdapter().getInstance();
  return instance(req, res);
}
