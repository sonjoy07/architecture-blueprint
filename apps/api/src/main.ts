import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SecureLogger } from './common/logger/secure-logger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const secureLogger = new SecureLogger();

  const app = await NestFactory.create(AppModule, {
    logger: secureLogger,
  });

  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Health endpoint for Kubernetes liveness/readiness probes
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/health', (req: any, res: any) => {
    res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  secureLogger.log(`Enterprise Knowledge Copilot API listening on port ${port}`, 'Bootstrap');
}

bootstrap();
