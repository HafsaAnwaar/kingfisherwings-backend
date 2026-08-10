import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import redisConfig from '../../config/redis.config';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsModule } from '../../modules/notifications/notifications.module';
import { PdfModule } from '../pdf/pdf.module';
import { StorageModule } from '../storage/storage.module';
import { DOCUMENT_GENERATION_QUEUE } from './queue.constants';
import { DocumentGenerationService } from './document-generation.service';
import { DocumentGenerationProcessor } from './document-generation.processor';

@Module({
  imports: [
    ConfigModule.forFeature(redisConfig),
    PrismaModule,
    PdfModule,
    StorageModule,
    NotificationsModule,
    BullModule.registerQueueAsync({
      name: DOCUMENT_GENERATION_QUEUE,
      imports: [ConfigModule.forFeature(redisConfig)],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get<string>('redis.host'),
          port: config.get<number>('redis.port'),
          password: config.get<string>('redis.password'),
          db: config.get<number>('redis.db'),
        },
      }),
    }),
  ],
  providers: [DocumentGenerationService, DocumentGenerationProcessor],
  exports: [DocumentGenerationService, BullModule],
})
export class QueueModule {}
