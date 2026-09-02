import {
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
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { SkipStaffJwt } from "../../common/decorators/skip-staff-jwt.decorator";
import { CurrentPortal } from "./decorators/portal.decorators";
import {
  PortalCreditAgingQueryDto,
  PortalInvoiceQueryDto,
  PortalPaymentQueryDto,
} from "./dto/portal-finance.dto";
import { PortalAuthGuard } from "./guards/portal-auth.guard";
import { CurrentPortalUser } from "./interfaces/portal-auth.interfaces";
import { PortalFinanceService } from "./portal-finance.service";

@ApiTags("Portal Invoices")
@ApiBearerAuth()
@SkipStaffJwt()
@UseGuards(PortalAuthGuard)
@Controller("portal/invoices")
export class PortalInvoicesController {
  constructor(private readonly finance: PortalFinanceService) {}

  @Get("open-items")
  @ApiOperation({ summary: "Invoices with outstanding balance" })
  openItems(@CurrentPortal() user: CurrentPortalUser) {
    return this.finance.listOpenItems(user);
  }

  @Get("summary")
  @ApiOperation({ summary: "Invoice outstanding / overdue counters" })
  summary(@CurrentPortal() user: CurrentPortalUser) {
    return this.finance.invoiceSummary(user);
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
  @ApiOperation({ summary: "Upload payment proof for an invoice" })
  @UseInterceptors(FileInterceptor("file"))
  uploadPaymentProof(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body()
    body: {
      amount_claimed: string;
      payment_date: string;
      reference_number?: string;
      notes?: string;
    },
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.finance.uploadPaymentProof(
      user,
      id,
      {
        amount_claimed: Number(body.amount_claimed),
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
