import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { OrganizationModule } from '../organization/organization.module';
import { QueueModule } from '../../shared/queue/queue.module';
import { EmailModule } from '../../shared/email/email.module';
import { WhatsAppModule } from '../../shared/whatsapp/whatsapp.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { StorageModule } from '../../shared/storage/storage.module';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { SeaFclImportService } from './sea-fcl-import.service';
import { AirImportService } from './air-import.service';

@Module({
  imports: [
    PrismaModule,
    OrganizationModule,
    QueueModule,
    EmailModule,
    WhatsAppModule,
    NotificationsModule,
    InvoicesModule,
    StorageModule,
  ],
  controllers: [JobsController],
  providers: [JobsService, SeaFclImportService, AirImportService],
  exports: [JobsService, SeaFclImportService, AirImportService],
})
export class JobsModule {}
