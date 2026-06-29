// src/main.ts

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  const port = config.get<number>('PORT') || 3000;

  app.enableCors();

  app.useGlobalPipes(

    new ValidationPipe({

      whitelist: true,

      transform: true,

      forbidNonWhitelisted: true,

    }),

  );

  const swaggerConfig = new DocumentBuilder()

    .setTitle('Fresa Gold ERP API')

    .setDescription('Freight ERP Backend')

    .setVersion('1.0')

    .addBearerAuth()

    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, document);

  await app.listen(port);

  console.log(`Server running on http://localhost:${port}`);

  console.log(`Swagger: http://localhost:${port}/docs`);

}

bootstrap();