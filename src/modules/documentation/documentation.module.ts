import { Module } from '@nestjs/common';
import { BullModule, getQueueToken } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { StorageModule } from '../../shared/storage/storage.module';
import { JobsModule } from '../jobs/jobs.module';
import redisConfig from '../../config/redis.config';
import { buildBullRedisOptions, isRedisEnabledEnv } from '../../shared/redis/redis-options.util';
import { DOCUMENTATION_UPLOAD_QUEUE } from '../../shared/queue/queue.constants';
import { createNoopQueue } from '../../shared/queue/noop-queue';
import { DocumentationBoeController } from './documentation-boe.controller';
import { DocumentationBoeService } from './documentation-boe.service';
import { DocumentationBulkCostController } from './documentation-bulk-cost.controller';
import { DocumentationBulkCostService } from './documentation-bulk-cost.service';
import { DocumentationChargeTemplateController } from './documentation-charge-template.controller';
import { DocumentationChargeTemplateService } from './documentation-charge-template.service';
import { DocumentationEdiController } from './documentation-edi.controller';
import { DocumentationEdiService } from './documentation-edi.service';
import { DocumentationCgmController } from './documentation-cgm.controller';
import { DocumentationCgmService } from './documentation-cgm.service';
import { DocumentationMpciController } from './documentation-mpci.controller';
import { DocumentationMpciService } from './documentation-mpci.service';
import { DocumentationUploadController } from './documentation-upload.controller';
import { DocumentationUploadService } from './documentation-upload.service';
import { DocumentationUploadProcessor } from './documentation-upload.processor';
import { DocumentationDeliveryOrderController } from './documentation-delivery-order.controller';
import { DocumentationDeliveryOrderService } from './documentation-delivery-order.service';
import { DocumentationReportController } from './documentation-report.controller';
import { DocumentationReportService } from './documentation-report.service';
import {
  DocumentationJobTransferController,
  DocumentationTrackingController,
} from './documentation-ops.controller';
import { DocumentationJobTransferService } from './documentation-job-transfer.service';
import { DocumentationAirTrackingService } from './documentation-air-tracking.service';

const redisEnabled = isRedisEnabledEnv();

const uploadQueueImports = redisEnabled
  ? [
      BullModule.registerQueueAsync({
        name: DOCUMENTATION_UPLOAD_QUEUE,
        imports: [ConfigModule.forFeature(redisConfig)],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          redis: buildBullRedisOptions(config),
        }),
      }),
    ]
  : [];

const uploadQueueProviders = redisEnabled
  ? [DocumentationUploadProcessor]
  : [
      {
        provide: getQueueToken(DOCUMENTATION_UPLOAD_QUEUE),
        useValue: createNoopQueue(DOCUMENTATION_UPLOAD_QUEUE),
      },
    ];

@Module({
  imports: [PrismaModule, StorageModule, JobsModule, ConfigModule.forFeature(redisConfig), ...uploadQueueImports],
  controllers: [
    DocumentationBoeController,
    DocumentationBulkCostController,
    DocumentationChargeTemplateController,
    DocumentationEdiController,
    DocumentationCgmController,
    DocumentationMpciController,
    DocumentationUploadController,
    DocumentationDeliveryOrderController,
    DocumentationReportController,
    DocumentationJobTransferController,
    DocumentationTrackingController,
  ],
  providers: [
    DocumentationBoeService,
    DocumentationBulkCostService,
    DocumentationChargeTemplateService,
    DocumentationEdiService,
    DocumentationCgmService,
    DocumentationMpciService,
    DocumentationUploadService,
    ...uploadQueueProviders,
    DocumentationDeliveryOrderService,
    DocumentationReportService,
    DocumentationJobTransferService,
    DocumentationAirTrackingService,
  ],
  exports: [DocumentationEdiService],
})
export class DocumentationModule {}
