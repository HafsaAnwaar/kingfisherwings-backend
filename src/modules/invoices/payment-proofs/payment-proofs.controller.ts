import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../users/guards/permissions.guard";
import { RequirePermissions } from "../../users/decorators/permissions.decorator";
import { CurrentUser } from "../../users/decorators/current-user.decorator";
import { INVOICES_PERMISSIONS } from "../constants/invoices-permission.constants";
import { PaymentProofsService } from "./payment-proofs.service";
import { ReviewPaymentProofDto } from "./payment-proofs.dto";

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
}
