import { NestFactory } from '@nestjs/core';
import { AppModule } from './bootstrap-module/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ValidationConfig } from './config/validation.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe(ValidationConfig));
  app.enableCors();

  await app.listen(process.env.BACKEND_PORT ?? 8000);
}
bootstrap();
