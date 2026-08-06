import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../../prisma/prisma.module';
import { EmailModule } from '../../shared/email/email.module';
import { StorageModule } from '../../shared/storage/storage.module';
import { PdfModule } from '../../shared/pdf/pdf.module';
import { QuotationsModule } from '../quotations/quotations.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { GlModule } from '../gl/gl.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PortalAuthController } from './portal-auth.controller';
import {
  PartyPortalUsersController,
  PortalUsersAdminController,
} from './party-portal-users.controller';
import { PartyPortalPermissionsController } from './party-portal-permissions.controller';
import { PortalDocumentsController } from './portal-documents.controller';
import { PortalQuotationsController } from './portal-quotations.controller';
import { PortalShipmentsController } from './portal-shipments.controller';
import {
  PortalCreditController,
  PortalCreditNotesController,
  PortalInvoicesController,
  PortalPaymentsController,
} from './portal-finance.controller';
import {
  PortalAdminInboxController,
  PortalCreditLimitRequestsController,
  PortalDisputesController,
  PortalMessagesController,
} from './portal-ccp.controller';
import { PortalNotificationsController } from './portal-notifications.controller';
import { PortalAuthGuard } from './guards/portal-auth.guard';
import { PortalService } from './portal.service';
import { PortalDocumentsService } from './portal-documents.service';
import { PortalPermissionsService } from './portal-permissions.service';
import { PortalQuotationsService } from './portal-quotations.service';
import { PortalShipmentsService } from './portal-shipments.service';
import { PortalFinanceService } from './portal-finance.service';
import { PortalCcpService } from './portal-ccp.service';

@Module({
  imports: [
    PrismaModule,
    EmailModule,
    StorageModule,
    PdfModule,
    QuotationsModule,
    InvoicesModule,
    GlModule,
    NotificationsModule,
    JwtModule.register({}),
  ],
  controllers: [
    PortalAuthController,
    PartyPortalUsersController,
    PortalUsersAdminController,
    PartyPortalPermissionsController,
    PortalShipmentsController,
    PortalDocumentsController,
    PortalQuotationsController,
    PortalInvoicesController,
    PortalCreditNotesController,
    PortalPaymentsController,
    PortalCreditController,
    PortalMessagesController,
    PortalDisputesController,
    PortalCreditLimitRequestsController,
    PortalAdminInboxController,
    PortalNotificationsController,
  ],
  providers: [
    PortalService,
    PortalShipmentsService,
    PortalQuotationsService,
    PortalPermissionsService,
    PortalDocumentsService,
    PortalFinanceService,
    PortalCcpService,
    PortalAuthGuard,
  ],
  exports: [
    PortalService,
    PortalShipmentsService,
    PortalQuotationsService,
    PortalPermissionsService,
    PortalDocumentsService,
    PortalFinanceService,
    PortalCcpService,
    PortalAuthGuard,
  ],
})
export class PortalModule {}
