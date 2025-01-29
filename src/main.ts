import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ValidationConfig } from './config/validation.config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe(ValidationConfig));
  app.enableCors();

  // swagger config
  const config = new DocumentBuilder()
    .setTitle('Alten Ecommerce API')
    .setDescription('The Alten Ecommerce API description')
    .setVersion('1.0')
    .addTag('Alten')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.BACKEND_PORT ?? 8000);
}
bootstrap();
