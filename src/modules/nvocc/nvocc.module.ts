import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { OrganizationModule } from '../organization/organization.module';
import { QueueModule } from '../../shared/queue/queue.module';
import { EmailModule } from '../../shared/email/email.module';
import { NvoccVoyagesController } from './nvocc-voyages.controller';
import { NvoccEnquiriesController } from './nvocc-enquiries.controller';
import { NvoccBookingsController } from './nvocc-bookings.controller';
import { NvoccTariffsController } from './nvocc-tariffs.controller';
import { NvoccVoyagesService } from './nvocc-voyages.service';
import { NvoccEnquiriesService } from './nvocc-enquiries.service';
import { NvoccBookingsService } from './nvocc-bookings.service';
import { NvoccTariffsService } from './nvocc-tariffs.service';
import { NvoccLoadListService } from './nvocc-load-list.service';
import { NvoccCronService } from './nvocc-cron.service';

@Module({
  imports: [PrismaModule, OrganizationModule, QueueModule, EmailModule],
  controllers: [
    NvoccTariffsController,
    NvoccVoyagesController,
    NvoccEnquiriesController,
    NvoccBookingsController,
  ],
  providers: [
    NvoccVoyagesService,
    NvoccTariffsService,
    NvoccLoadListService,
    NvoccBookingsService,
    NvoccEnquiriesService,
    NvoccCronService,
  ],
  exports: [NvoccVoyagesService, NvoccBookingsService, NvoccTariffsService],
})
export class NvoccModule {}
