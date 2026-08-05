import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../../prisma/prisma.module';
import { EmailModule } from '../../shared/email/email.module';
import { StorageModule } from '../../shared/storage/storage.module';
import { QuotationsModule } from '../quotations/quotations.module';
import { PortalAuthController } from './portal-auth.controller';
import {
  PartyPortalUsersController,
  PortalUsersAdminController,
} from './party-portal-users.controller';
import { PartyPortalPermissionsController } from './party-portal-permissions.controller';
import { PortalDocumentsController } from './portal-documents.controller';
import { PortalQuotationsController } from './portal-quotations.controller';
import { PortalShipmentsController } from './portal-shipments.controller';
import { PortalAuthGuard } from './guards/portal-auth.guard';
import { PortalService } from './portal.service';
import { PortalDocumentsService } from './portal-documents.service';
import { PortalPermissionsService } from './portal-permissions.service';
import { PortalQuotationsService } from './portal-quotations.service';
import { PortalShipmentsService } from './portal-shipments.service';

@Module({
  imports: [PrismaModule, EmailModule, StorageModule, QuotationsModule, JwtModule.register({})],
  controllers: [
    PortalAuthController,
    PartyPortalUsersController,
    PortalUsersAdminController,
    PartyPortalPermissionsController,
    PortalShipmentsController,
    PortalDocumentsController,
    PortalQuotationsController,
  ],
  providers: [
    PortalService,
    PortalShipmentsService,
    PortalQuotationsService,
    PortalPermissionsService,
    PortalDocumentsService,
    PortalAuthGuard,
  ],
  exports: [
    PortalService,
    PortalShipmentsService,
    PortalQuotationsService,
    PortalPermissionsService,
    PortalDocumentsService,
    PortalAuthGuard,
  ],
})
export class PortalModule {}
