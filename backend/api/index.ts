// Vercel serverless function entry point
// This wraps the NestJS application for serverless deployment
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';

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
    
    await appInstance.init();
  }
  
  const instance = appInstance.getHttpAdapter().getInstance();
  return instance(req, res);
}
