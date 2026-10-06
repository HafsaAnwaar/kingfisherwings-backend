import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { OnlinePaymentStatus } from "@prisma/client";
import { Response } from "express";
import "multer";
import { AllowSuperAdmin } from "../../common/decorators/allow-super-admin.decorator";
import { SuperAdminGuard } from "../auth/guards/super-admin.guard";
import { CurrentSuperAdminUser } from "../auth/decorators/current-super-admin.decorator";
import { PermissionsGuard } from "../users/guards/permissions.guard";
import { RequirePermissions } from "../users/decorators/permissions.decorator";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { paymentProofUploadInterceptor } from "./utils/payment-proof-upload.util";
import { PLATFORM_BILLING_PERMISSIONS } from "./constants/payments-permission.constants";
import {
  CreatePaymentLinkDto,
  RefundPaymentDto,
} from "./dto/online-payment.dto";
import { UpdatePaymentGatewaySettingsDto } from "./dto/payment-gateway.dto";
import {
  CancelPlatformInvoiceDto,
  CreateBillingPlanDto,
  CreatePlatformInvoiceDto,
  PlatformInvoiceQueryDto,
  RecordPlatformManualPaymentDto,
  RejectPlatformPaymentDto,
  SendPlatformInvoiceDto,
  SubmitPlatformPaymentProofDto,
  SubscribePlanDto,
  UpdateBillingPlanDto,
  UpdatePlatformInvoiceDto,
} from "./dto/platform-billing.dto";
import { PaymentGatewaySettingsService } from "./payment-gateway-settings.service";
import { PlatformBillingService } from "./platform-billing.service";
import { PlatformSubscriptionsService } from "./platform-subscriptions.service";
import { StripeGatewayService } from "./stripe-gateway.service";
import { StripeWebhookService } from "./stripe-webhook.service";
import { PaymentReconciliationService } from "./payment-reconciliation.service";

const PROOF_BODY_SCHEMA = {
  schema: {
    type: "object",
    required: ["file", "amount"],
    properties: {
      file: { type: "string", format: "binary" },
      amount: { type: "string", example: "499.00" },
      payment_method: {
        type: "string",
        enum: ["BANK_TRANSFER", "CASH", "CHEQUE", "OTHER"],
      },
      payment_date: { type: "string", example: "2026-09-30" },
      reference_number: { type: "string" },
      notes: { type: "string" },
    },
  },
};

function sendFile(
  res: Response,
  file: { buffer: Buffer; mimeType: string; fileName: string },
) {
  res.setHeader("Content-Type", file.mimeType);
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="${file.fileName.replace(/[^\w.\- ]/g, "_")}"`,
  );
  res.send(file.buffer);
}

/**
 * Super Admin platform billing. Every route requires a SuperAdmin token.
 */
@ApiTags("Platform Billing (Super Admin)")
@ApiBearerAuth()
@AllowSuperAdmin()
@UseGuards(SuperAdminGuard)
@Controller("platform")
export class PlatformBillingController {
  constructor(
    private readonly billing: PlatformBillingService,
    private readonly subscriptions: PlatformSubscriptionsService,
    private readonly gateways: PaymentGatewaySettingsService,
    private readonly stripe: StripeGatewayService,
    private readonly webhooks: StripeWebhookService,
    private readonly reconciliation: PaymentReconciliationService,
  ) {}

  // ─── Stripe ───

  @Get("billing/stripe/status")
  @ApiOperation({
    summary: "Platform Stripe configuration + payments health (no secrets)",
    description:
      "Lists configuration problems (missing keys, FRONTEND_URL, encryption key), failed webhooks " +
      "in the last 24h, stuck payments, and the SDK API version webhook endpoints should use.",
  })
  async stripeStatus() {
    return {
      success: true,
      data: {
        secret_key_configured: Boolean(this.stripe.platformClient()),
        webhook_secret_configured: Boolean(this.stripe.platformWebhookSecret()),
        publishable_key: this.stripe.platformPublishableKey(),
        ...(await this.reconciliation.readiness()),
      },
    };
  }

  @Post("billing/reconcile")
  @ApiOperation({
    summary: "Run payment reconciliation now (normally every 15 min)",
    description:
      "Re-checks stale checkouts with Stripe, retries ERP posting / fee journals / refund accounting, " +
      "and replays failed webhooks. Idempotent.",
  })
  reconcile() {
    return this.reconciliation.runAll();
  }

  @Get("billing/webhook-events")
  @ApiQuery({ name: "status", required: false })
  @ApiQuery({ name: "tenant_id", required: false })
  @ApiOperation({
    summary: "Recent Stripe webhook deliveries (status, errors)",
  })
  webhookEvents(
    @Query("status") status?: string,
    @Query("tenant_id") tenantId?: string,
  ) {
    return this.webhooks.listEvents({ status, tenantId });
  }

  @Post("billing/webhook-events/:id/replay")
  @ApiOperation({ summary: "Re-process a FAILED webhook event (idempotent)" })
  replayWebhook(@Param("id", ParseUUIDPipe) id: string) {
    return this.webhooks.replay(id);
  }

  @Get("tenants/:tenantId/payment-gateway")
  @ApiOperation({ summary: "A tenant's Stripe settings (no secrets)" })
  tenantGateway(@Param("tenantId", ParseUUIDPipe) tenantId: string) {
    return this.gateways.getSettings(tenantId);
  }

  @Put("tenants/:tenantId/payment-gateway")
  @ApiOperation({
    summary:
      "Configure a tenant's Stripe account (e.g. enable platform-account collection)",
  })
  updateTenantGateway(
    @Param("tenantId", ParseUUIDPipe) tenantId: string,
    @Body() dto: UpdatePaymentGatewaySettingsDto,
  ) {
    return this.gateways.updateSettings(tenantId, dto, undefined, {
      allowPlatformAccount: true,
    });
  }

  // ─── Plans ───

  @Get("billing/plans")
  @ApiOperation({ summary: "Billing plans" })
  plans() {
    return this.subscriptions.listPlans();
  }

  @Post("billing/plans")
  @ApiOperation({
    summary:
      "Create a billing plan (creates the Stripe Product/Price unless a price id is given)",
  })
  createPlan(@Body() dto: CreateBillingPlanDto) {
    return this.subscriptions.createPlan(dto);
  }

  @Patch("billing/plans/:id")
  @ApiOperation({ summary: "Update a billing plan" })
  updatePlan(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateBillingPlanDto,
  ) {
    return this.subscriptions.updatePlan(id, dto);
  }

  @Delete("billing/plans/:id")
  @ApiOperation({ summary: "Deactivate (and delete if unused) a billing plan" })
  deletePlan(@Param("id", ParseUUIDPipe) id: string) {
    return this.subscriptions.deletePlan(id);
  }

  @Get("tenants/:tenantId/subscription")
  @ApiOperation({ summary: "Tenant subscription state" })
  tenantSubscription(@Param("tenantId", ParseUUIDPipe) tenantId: string) {
    return this.subscriptions.getSubscription(tenantId);
  }

  @Post("tenants/:tenantId/subscription/change-plan")
  @ApiOperation({
    summary: "Move a tenant's Stripe subscription to another plan (prorated)",
  })
  changeTenantPlan(
    @Param("tenantId", ParseUUIDPipe) tenantId: string,
    @Body() dto: SubscribePlanDto,
    @CurrentSuperAdminUser("id") superAdminId: string,
  ) {
    return this.subscriptions.changePlan(tenantId, dto.plan_id, {
      superAdminId,
    });
  }

  @Post("tenants/:tenantId/subscription/cancel")
  @ApiQuery({ name: "immediately", required: false, type: Boolean })
  @ApiOperation({
    summary: "Cancel a tenant subscription (at period end by default)",
  })
  cancelTenantSubscription(
    @Param("tenantId", ParseUUIDPipe) tenantId: string,
    @CurrentSuperAdminUser("id") superAdminId: string,
    @Query("immediately") immediately?: string,
  ) {
    return this.subscriptions.cancelSubscription(
      tenantId,
      { superAdminId },
      immediately !== "true",
    );
  }

  // ─── Platform invoices ───

  @Get("invoices")
  @ApiOperation({ summary: "List platform invoices (all tenants)" })
  list(@Query() query: PlatformInvoiceQueryDto) {
    return this.billing.list(query);
  }

  @Post("invoices")
  @ApiOperation({
    summary: "Create a customised platform fee invoice (draft)",
    description:
      "Totals (subtotal, discount, tax, total) are computed server-side from the lines.",
  })
  create(
    @Body() dto: CreatePlatformInvoiceDto,
    @CurrentSuperAdminUser("id") superAdminId: string,
  ) {
    return this.billing.create(dto, superAdminId);
  }

  @Get("invoices/:id")
  @ApiOperation({ summary: "Platform invoice detail with payments" })
  getOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.billing.getOne(id);
  }

  @Patch("invoices/:id")
  @ApiOperation({ summary: "Edit a draft / unpaid platform invoice" })
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdatePlatformInvoiceDto,
    @CurrentSuperAdminUser("id") superAdminId: string,
  ) {
    return this.billing.update(id, dto, superAdminId);
  }

  @Delete("invoices/:id")
  @ApiOperation({ summary: "Delete a draft platform invoice" })
  remove(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentSuperAdminUser("id") superAdminId: string,
  ) {
    return this.billing.remove(id, superAdminId);
  }

  @Post("invoices/:id/send")
  @ApiOperation({
    summary: "Send / resend the invoice by email with a Pay Now link",
  })
  send(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: SendPlatformInvoiceDto,
    @CurrentSuperAdminUser("id") superAdminId: string,
  ) {
    return this.billing.send(id, dto, superAdminId);
  }

  @Post("invoices/:id/payment-link")
  @ApiOperation({ summary: "Generate a secure payment link" })
  paymentLink(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreatePaymentLinkDto,
    @CurrentSuperAdminUser("id") superAdminId: string,
  ) {
    return this.billing.createPaymentLink(
      id,
      superAdminId,
      dto.expires_in_days,
    );
  }

  @Post("invoices/:id/cancel")
  @ApiOperation({ summary: "Cancel an unpaid platform invoice" })
  cancel(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CancelPlatformInvoiceDto,
    @CurrentSuperAdminUser("id") superAdminId: string,
  ) {
    return this.billing.cancel(id, dto, superAdminId);
  }

  @Get("invoices/:id/pdf")
  @ApiOperation({ summary: "Download platform invoice PDF" })
  async pdf(@Param("id", ParseUUIDPipe) id: string, @Res() res: Response) {
    const file = await this.billing.downloadPdf(id);
    sendFile(res, {
      buffer: file.buffer,
      mimeType: "application/pdf",
      fileName: file.fileName,
    });
  }

  @Get("invoices/:id/payment-status")
  @ApiOperation({ summary: "Payment status of a platform invoice" })
  paymentStatus(@Param("id", ParseUUIDPipe) id: string) {
    return this.billing.paymentStatus(id);
  }

  @Get("invoices/:id/payments")
  @ApiOperation({ summary: "Payment history of a platform invoice" })
  invoicePayments(@Param("id", ParseUUIDPipe) id: string) {
    return this.billing.listPayments({ invoiceId: id });
  }

  @Post("invoices/:id/manual-payments")
  @ApiOperation({
    summary: "Record a manual payment (bank transfer, cash, cheque…)",
  })
  recordManual(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: RecordPlatformManualPaymentDto,
    @CurrentSuperAdminUser("id") superAdminId: string,
  ) {
    return this.billing.recordManualPayment(id, dto, superAdminId);
  }

  // ─── Platform payments ───

  @Get("payments")
  @ApiQuery({ name: "tenant_id", required: false })
  @ApiQuery({ name: "status", required: false, enum: OnlinePaymentStatus })
  @ApiOperation({
    summary:
      "Platform payment history (filter PENDING_VERIFICATION for the review queue)",
  })
  payments(
    @Query("tenant_id") tenantId?: string,
    @Query("status") status?: OnlinePaymentStatus,
  ) {
    if (tenantId && !/^[0-9a-f-]{36}$/i.test(tenantId))
      throw new BadRequestException("Invalid tenant_id.");
    if (status && !Object.values(OnlinePaymentStatus).includes(status)) {
      throw new BadRequestException("Invalid status.");
    }
    return this.billing.listPayments({ tenantId, status });
  }

  @Get("payments/:id")
  @ApiOperation({ summary: "Platform payment detail (with refunds)" })
  payment(@Param("id", ParseUUIDPipe) id: string) {
    return this.billing.getPayment(id);
  }

  @Get("payments/:id/proof")
  @ApiOperation({ summary: "Download the uploaded payment proof" })
  async proof(@Param("id", ParseUUIDPipe) id: string, @Res() res: Response) {
    sendFile(res, await this.billing.readProof(id));
  }

  @Post("payments/:id/verify")
  @ApiOperation({
    summary: "Approve a manual payment proof — applies it to the invoice",
  })
  verify(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentSuperAdminUser("id") superAdminId: string,
  ) {
    return this.billing.verifyManualPayment(id, superAdminId);
  }

  @Post("payments/:id/reject")
  @ApiOperation({ summary: "Reject a manual payment proof" })
  reject(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: RejectPlatformPaymentDto,
    @CurrentSuperAdminUser("id") superAdminId: string,
  ) {
    return this.billing.rejectManualPayment(id, dto.reason, superAdminId);
  }

  @Post("payments/:id/refund")
  @ApiOperation({
    summary:
      "Refund a platform payment (Stripe refund, or record an offline refund)",
  })
  refund(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: RefundPaymentDto,
    @CurrentSuperAdminUser("id") superAdminId: string,
  ) {
    return this.billing.refund(id, dto, superAdminId);
  }
}

/**
 * Tenant side of platform billing: the company's fees owed to the
 * platform. Tenant is always taken from the JWT — never from input.
 */
@ApiTags("Platform Billing (Tenant)")
@ApiBearerAuth()
@UseGuards(PermissionsGuard)
@Controller("tenant")
export class TenantPlatformBillingController {
  constructor(
    private readonly billing: PlatformBillingService,
    private readonly subscriptions: PlatformSubscriptionsService,
  ) {}

  @Get("platform-invoices")
  @RequirePermissions(PLATFORM_BILLING_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "My platform invoices" })
  list(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: PlatformInvoiceQueryDto,
  ) {
    return this.billing.list(query, tenantId);
  }

  @Get("platform-invoices/:id")
  @RequirePermissions(PLATFORM_BILLING_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Platform invoice detail" })
  getOne(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.billing.getOne(id, tenantId);
  }

  @Get("platform-invoices/:id/pdf")
  @RequirePermissions(PLATFORM_BILLING_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Download platform invoice PDF" })
  async pdf(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const file = await this.billing.downloadPdf(id, tenantId);
    sendFile(res, {
      buffer: file.buffer,
      mimeType: "application/pdf",
      fileName: file.fileName,
    });
  }

  @Get("platform-invoices/:id/payment-status")
  @RequirePermissions(PLATFORM_BILLING_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Payment status of my platform invoice" })
  paymentStatus(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.billing.paymentStatus(id, tenantId);
  }

  @Post("platform-invoices/:id/pay")
  @RequirePermissions(PLATFORM_BILLING_PERMISSIONS.PAY)
  @ApiOperation({
    summary: "Pay Now — opens Stripe Checkout for the invoice balance",
  })
  pay(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") userId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.billing.startCheckout(tenantId, id, {
      type: "TENANT_ADMIN",
      id: userId,
    });
  }

  @Post("platform-invoices/:id/checkout")
  @RequirePermissions(PLATFORM_BILLING_PERMISSIONS.PAY)
  @ApiOperation({ summary: "Alias of /pay" })
  checkout(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") userId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.billing.startCheckout(tenantId, id, {
      type: "TENANT_ADMIN",
      id: userId,
    });
  }

  @Post("platform-invoices/:id/payment-proof")
  @RequirePermissions(PLATFORM_BILLING_PERMISSIONS.PAY)
  @ApiConsumes("multipart/form-data")
  @ApiBody(PROOF_BODY_SCHEMA)
  @UseInterceptors(paymentProofUploadInterceptor())
  @ApiOperation({
    summary: "Submit a manual payment with proof (status PENDING_VERIFICATION)",
  })
  uploadProof(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") userId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: SubmitPlatformPaymentProofDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException(
        "Payment proof file is required (multipart field name: file).",
      );
    }
    return this.billing.submitManualPayment(tenantId, id, dto, file, userId);
  }

  @Get("platform-payments")
  @RequirePermissions(PLATFORM_BILLING_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "My platform payment history" })
  payments(@CurrentUser("tenantId") tenantId: string) {
    return this.billing.listPayments({ tenantId });
  }

  @Get("platform-payments/:id")
  @RequirePermissions(PLATFORM_BILLING_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Platform payment detail" })
  payment(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.billing.getPayment(id, tenantId);
  }

  @Get("platform-payments/:id/proof")
  @RequirePermissions(PLATFORM_BILLING_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Download my uploaded payment proof" })
  async proof(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    sendFile(res, await this.billing.readProof(id, tenantId));
  }

  // ─── Subscription (Stripe Billing) ───

  @Get("billing/plans")
  @RequirePermissions(PLATFORM_BILLING_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Available subscription plans" })
  plans() {
    return this.subscriptions.listPlans(true);
  }

  @Get("subscription")
  @RequirePermissions(PLATFORM_BILLING_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "My subscription" })
  subscription(@CurrentUser("tenantId") tenantId: string) {
    return this.subscriptions.getSubscription(tenantId);
  }

  @Post("subscription/checkout")
  @RequirePermissions(PLATFORM_BILLING_PERMISSIONS.PAY)
  @ApiOperation({ summary: "Subscribe to a plan via Stripe Checkout" })
  subscribe(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") userId: string,
    @Body() dto: SubscribePlanDto,
  ) {
    return this.subscriptions.startSubscriptionCheckout(
      tenantId,
      dto.plan_id,
      userId,
    );
  }

  @Post("subscription/change-plan")
  @RequirePermissions(PLATFORM_BILLING_PERMISSIONS.PAY)
  @ApiOperation({ summary: "Change plan (prorated)" })
  changePlan(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") userId: string,
    @Body() dto: SubscribePlanDto,
  ) {
    return this.subscriptions.changePlan(tenantId, dto.plan_id, { userId });
  }

  @Post("subscription/cancel")
  @RequirePermissions(PLATFORM_BILLING_PERMISSIONS.PAY)
  @ApiOperation({ summary: "Cancel at the end of the current period" })
  cancel(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") userId: string,
  ) {
    return this.subscriptions.cancelSubscription(tenantId, { userId }, true);
  }
}
