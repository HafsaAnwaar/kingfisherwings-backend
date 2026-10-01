import { Module, forwardRef } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { EmailModule } from "../../shared/email/email.module";
import { PdfModule } from "../../shared/pdf/pdf.module";
import { StorageModule } from "../../shared/storage/storage.module";
import { GlModule } from "../gl/gl.module";
import { InvoicesModule } from "../invoices/invoices.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { InvoiceOnlinePaymentsService } from "./invoice-online-payments.service";
import { PaymentAuditService } from "./payment-audit.service";
import { PaymentGatewaySettingsService } from "./payment-gateway-settings.service";
import { PaymentLinksService } from "./payment-links.service";
import { PaymentNotificationsService } from "./payment-notifications.service";
import { PaymentReconciliationService } from "./payment-reconciliation.service";
import {
  InvoiceOnlinePaymentsController,
  OnlinePaymentsController,
} from "./payments.controller";
import {
  PlatformBillingController,
  TenantPlatformBillingController,
} from "./platform-billing.controller";
import { PlatformBillingService } from "./platform-billing.service";
import { PlatformLedgerService } from "./platform-ledger.service";
import { PlatformFinanceController } from "./platform-finance.controller";
import { PlatformSubscriptionsService } from "./platform-subscriptions.service";
import {
  PublicPaymentLinksController,
  StripeWebhookController,
} from "./public-payments.controller";
import { StripeCustomersService } from "./stripe-customers.service";
import { StripeGatewayService } from "./stripe-gateway.service";
import { StripeWebhookService } from "./stripe-webhook.service";

/**
 * Stripe payment gateway. Depends on (never replaces) the existing GL
 * payments, email, storage and notification services.
 */
@Module({
  imports: [
    PrismaModule,
    GlModule,
    NotificationsModule,
    EmailModule,
    StorageModule,
    PdfModule,
    // Platform ledger books Super Admin invoices via the existing InvoicesService.
    forwardRef(() => InvoicesModule),
  ],
  controllers: [
    StripeWebhookController,
    PublicPaymentLinksController,
    OnlinePaymentsController,
    InvoiceOnlinePaymentsController,
    PlatformBillingController,
    TenantPlatformBillingController,
    PlatformFinanceController,
  ],
  providers: [
    StripeGatewayService,
    PaymentAuditService,
    PaymentGatewaySettingsService,
    StripeCustomersService,
    PaymentNotificationsService,
    PaymentLinksService,
    InvoiceOnlinePaymentsService,
    PlatformBillingService,
    PlatformSubscriptionsService,
    StripeWebhookService,
    PaymentReconciliationService,
    PlatformLedgerService,
  ],
  exports: [
    InvoiceOnlinePaymentsService,
    PaymentLinksService,
    PaymentNotificationsService,
    PaymentGatewaySettingsService,
    PaymentAuditService,
    StripeGatewayService,
  ],
})
export class PaymentsModule {}
