import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { OrganizationModule } from '../organization/organization.module';
import { PdfModule } from '../../shared/pdf/pdf.module';
import { StorageModule } from '../../shared/storage/storage.module';
import { EmailModule } from '../../shared/email/email.module';
import { GlModule } from '../gl/gl.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PublicApiModule } from '../public-api/public-api.module';
import { InvoicesController } from './invoices.controller';
import { CreditNotesController } from './credit-notes.controller';
import { DebitNotesController } from './debit-notes.controller';
import { PurchaseInvoicesController } from './purchase-invoices.controller';
import { PaymentRequestsController } from './payment-requests.controller';
import { InvoicesService } from './invoices.service';
import { PaymentRequestsService } from './payment-requests.service';

@Module({
  imports: [
    PrismaModule,
    OrganizationModule,
    PdfModule,
    StorageModule,
    EmailModule,
    GlModule,
    NotificationsModule,
    PublicApiModule,
  ],
  controllers: [
    InvoicesController,
    CreditNotesController,
    DebitNotesController,
    PurchaseInvoicesController,
    PaymentRequestsController,
  ],
  providers: [InvoicesService, PaymentRequestsService],
  exports: [InvoicesService, PaymentRequestsService],
})
export class InvoicesModule {}