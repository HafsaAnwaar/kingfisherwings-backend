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
  ApiTags,
} from "@nestjs/swagger";
import { Response } from "express";
import { paymentProofUploadInterceptor } from "../../payments/utils/payment-proof-upload.util";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../users/guards/permissions.guard";
import { RequirePermissions } from "../../users/decorators/permissions.decorator";
import { CurrentUser } from "../../users/decorators/current-user.decorator";
import { INVOICES_PERMISSIONS } from "../constants/invoices-permission.constants";
import { PaymentProofsService } from "./payment-proofs.service";
import {
  ApprovePaymentProofDto,
  ReviewPaymentProofDto,
  StaffUploadPaymentProofDto,
} from "./payment-proofs.dto";

@ApiTags("Payment Proofs")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("payment-proofs")
export class PaymentProofsController {
  constructor(private readonly proofs: PaymentProofsService) {}

  @Patch(":id/acknowledge")
  @RequirePermissions(INVOICES_PERMISSIONS.REVIEW_PAYMENT_PROOFS)
  @ApiOperation({ summary: "Acknowledge a submitted payment proof" })
  acknowledge(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ReviewPaymentProofDto,
  ) {
    return this.proofs.review(
      tenantId,
      id,
      "ACKNOWLEDGED",
      dto.review_notes,
      actorId,
    );
  }

  @Patch(":id/approve")
  @RequirePermissions(INVOICES_PERMISSIONS.REVIEW_PAYMENT_PROOFS)
  @ApiOperation({
    summary: "Approve a proof and record the payment in the ERP",
    description:
      "Acknowledges the proof and creates + posts the receipt (customer) or payment (vendor) " +
      "through the existing GL payment flow, allocated to the invoice. Idempotent per proof.",
  })
  approve(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ApprovePaymentProofDto,
  ) {
    return this.proofs.approve(tenantId, id, dto, actorId);
  }

  @Get(":id/file")
  @RequirePermissions(INVOICES_PERMISSIONS.VIEW)
  @ApiOperation({
    summary: "Download the proof file (served from object storage)",
  })
  async file(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const file = await this.proofs.readFile(tenantId, id);
    res.setHeader("Content-Type", file.mimeType);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${file.fileName.replace(/[^\w.\- ]/g, "_")}"`,
    );
    res.send(file.buffer);
  }

  @Delete(":id")
  @RequirePermissions(INVOICES_PERMISSIONS.REVIEW_PAYMENT_PROOFS)
  @ApiOperation({ summary: "Withdraw an unreviewed proof" })
  withdraw(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.proofs.withdraw(tenantId, id, actorId);
  }

  @Patch(":id/reject")
  @RequirePermissions(INVOICES_PERMISSIONS.REVIEW_PAYMENT_PROOFS)
  @ApiOperation({ summary: "Reject a submitted payment proof" })
  reject(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ReviewPaymentProofDto,
  ) {
    return this.proofs.review(
      tenantId,
      id,
      "REJECTED",
      dto.review_notes,
      actorId,
    );
  }
}

@ApiTags("Payment Proofs")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("invoices")
export class InvoicePaymentProofsController {
  constructor(private readonly proofs: PaymentProofsService) {}

  @Get(":id/payment-proofs")
  @RequirePermissions(INVOICES_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List payment proofs for an invoice" })
  list(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) invoiceId: string,
  ) {
    return this.proofs.listForInvoice(tenantId, invoiceId);
  }

  @Post(":id/payment-proofs")
  @RequirePermissions(INVOICES_PERMISSIONS.UPDATE)
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      required: ["file", "amount_claimed", "payment_date"],
      properties: {
        file: { type: "string", format: "binary" },
        amount_claimed: { type: "string", example: "100.00" },
        payment_date: { type: "string", example: "2026-09-30" },
        reference_number: { type: "string" },
        notes: { type: "string" },
      },
    },
  })
  @UseInterceptors(paymentProofUploadInterceptor())
  @ApiOperation({
    summary:
      "Upload a payment proof on behalf of the customer / for a vendor payment",
  })
  upload(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) invoiceId: string,
    @Body() dto: StaffUploadPaymentProofDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException(
        "Payment proof file is required (multipart field name: file).",
      );
    }
    return this.proofs.createByStaff(tenantId, invoiceId, dto, file, actorId);
  }
}

/**
 * Nested aliases under /purchase-invoices — same proof APIs as customer
 * invoices, direction TENANT_TO_VENDOR when the invoice is a purchase bill.
 */
@ApiTags("Purchase Invoices")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("purchase-invoices")
export class PurchaseInvoicePaymentProofsController {
  constructor(private readonly proofs: PaymentProofsService) {}

  @Get(":id/payment-proofs")
  @RequirePermissions(INVOICES_PERMISSIONS.VIEW)
  @ApiOperation({
    summary: "List payment proofs for a purchase invoice (admin → vendor)",
  })
  list(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) invoiceId: string,
  ) {
    return this.proofs.listForInvoice(tenantId, invoiceId);
  }

  @Post(":id/payment-proofs")
  @RequirePermissions(INVOICES_PERMISSIONS.UPDATE)
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      required: ["file", "amount_claimed", "payment_date"],
      properties: {
        file: { type: "string", format: "binary" },
        amount_claimed: { type: "string", example: "100.00" },
        payment_date: { type: "string", example: "2026-09-30" },
        reference_number: { type: "string" },
        notes: { type: "string" },
      },
    },
  })
  @UseInterceptors(paymentProofUploadInterceptor())
  @ApiOperation({
    summary:
      "Upload remittance proof for a vendor purchase invoice (same flow as customer invoices)",
  })
  upload(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) invoiceId: string,
    @Body() dto: StaffUploadPaymentProofDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException(
        "Payment proof file is required (multipart field name: file).",
      );
    }
    return this.proofs.createByStaff(tenantId, invoiceId, dto, file, actorId);
  }
}
