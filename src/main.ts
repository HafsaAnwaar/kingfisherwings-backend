import "./load-env";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import compression = require("compression");
import helmet from "helmet";

import { AppModule } from "./app.module";
import { validatePortalVendorJwtSecrets } from "./common/utils/jwt-secrets.util";

function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Sentry = require("@sentry/nestjs");
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV ?? "development",
      tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
      beforeSend(event: { user?: Record<string, unknown> }) {
        if (event.user) {
          delete event.user.email;
          delete event.user.ip_address;
        }
        return event;
      },
    });
  } catch {
    console.warn("Sentry DSN set but @sentry/nestjs failed to initialize.");
  }
}

function parseCorsOrigins(raw: string | undefined): string[] | undefined {
  if (!raw?.trim()) {
    return undefined;
  }
  const origins = raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  return origins.length > 0 ? origins : undefined;
}

function isSwaggerEnabled(config: ConfigService): boolean {
  const flag = config.get<string>("SWAGGER_ENABLED");
  if (flag === "false") {
    return false;
  }
  // Default on (dev + production). Opt out with SWAGGER_ENABLED=false on Render.
  return true;
}

function isPlaceholderPublicUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return (
    lower.includes("your_new_service") ||
    lower.includes("your-service") ||
    lower.includes("placeholder")
  );
}

function resolvePublicApiUrl(opts: {
  configuredPublicUrl?: string;
  renderExternalUrl?: string;
  port: number;
}): string {
  const { configuredPublicUrl, renderExternalUrl, port } = opts;
  if (configuredPublicUrl && !isPlaceholderPublicUrl(configuredPublicUrl)) {
    return configuredPublicUrl.replace(/\/$/, "");
  }
  if (renderExternalUrl) {
    return renderExternalUrl.replace(/\/$/, "");
  }
  if (configuredPublicUrl) {
    return configuredPublicUrl.replace(/\/$/, "");
  }
  return `http://localhost:${port}`;
}

async function bootstrap() {
  initSentry();
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  validatePortalVendorJwtSecrets(config);

  const http = app.getHttpAdapter().getInstance();
  if (typeof http?.set === "function") {
    http.set("trust proxy", 1);
  }

  const port = config.get<number>("PORT") || 3000;
  const configuredPublicUrl = config.get<string>("PUBLIC_API_URL")?.trim();
  const renderExternalUrl = process.env.RENDER_EXTERNAL_URL?.trim();
  const publicUrl = resolvePublicApiUrl({
    configuredPublicUrl,
    renderExternalUrl,
    port,
  });
  const nodeEnv = config.get<string>("NODE_ENV") ?? "development";

  if (
    configuredPublicUrl &&
    isPlaceholderPublicUrl(configuredPublicUrl) &&
    renderExternalUrl
  ) {
    console.warn(
      `PUBLIC_API_URL looks like a placeholder (${configuredPublicUrl}). Using RENDER_EXTERNAL_URL for Swagger: ${renderExternalUrl}`,
    );
  }
  app.use(helmet());
  app.use(compression());

  const corsOrigins = parseCorsOrigins(config.get<string>("CORS_ORIGINS"));
  if (corsOrigins) {
    app.enableCors({ origin: corsOrigins, credentials: true });
  } else if (nodeEnv !== "production") {
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
      .setTitle("KingFisher Wings ERP API")
      .setDescription("KingFisher Wings ERP Backend")
      .setVersion("1.0")
      .addServer(publicUrl)
      .addBearerAuth()
      .addApiKey(
        { type: "apiKey", name: "X-Cron-Secret", in: "header" },
        "cron-secret",
      )
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("docs", app, document);
    console.log(`Swagger available at /docs`);
  }

  // Render requires binding to 0.0.0.0
  await app.listen(port, "0.0.0.0");

  console.log(`Server is running on port ${port}`);
}

bootstrap();
