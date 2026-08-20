import { Module } from '@nestjs/common';
import { BullModule, getQueueToken } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import redisConfig from '../../config/redis.config';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsModule } from '../../modules/notifications/notifications.module';
import { EmailModule } from '../email/email.module';
import { PdfModule } from '../pdf/pdf.module';
import { StorageModule } from '../storage/storage.module';
import { buildBullRedisOptions, isRedisEnabledEnv } from '../redis/redis-options.util';
import { DOCUMENT_GENERATION_QUEUE, EMAIL_CAMPAIGN_QUEUE } from './queue.constants';
import { DocumentGenerationService } from './document-generation.service';
import { DocumentGenerationProcessor } from './document-generation.processor';
import { EmailCampaignProcessor } from './email-campaign.processor';
import { createNoopQueue } from './noop-queue';

const redisEnabled = isRedisEnabledEnv();

const bullQueueImports = redisEnabled
  ? [
      BullModule.registerQueueAsync({
        name: DOCUMENT_GENERATION_QUEUE,
        imports: [ConfigModule.forFeature(redisConfig)],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          redis: buildBullRedisOptions(config),
        }),
      }),
      BullModule.registerQueueAsync({
        name: EMAIL_CAMPAIGN_QUEUE,
        imports: [ConfigModule.forFeature(redisConfig)],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          redis: buildBullRedisOptions(config),
        }),
      }),
    ]
  : [];

const queueProviders = redisEnabled
  ? [DocumentGenerationService, DocumentGenerationProcessor, EmailCampaignProcessor]
  : [
      DocumentGenerationService,
      {
        provide: getQueueToken(DOCUMENT_GENERATION_QUEUE),
        useValue: createNoopQueue(DOCUMENT_GENERATION_QUEUE),
      },
      {
        provide: getQueueToken(EMAIL_CAMPAIGN_QUEUE),
        useValue: createNoopQueue(EMAIL_CAMPAIGN_QUEUE),
      },
    ];

@Module({
  imports: [
    ConfigModule.forFeature(redisConfig),
    PrismaModule,
    EmailModule,
    PdfModule,
    StorageModule,
    NotificationsModule,
    ...bullQueueImports,
  ],
  providers: queueProviders,
  exports: [
    DocumentGenerationService,
    ...(redisEnabled
      ? [BullModule]
      : [getQueueToken(DOCUMENT_GENERATION_QUEUE), getQueueToken(EMAIL_CAMPAIGN_QUEUE)]),
  ],
})
export class QueueModule {}
