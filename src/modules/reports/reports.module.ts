import { Module } from "@nestjs/common";
import { BullModule, getQueueToken } from "@nestjs/bull";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { PrismaModule } from "../../prisma/prisma.module";
import { PdfModule } from "../../shared/pdf/pdf.module";
import { StorageModule } from "../../shared/storage/storage.module";
import redisConfig from "../../config/redis.config";
import {
  buildBullRedisOptions,
  isRedisEnabledEnv,
} from "../../shared/redis/redis-options.util";
import { REPORT_GENERATION_QUEUE } from "../../shared/queue/queue.constants";
import { createNoopQueue } from "../../shared/queue/noop-queue";
import { OpsListDataPackService } from "./data-packs/ops-list.data-pack";
import { SeaDocsDataPackService } from "./data-packs/sea-docs.data-pack";
import { ReportDataPackRegistry } from "./data-packs/report-data-pack.registry";
import { ReportRendererService } from "./renderers/report-renderer.service";
import { ReportGenerationProcessor } from "./report-generation.processor";
import { ReportsGenerateController } from "./reports-generate.controller";
import { ReportsGenerateService } from "./reports-generate.service";
import { ReportsJobsController } from "./reports-jobs.controller";
import { ReportsJobsService } from "./reports-jobs.service";
import { ReportsTemplatesController } from "./reports-templates.controller";
import { ReportsTemplatesService } from "./reports-templates.service";
import { ReportsSeedService } from "./seed/reports.seed";

const redisEnabled = isRedisEnabledEnv();

const queueImports = redisEnabled
  ? [
      BullModule.registerQueueAsync({
        name: REPORT_GENERATION_QUEUE,
        imports: [ConfigModule.forFeature(redisConfig)],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          redis: buildBullRedisOptions(config),
        }),
      }),
    ]
  : [];

const queueProviders = redisEnabled
  ? [ReportGenerationProcessor]
  : [
      {
        provide: getQueueToken(REPORT_GENERATION_QUEUE),
        useValue: createNoopQueue(REPORT_GENERATION_QUEUE),
      },
    ];

@Module({
  imports: [
    PrismaModule,
    PdfModule,
    StorageModule,
    ConfigModule.forFeature(redisConfig),
    ...queueImports,
  ],
  controllers: [
    ReportsTemplatesController,
    ReportsGenerateController,
    ReportsJobsController,
  ],
  providers: [
    ReportsTemplatesService,
    ReportsGenerateService,
    ReportsJobsService,
    OpsListDataPackService,
    SeaDocsDataPackService,
    ReportDataPackRegistry,
    ReportRendererService,
    ReportsSeedService,
    ...queueProviders,
  ],
})
export class ReportsModule {}
