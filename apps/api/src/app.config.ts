import { ValidationPipe, type INestApplication } from '@nestjs/common';

export function configureApp(app: INestApplication): void {
  app.enableCors({
    origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}
