import './load-env';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression = require('compression');
import helmet from 'helmet';

import { AppModule } from './app.module';
import { validatePortalVendorJwtSecrets } from './common/utils/jwt-secrets.util';

function parseCorsOrigins(raw: string | undefined): string[] | undefined {
  if (!raw?.trim()) {
    return undefined;
  }
  const origins = raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  return origins.length > 0 ? origins : undefined;
}

function isSwaggerEnabled(config: ConfigService): boolean {
  const flag = config.get<string>('SWAGGER_ENABLED');
  if (flag === 'true') {
    return true;
  }
  if (flag === 'false') {
    return false;
  }
  return config.get<string>('NODE_ENV') !== 'production';
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  validatePortalVendorJwtSecrets(config);

  const http = app.getHttpAdapter().getInstance();
  if (typeof http?.set === 'function') {
    http.set('trust proxy', 1);
  }

  const port = config.get<number>('PORT') || 3000;
  const publicUrl = config.get<string>('PUBLIC_API_URL') || `http://localhost:${port}`;
  const nodeEnv = config.get<string>('NODE_ENV') ?? 'development';

  app.use(helmet());
  app.use(compression());

  const corsOrigins = parseCorsOrigins(config.get<string>('CORS_ORIGINS'));
  if (corsOrigins) {
    app.enableCors({ origin: corsOrigins, credentials: true });
  } else if (nodeEnv !== 'production') {
    app.enableCors();
  } else {
    app.enableCors({ origin: false });
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  if (isSwaggerEnabled(config)) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('KingFisher Wings ERP API')
      .setDescription('KingFisher Wings ERP Backend')
      .setVersion('1.0')
      .addServer(publicUrl)
      .addBearerAuth()
      .addApiKey({ type: 'apiKey', name: 'X-Cron-Secret', in: 'header' }, 'cron-secret')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);
    console.log(`Swagger available at /docs`);
  }

  // Render requires binding to 0.0.0.0
  await app.listen(port, '0.0.0.0');

  console.log(`Server is running on port ${port}`);
}

bootstrap();
