import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { DocumentEmailService } from "../../shared/email/document-email.service";
import { DocumentShareEmailDto } from "../../shared/email/dto/document-share-email.dto";
import { ArApService } from "./ar-ap.service";
import { PaymentsService } from "./payments.service";
import { AgingQueryDto } from "./dto/ar-ap.dto";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class GlDocumentShareService {
  constructor(
    private readonly documentEmail: DocumentEmailService,
    private readonly arAp: ArApService,
    private readonly payments: PaymentsService,
    private readonly prisma: PrismaService,
  ) {}

  async sendArStatement(
    tenantId: string,
    partyId: string,
    dto: DocumentShareEmailDto,
    query: AgingQueryDto,
    actorId?: string,
  ) {
    return this.sendStatement(tenantId, partyId, dto, query, "AR", actorId);
  }

  async sendApStatement(
    tenantId: string,
    partyId: string,
    dto: DocumentShareEmailDto,
    query: AgingQueryDto,
    actorId?: string,
  ) {
    return this.sendStatement(tenantId, partyId, dto, query, "AP", actorId);
  }

  private async sendStatement(
    tenantId: string,
    partyId: string,
    dto: DocumentShareEmailDto,
    query: AgingQueryDto,
    side: "AR" | "AP",
    actorId?: string,
  ) {
    const statement = await this.arAp.partyStatement(
      tenantId,
      partyId,
      query,
      side,
    );
    if (!statement.party) {
      throw new NotFoundException("Party not found");
    }

    const fallback = await this.documentEmail.resolvePartyEmails(
      tenantId,
      partyId,
      side === "AR" ? "portal" : "vendor",
    );
    const { to, cc } = this.documentEmail.pickRecipients(dto, fallback);

    const asOf =
      typeof statement.as_of === "string"
        ? statement.as_of.slice(0, 10)
        : new Date(statement.as_of as Date).toISOString().slice(0, 10);
    const title =
      side === "AR" ? "Customer AR Statement" : "Vendor AP Statement";
    const includePdf = dto.include_pdf !== false;

    let attachmentBuffer: Buffer | undefined;
    let attachmentName: string | undefined;
    if (includePdf) {
      attachmentBuffer = await this.documentEmail.buildStatementPdf({
        title,
        partyName: statement.party.name,
        asOf,
        openBalance: Number(statement.summary?.open_balance ?? 0),
        invoices: statement.invoices ?? [],
      });
      attachmentName = `${side.toLowerCase()}-statement-${partyId.slice(0, 8)}-${asOf}.pdf`;
    }

    const body =
      dto.message ??
      `<p>Please find the ${title.toLowerCase()} for <strong>${statement.party.name}</strong> (as of ${asOf}).</p>
       <p>Open balance: <strong>${Number(statement.summary?.open_balance ?? 0).toFixed(2)}</strong></p>`;

    return this.documentEmail.sendDocument({
      tenantId,
      eventType: side === "AR" ? "AR_STATEMENT" : "AP_STATEMENT",
      to,
      cc,
      subject: `${title} — ${statement.party.name}`,
      bodyHtml: body,
      attachmentBuffer,
      attachmentName,
      createdBy: actorId,
    });
  }

  async sendRemittance(
    tenantId: string,
    paymentId: string,
    dto: DocumentShareEmailDto,
    actorId?: string,
  ) {
    const payment = await this.payments.findOne(tenantId, paymentId);
    if (payment.direction !== "PAYMENT") {
      throw new BadRequestException(
        "Remittance email is only for vendor payments (direction=PAYMENT).",
      );
    }

    const fallback = await this.documentEmail.resolvePartyEmails(
      tenantId,
      payment.party_id,
      "vendor",
    );
    const { to, cc } = this.documentEmail.pickRecipients(dto, fallback);

    const includePdf = dto.include_pdf !== false;
    let attachmentBuffer: Buffer | undefined;
    let attachmentName: string | undefined;
    if (includePdf) {
      attachmentBuffer = await this.documentEmail.buildRemittancePdf(payment);
      attachmentName = `remittance-${payment.payment_number}.pdf`;
    }

    const partyName =
      (payment as { party?: { name?: string } }).party?.name ?? "Vendor";
    const body =
      dto.message ??
      `<p>Please find remittance advice for payment <strong>${payment.payment_number}</strong>.</p>
       <p>Amount: ${payment.currency_code} ${payment.amount}</p>`;

    return this.documentEmail.sendDocument({
      tenantId,
      eventType: "REMITTANCE_SEND",
      to,
      cc,
      subject: `Remittance ${payment.payment_number} — ${partyName}`,
      bodyHtml: body,
      attachmentBuffer,
      attachmentName,
      createdBy: actorId,
    });
  }

  async sendCreditSummary(
    tenantId: string,
    partyId: string,
    dto: DocumentShareEmailDto,
    actorId?: string,
  ) {
    const [party, statement] = await Promise.all([
      this.documentEmail.requireParty(tenantId, partyId),
      this.arAp.partyStatement(tenantId, partyId, {}, "AR"),
    ]);

    const partyFull = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.party.findFirst({
        where: { id: partyId, tenant_id: tenantId, deleted_at: null },
        select: {
          credit_limit: true,
          credit_days: true,
          credit_status: true,
          currency_code: true,
        },
      }),
    );

    const fallback = await this.documentEmail.resolvePartyEmails(
      tenantId,
      partyId,
      "portal",
    );
    const { to, cc } = this.documentEmail.pickRecipients(dto, fallback);

    const creditLimit =
      partyFull?.credit_limit != null ? Number(partyFull.credit_limit) : null;
    const used = Number(statement.summary?.open_balance ?? 0);
    const available =
      creditLimit != null ? Math.max(0, creditLimit - used) : null;

    const includePdf = dto.include_pdf !== false;
    let attachmentBuffer: Buffer | undefined;
    let attachmentName: string | undefined;
    if (includePdf) {
      const asOf = new Date().toISOString().slice(0, 10);
      attachmentBuffer = await this.documentEmail.buildStatementPdf({
        title: "Accounts / Credit Summary",
        partyName: party.name,
        asOf,
        openBalance: used,
        invoices: statement.invoices ?? [],
      });
      attachmentName = `credit-summary-${partyId.slice(0, 8)}.pdf`;
    }

    const body =
      dto.message ??
      `<p>Accounts / credit summary for <strong>${party.name}</strong>.</p>
       <ul>
         <li>Credit limit: ${creditLimit ?? "n/a"}</li>
         <li>Credit days: ${partyFull?.credit_days ?? "n/a"}</li>
         <li>Status: ${partyFull?.credit_status ?? "n/a"}</li>
         <li>Used: ${used.toFixed(2)} ${partyFull?.currency_code ?? ""}</li>
         <li>Available: ${available != null ? available.toFixed(2) : "n/a"}</li>
       </ul>`;

    return this.documentEmail.sendDocument({
      tenantId,
      eventType: "CREDIT_SUMMARY_SEND",
      to,
      cc,
      subject: `Credit summary — ${party.name}`,
      bodyHtml: body,
      attachmentBuffer,
      attachmentName,
      createdBy: actorId,
    });
  }
}
