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
import { JobsSeaScansController, SeaKpiReportController } from './jobs-sea-scans.controller';
import { JobsService } from './jobs.service';
import { SeaFclImportService } from './sea-fcl-import.service';
import { AirImportService } from './air-import.service';
import { SeaLclService } from './sea-lcl.service';
import { SeaLclImportService } from './sea-lcl-import.service';
import { LandService } from './land.service';
import { CourierService } from './courier.service';
import { TransportModule } from '../transport/transport.module';

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
    TransportModule,
  ],
  controllers: [JobsController, JobsSeaScansController, SeaKpiReportController],
  providers: [
    JobsService,
    SeaFclImportService,
    AirImportService,
    SeaLclService,
    SeaLclImportService,
    LandService,
    CourierService,
  ],
  exports: [
    JobsService,
    SeaFclImportService,
    AirImportService,
    SeaLclService,
    SeaLclImportService,
    LandService,
    CourierService,
  ],
})
export class JobsModule {}
