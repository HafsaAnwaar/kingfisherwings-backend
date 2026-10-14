import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { Response } from "express";
import { memoryStorage } from "multer";
import "multer";
import { InvoiceType, OpsUploaderSide } from "@prisma/client";
import { SkipStaffJwt } from "../../common/decorators/skip-staff-jwt.decorator";
import { DashboardPeriodQueryDto } from "../../common/dto/dashboard-period-query.dto";
import { InvoiceAttachmentService } from "../invoices/invoice-attachment.service";
import { VoucherAttachmentService } from "../gl/voucher-attachment.service";
import { CurrentPortal } from "./decorators/portal.decorators";
import {
  PortalCreditAgingQueryDto,
  PortalInvoiceQueryDto,
  PortalPaymentQueryDto,
  UploadPortalPaymentProofDto,
  RecordPortalPaymentDto,
} from "./dto/portal-finance.dto";
import { PortalAuthGuard } from "./guards/portal-auth.guard";
import { CurrentPortalUser } from "./interfaces/portal-auth.interfaces";
import { PortalFinanceService } from "./portal-finance.service";

const PROOF_MAX_BYTES = 8 * 1024 * 1024;
const PROOF_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

function portalPaymentProofInterceptor() {
  return FileInterceptor("file", {
    storage: memoryStorage(),
    limits: { fileSize: PROOF_MAX_BYTES },
    fileFilter: (_req, file, callback) => {
      if (!PROOF_MIME.has(file.mimetype)) {
        return callback(
          new BadRequestException(
            "Only PDF, JPEG, PNG, or WebP payment proof files are accepted.",
          ),
          false,
        );
      }
      callback(null, true);
    },
  });
}

@ApiTags("Portal Invoices")
@ApiBearerAuth()
@SkipStaffJwt()
@UseGuards(PortalAuthGuard)
@Controller("portal/invoices")
export class PortalInvoicesController {
  constructor(
    private readonly finance: PortalFinanceService,
    private readonly attachments: InvoiceAttachmentService,
  ) {}

  @Get("open-items")
  @ApiOperation({ summary: "Invoices with outstanding balance" })
  openItems(@CurrentPortal() user: CurrentPortalUser) {
    return this.finance.listOpenItems(user);
  }

  @Get("summary")
  @ApiOperation({
    summary: "Invoice outstanding / overdue counters",
    description: "Supports period=7d|30d|mtd|custom (filters by invoice_date).",
  })
  summary(
    @CurrentPortal() user: CurrentPortalUser,
    @Query() query: DashboardPeriodQueryDto,
  ) {
    return this.finance.invoiceSummary(user, query.resolve("30d"));
  }

  @Get("export.csv")
  @ApiOperation({
    summary: "Export my invoices as CSV",
    description: "Same filters as the list endpoint. Capped at 5000 rows.",
  })
  exportCsv(
    @CurrentPortal() user: CurrentPortalUser,
    @Query() query: PortalInvoiceQueryDto,
    @Res() res: Response,
  ) {
    return this.finance.exportInvoicesCsv(user, query, res);
  }

  @Get()
  @ApiOperation({ summary: "List my customer invoices" })
  list(
    @CurrentPortal() user: CurrentPortalUser,
    @Query() query: PortalInvoiceQueryDto,
  ) {
    return this.finance.listInvoices(user, query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Invoice detail (no internal notes)" })
  detail(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.finance.getInvoice(user, id);
  }

  @Get(":id/pdf")
  @ApiOperation({ summary: "Download invoice PDF if permitted" })
  downloadPdf(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    return this.finance.downloadInvoicePdf(user, id, res);
  }

  @Get(":id/attachments")
  @ApiOperation({ summary: "List supporting attachments on my invoice" })
  async listAttachments(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    await this.attachments.assertOwnedByParty(user.tenantId, id, user.partyId, [
      InvoiceType.CUSTOMER_INVOICE,
      InvoiceType.CREDIT_NOTE,
      InvoiceType.DEBIT_NOTE,
    ]);
    return this.attachments.list(user.tenantId, id);
  }

  @Post(":id/attachments")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FileInterceptor("file", { limits: { fileSize: 25 * 1024 * 1024 } }),
  )
  @ApiOperation({
    summary: "Upload a supporting file on my invoice (staff can always see)",
  })
  async uploadAttachment(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    await this.attachments.assertOwnedByParty(user.tenantId, id, user.partyId, [
      InvoiceType.CUSTOMER_INVOICE,
      InvoiceType.CREDIT_NOTE,
      InvoiceType.DEBIT_NOTE,
    ]);
    return this.attachments.upload(user.tenantId, id, file, {
      userId: user.id,
      side: OpsUploaderSide.CUSTOMER,
      partyId: user.partyId,
    });
  }

  @Get(":id/attachments/:attachmentId/download")
  @ApiOperation({ summary: "Download a supporting attachment on my invoice" })
  async downloadAttachment(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("attachmentId", ParseUUIDPipe) attachmentId: string,
    @Res() res: Response,
  ) {
    await this.attachments.assertOwnedByParty(user.tenantId, id, user.partyId, [
      InvoiceType.CUSTOMER_INVOICE,
      InvoiceType.CREDIT_NOTE,
      InvoiceType.DEBIT_NOTE,
    ]);
    return this.attachments.download(user.tenantId, id, attachmentId, res);
  }

  @Post(":id/payments")
  @ApiConsumes("multipart/form-data")
  @ApiOperation({
    summary:
      "Record a customer payment (posts RECEIPT immediately; optional proof file). Staff may reject later to reverse.",
  })
  @ApiBody({
    schema: {
      type: "object",
      required: ["amount", "payment_date"],
      properties: {
        file: { type: "string", format: "binary" },
        amount: { type: "string", example: "100.00" },
        payment_date: { type: "string", example: "2026-09-14" },
        reference_number: { type: "string" },
        notes: { type: "string" },
      },
    },
  })
  @UseInterceptors(portalPaymentProofInterceptor())
  recordPayment(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: RecordPortalPaymentDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.finance.recordCustomerPayment(
      user,
      id,
      {
        amount: body.amount,
        payment_date: body.payment_date,
        reference_number: body.reference_number,
        notes: body.notes,
      },
      file,
    );
  }

  @Get(":id/payment-proofs")
  @ApiOperation({ summary: "List payment proofs for an invoice" })
  listPaymentProofs(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.finance.listPaymentProofs(user, id);
  }

  @Post(":id/payment-proofs")
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Upload payment proof for an invoice (no balance change until staff posts RECEIPT, or use POST .../payments)" })
  @ApiBody({
    schema: {
      type: "object",
      required: ["file", "amount_claimed", "payment_date"],
      properties: {
        file: { type: "string", format: "binary" },
        amount_claimed: { type: "string", example: "100.00" },
        payment_date: { type: "string", example: "2026-09-14" },
        reference_number: { type: "string" },
        notes: { type: "string" },
      },
    },
  })
  @UseInterceptors(portalPaymentProofInterceptor())
  uploadPaymentProof(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: UploadPortalPaymentProofDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException(
        "Payment proof file is required (multipart field name: file).",
      );
    }
    return this.finance.uploadPaymentProof(
      user,
      id,
      {
        amount_claimed: body.amount_claimed,
        payment_date: body.payment_date,
        reference_number: body.reference_number,
        notes: body.notes,
      },
      file,
    );
  }
}

@ApiTags("Portal Credit Notes")
@ApiBearerAuth()
@SkipStaffJwt()
@UseGuards(PortalAuthGuard)
@Controller("portal/credit-notes")
export class PortalCreditNotesController {
  constructor(private readonly finance: PortalFinanceService) {}

  @Get()
  @ApiOperation({ summary: "List credit notes applied to my account" })
  list(
    @CurrentPortal() user: CurrentPortalUser,
    @Query() query: PortalInvoiceQueryDto,
  ) {
    return this.finance.listCreditNotes(user, query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Credit note detail" })
  detail(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.finance.getInvoice(user, id);
  }
}

@ApiTags("Portal Debit Notes")
@ApiBearerAuth()
@SkipStaffJwt()
@UseGuards(PortalAuthGuard)
@Controller("portal/debit-notes")
export class PortalDebitNotesController {
  constructor(private readonly finance: PortalFinanceService) {}

  @Get()
  @ApiOperation({ summary: "List debit notes on my account" })
  list(
    @CurrentPortal() user: CurrentPortalUser,
    @Query() query: PortalInvoiceQueryDto,
  ) {
    return this.finance.listDebitNotes(user, query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Debit note detail" })
  detail(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.finance.getInvoice(user, id);
  }
}

@ApiTags("Portal Payments")
@ApiBearerAuth()
@SkipStaffJwt()
@UseGuards(PortalAuthGuard)
@Controller("portal/payments")
export class PortalPaymentsController {
  constructor(private readonly finance: PortalFinanceService) {}

  @Get()
  @ApiOperation({ summary: "Payment / receipt history for my account" })
  list(
    @CurrentPortal() user: CurrentPortalUser,
    @Query() query: PortalPaymentQueryDto,
  ) {
    return this.finance.listPayments(user, query);
  }

  @Get("summary")
  @ApiOperation({ summary: "Total paid YTD vs outstanding" })
  summary(@CurrentPortal() user: CurrentPortalUser) {
    return this.finance.paymentsSummary(user);
  }
}

@ApiTags("Portal Credit (CCP)")
@ApiBearerAuth()
@SkipStaffJwt()
@UseGuards(PortalAuthGuard)
@Controller("portal/credit")
export class PortalCreditController {
  constructor(private readonly finance: PortalFinanceService) {}

  @Get("summary")
  @ApiOperation({ summary: "Credit limit, used, available" })
  summary(@CurrentPortal() user: CurrentPortalUser) {
    return this.finance.creditSummary(user);
  }

  @Get("aging")
  @ApiOperation({ summary: "AR aging buckets for my account" })
  aging(
    @CurrentPortal() user: CurrentPortalUser,
    @Query() query: PortalCreditAgingQueryDto,
  ) {
    return this.finance.creditAging(user, query);
  }

  @Get("statement")
  @ApiOperation({ summary: "AR account statement (JSON)" })
  statement(
    @CurrentPortal() user: CurrentPortalUser,
    @Query() query: PortalCreditAgingQueryDto,
  ) {
    return this.finance.creditStatement(user, query);
  }

  @Get("statement.pdf")
  @ApiOperation({
    summary:
      "Download AR statement PDF (requires STATEMENT download permission)",
  })
  statementPdf(
    @CurrentPortal() user: CurrentPortalUser,
    @Query() query: PortalCreditAgingQueryDto,
    @Res() res: Response,
  ) {
    return this.finance.downloadStatementPdf(user, query, res);
  }
}

@ApiTags("Portal Vouchers")
@ApiBearerAuth()
@SkipStaffJwt()
@UseGuards(PortalAuthGuard)
@Controller("portal/vouchers")
export class PortalVouchersController {
  constructor(private readonly attachments: VoucherAttachmentService) {}

  @Get(":id/attachments")
  @ApiOperation({
    summary: "List attachments on a voucher linked to my party",
  })
  async listAttachments(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    await this.attachments.assertOwnedByParty(
      user.tenantId,
      id,
      user.partyId,
    );
    return this.attachments.list(user.tenantId, id);
  }

  @Post(":id/attachments")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FileInterceptor("file", { limits: { fileSize: 25 * 1024 * 1024 } }),
  )
  @ApiOperation({ summary: "Upload an attachment on my linked voucher" })
  async uploadAttachment(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    await this.attachments.assertOwnedByParty(
      user.tenantId,
      id,
      user.partyId,
    );
    return this.attachments.upload(user.tenantId, id, file, {
      userId: user.id,
      side: OpsUploaderSide.CUSTOMER,
      partyId: user.partyId,
    });
  }

  @Get(":id/attachments/:attachmentId/download")
  @ApiOperation({ summary: "Download a voucher attachment" })
  async downloadAttachment(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("attachmentId", ParseUUIDPipe) attachmentId: string,
    @Res() res: Response,
  ) {
    await this.attachments.assertOwnedByParty(
      user.tenantId,
      id,
      user.partyId,
    );
    return this.attachments.download(user.tenantId, id, attachmentId, res);
  }
}
