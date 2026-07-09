import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { OrganizationModule } from '../organization/organization.module';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';

@Module({
  imports: [PrismaModule, OrganizationModule],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
