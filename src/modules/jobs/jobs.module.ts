import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { OrganizationModule } from '../organization/organization.module';
import { QueueModule } from '../../shared/queue/queue.module';
import { EmailModule } from '../../shared/email/email.module';
import { WhatsAppModule } from '../../shared/whatsapp/whatsapp.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { SeaFclImportService } from './sea-fcl-import.service';

@Module({
  imports: [
    PrismaModule,
    OrganizationModule,
    QueueModule,
    EmailModule,
    WhatsAppModule,
    NotificationsModule,
  ],
  controllers: [JobsController],
  providers: [JobsService, SeaFclImportService],
  exports: [JobsService, SeaFclImportService],
})
export class JobsModule {}
