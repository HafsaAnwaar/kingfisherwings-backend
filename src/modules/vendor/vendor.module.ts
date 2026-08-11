import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../../prisma/prisma.module';
import { EmailModule } from '../../shared/email/email.module';
import { StorageModule } from '../../shared/storage/storage.module';
import { PdfModule } from '../../shared/pdf/pdf.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { GlModule } from '../gl/gl.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { VendorAuthController } from './vendor-auth.controller';
import { PartyVendorUsersController, VendorUsersAdminController } from './party-vendor-users.controller';
import { PartyVendorPermissionsController } from './party-vendor-permissions.controller';
import {
  VendorInvoicesController,
  VendorPaymentsController,
} from './vendor-finance.controller';
import { VendorAdminDisputesController, VendorDisputesController } from './vendor-ccp.controller';
import { VendorAuthGuard } from './guards/vendor-auth.guard';
import { VendorService } from './vendor.service';
import { VendorPermissionsService } from './vendor-permissions.service';
import { VendorFinanceService } from './vendor-finance.service';
import { VendorCcpService } from './vendor-ccp.service';

@Module({
  imports: [
    PrismaModule,
    EmailModule,
    StorageModule,
    PdfModule,
    InvoicesModule,
    GlModule,
    NotificationsModule,
    JwtModule.register({}),
  ],
  controllers: [
    VendorAuthController,
    PartyVendorUsersController,
    VendorUsersAdminController,
    PartyVendorPermissionsController,
    VendorInvoicesController,
    VendorPaymentsController,
    VendorDisputesController,
    VendorAdminDisputesController,
  ],
  providers: [
    VendorService,
    VendorPermissionsService,
    VendorFinanceService,
    VendorCcpService,
    VendorAuthGuard,
  ],
  exports: [VendorService, VendorPermissionsService, VendorFinanceService, VendorCcpService, VendorAuthGuard],
})
export class VendorModule {}
