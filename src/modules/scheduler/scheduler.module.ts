import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../../prisma/prisma.module';
import { QuotationsModule } from '../quotations/quotations.module';
import { SchedulerService } from './scheduler.service';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule, QuotationsModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
