// src/main.ts
import { NestFactory, Reflector } from '@nestjs/core';
import {
  ValidationPipe,
  Logger,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as helmet from 'helmet';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const config = app.get(ConfigService);
  const port = config.get<number>('app.port', 3000);
  const apiPrefix = config.get<string>('app.apiPrefix', 'api/v1');
  const nodeEnv = config.get<string>('app.nodeEnv', 'development');
  const corsOrigins = config.get<string[]>('app.corsOrigins', [
    'http://localhost:5173',
  ]);

  // ── Security middleware ──────────────────────────────────────
  app.use(
    (helmet as unknown as typeof helmet.default)({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
    }),
  );
  app.use(compression());
  app.use(cookieParser());

  // ── CORS ──────────────────────────────────────────────────────
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'x-tenant-id',
      'x-request-id',
    ],
    exposedHeaders: ['x-request-id'],
  });

  // ── Global prefix ─────────────────────────────────────────────
  app.setGlobalPrefix(apiPrefix, {
    exclude: ['health', '/'],
  });

  // ── Global validation pipe ────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      stopAtFirstError: false,
    }),
  );

  // ── Global interceptors ───────────────────────────────────────
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(reflector),
    new ResponseInterceptor(),
    new AuditInterceptor(),
  );

  // ── Global exception filter ───────────────────────────────────
  app.useGlobalFilters(new HttpExceptionFilter());

  // ── Swagger (non-production only) ─────────────────────────────
  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Fresa Gold ERP — API')
      .setDescription(
        'Multi-tenant Freight Management SaaS — Kingfisher Wings Logistic LLC',
      )
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'JWT',
      )
      .addTag('auth', 'Authentication & session management')
      .addTag('users', 'User management & profile')
      .addTag('roles', 'Role & permission management')
      .addTag('masters', 'Master data: ports, airlines, currencies, etc.')
      .addTag('parties', 'Customer, agent & party management')
      .addTag('quotations', 'Quotation lifecycle')
      .addTag('jobs', 'Freight job management')
      .addTag('documents', 'Document generation & management')
      .addTag('invoices', 'Invoicing & billing')
      .addTag('accounting', 'Accounting, GL & financial reports')
      .addTag('reports', 'MIS & analytics reports')
      .addTag('health', 'Health checks')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });

    logger.log(`Swagger: http://localhost:${port}/docs`);
  }

  // ── Graceful shutdown ─────────────────────────────────────────
  app.enableShutdownHooks();

  await app.listen(port);

  logger.log(
    `Application running on http://localhost:${port}/${apiPrefix}`,
  );
  logger.log(`Environment: ${nodeEnv}`);
}

bootstrap().catch((error: Error) => {
  new Logger('Bootstrap').error(
    'Failed to start application',
    error.stack,
  );
  process.exit(1);
});