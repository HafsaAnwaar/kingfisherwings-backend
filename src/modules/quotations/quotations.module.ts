import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { OrganizationModule } from '../organization/organization.module';
import { QuotationsController } from './quotations.controller';
import { QuotationsService } from './quotations.service';
import { TariffsController } from './tariffs/tariffs.controller';
import { TariffsService } from './tariffs/tariffs.service';
import { ZipDistancesController } from './zip-distances/zip-distances.controller';
import { ZipDistancesService } from './zip-distances/zip-distances.service';

@Module({
  imports: [PrismaModule, OrganizationModule],
  controllers: [QuotationsController, TariffsController, ZipDistancesController],
  providers: [QuotationsService, TariffsService, ZipDistancesService],
  exports: [QuotationsService, TariffsService],
})
export class QuotationsModule {}
