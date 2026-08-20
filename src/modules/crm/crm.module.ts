import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../../prisma/prisma.module';
import { EmailModule } from '../../shared/email/email.module';
import { QueueModule } from '../../shared/queue/queue.module';
import { PartiesModule } from '../parties/parties.module';
import { QuotationsModule } from '../quotations/quotations.module';
import { NotificationsModule } from '../notifications/notifications.module';
import {
  CrmCallLogsController,
  CrmDashboardController,
  CrmEmailController,
  CrmEnquiriesController,
  CrmFollowUpsController,
  CrmLeadsController,
} from './crm.controller';
import { CrmActivityService } from './crm-activity.service';
import { CrmCronService } from './crm-cron.service';
import { CrmDashboardService } from './crm-dashboard.service';
import { CrmEmailService } from './crm-email.service';
import { CrmLeadsService } from './crm-leads.service';

@Module({
  imports: [
    ScheduleModule,
    PrismaModule,
    EmailModule,
    QueueModule,
    PartiesModule,
    QuotationsModule,
    NotificationsModule,
  ],
  controllers: [
    CrmLeadsController,
    CrmCallLogsController,
    CrmFollowUpsController,
    CrmEnquiriesController,
    CrmDashboardController,
    CrmEmailController,
  ],
  providers: [CrmLeadsService, CrmActivityService, CrmDashboardService, CrmEmailService, CrmCronService],
  exports: [CrmLeadsService, CrmActivityService, CrmDashboardService, CrmEmailService],
})
export class CrmModule {}
