import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import twilio from "twilio";
import { PrismaService } from "../../prisma/prisma.service";

export type WhatsAppSendParams = {
  tenantId: string;
  toPhoneE164: string;
  body: string;
  jobId?: string;
  createdBy?: string;
};

export type WhatsAppSendResult = {
  channel: "whatsapp";
  stub: boolean;
  delivered: boolean;
  status: string;
  to: string;
  provider_message_id: string | null;
  log_id: string | null;
  message: string;
};

function normalizeE164(raw: string): string {
  const trimmed = raw.trim().replace(/[\s()-]/g, "");
  if (!trimmed) {
    throw new BadRequestException("Phone number is required.");
  }
  const withPlus = trimmed.startsWith("+") ? trimmed : `+${trimmed}`;
  if (!/^\+[1-9]\d{7,14}$/.test(withPlus)) {
    throw new BadRequestException(
      "Phone must be E.164 format (e.g. +971501234567).",
    );
  }
  return withPlus;
}

function toWhatsAppAddress(phoneOrWa: string): string {
  const raw = phoneOrWa.trim();
  if (raw.toLowerCase().startsWith("whatsapp:")) {
    const e164 = normalizeE164(raw.slice("whatsapp:".length));
    return `whatsapp:${e164}`;
  }
  return `whatsapp:${normalizeE164(raw)}`;
}

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  getConfigStatus() {
    const enabled = this.isEnabled();
    const provider = this.provider();
    const accountSid = this.accountSid();
    const authToken = this.authToken();
    const from = this.fromNumber();
    return {
      enabled,
      provider: provider || null,
      from_configured: !!from,
      from_preview: from ? this.maskFrom(from) : null,
      credentials_configured: !!(accountSid && authToken),
      ready: enabled && provider === "twilio" && !!accountSid && !!authToken && !!from,
      hint: enabled
        ? provider === "twilio"
          ? accountSid && authToken && from
            ? "Twilio WhatsApp is ready."
            : "Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_FROM."
          : "Set WHATSAPP_PROVIDER=twilio (only Twilio is implemented)."
        : "Set WHATSAPP_ENABLED=true after pasting Twilio credentials.",
    };
  }

  async sendStatusMessage(
    params: WhatsAppSendParams,
  ): Promise<WhatsAppSendResult> {
    return this.send(params);
  }

  async send(params: WhatsAppSendParams): Promise<WhatsAppSendResult> {
    const toE164 = normalizeE164(params.toPhoneE164);
    const body = params.body?.trim();
    if (!body) {
      throw new BadRequestException("Message body is required.");
    }

    const enabled = this.isEnabled();
    const provider = this.provider();
    const accountSid = this.accountSid();
    const authToken = this.authToken();
    const from = this.fromNumber();

    if (enabled && provider === "twilio" && (!accountSid || !authToken || !from)) {
      this.logger.error(
        `WhatsApp enabled but Twilio credentials incomplete (to=${toE164})`,
      );
      throw new ServiceUnavailableException(
        "WhatsApp is enabled but Twilio is not fully configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM (or legacy WHATSAPP_FROM_NUMBER), or set WHATSAPP_ENABLED=false for stub mode.",
      );
    }

    if (enabled && provider && provider !== "twilio") {
      throw new ServiceUnavailableException(
        `WhatsApp provider "${provider}" is not implemented. Use WHATSAPP_PROVIDER=twilio.`,
      );
    }

    const bodyForLog = params.jobId
      ? `[job:${params.jobId}] ${body}`
      : body;

    if (!enabled || provider !== "twilio") {
      this.logger.log(
        `WhatsApp STUB → ${toE164}: ${body.slice(0, 80)}`,
      );
      const logId = await this.appendLog(params.tenantId, {
        to: toE164,
        body: bodyForLog,
        status: "STUB",
        createdBy: params.createdBy,
      });
      return {
        channel: "whatsapp",
        stub: true,
        delivered: false,
        status: "STUB",
        to: toE164,
        provider_message_id: null,
        log_id: logId,
        message:
          "WhatsApp stub: message logged for audit, not delivered. Set WHATSAPP_ENABLED=true and Twilio credentials to deliver.",
      };
    }

    const toWa = toWhatsAppAddress(toE164);
    const fromWa = toWhatsAppAddress(from as string);

    try {
      const client = twilio(accountSid as string, authToken as string);
      const msg = await client.messages.create({
        from: fromWa,
        to: toWa,
        body,
      });

      this.logger.log(
        `WhatsApp SENT → ${toE164} sid=${msg.sid} status=${msg.status}`,
      );

      const logId = await this.appendLog(params.tenantId, {
        to: toE164,
        body: bodyForLog,
        status: msg.status?.toUpperCase() || "SENT",
        createdBy: params.createdBy,
      });

      return {
        channel: "whatsapp",
        stub: false,
        delivered: true,
        status: msg.status?.toUpperCase() || "SENT",
        to: toE164,
        provider_message_id: msg.sid ?? null,
        log_id: logId,
        message: "WhatsApp message accepted by Twilio.",
      };
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      this.logger.error(`WhatsApp Twilio send failed → ${toE164}: ${errMsg}`);
      await this.appendLog(params.tenantId, {
        to: toE164,
        body: bodyForLog,
        status: "FAILED",
        createdBy: params.createdBy,
      });
      throw new ServiceUnavailableException(
        `WhatsApp send failed: ${errMsg}`,
      );
    }
  }

  private isEnabled(): boolean {
    return this.config.get<string>("WHATSAPP_ENABLED") === "true";
  }

  private provider(): string {
    return (this.config.get<string>("WHATSAPP_PROVIDER") ?? "")
      .trim()
      .toLowerCase();
  }

  private accountSid(): string | undefined {
    return (
      this.config.get<string>("TWILIO_ACCOUNT_SID")?.trim() ||
      this.config.get<string>("WHATSAPP_ACCOUNT_SID")?.trim() ||
      undefined
    );
  }

  private authToken(): string | undefined {
    return (
      this.config.get<string>("TWILIO_AUTH_TOKEN")?.trim() ||
      this.config.get<string>("WHATSAPP_API_TOKEN")?.trim() ||
      this.config.get<string>("WHATSAPP_API_KEY")?.trim() ||
      undefined
    );
  }

  private fromNumber(): string | undefined {
    return (
      this.config.get<string>("TWILIO_WHATSAPP_FROM")?.trim() ||
      this.config.get<string>("WHATSAPP_FROM_NUMBER")?.trim() ||
      undefined
    );
  }

  private maskFrom(from: string): string {
    const digits = from.replace(/\D/g, "");
    if (digits.length < 4) return "whatsapp:***";
    return `whatsapp:+***${digits.slice(-4)}`;
  }

  private async appendLog(
    tenantId: string,
    row: {
      to: string;
      body: string;
      status: string;
      createdBy?: string;
    },
  ): Promise<string | null> {
    try {
      const created = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.outboundMessageLog.create({
          data: {
            tenant_id: tenantId,
            channel: "WHATSAPP",
            to_address: row.to.slice(0, 100),
            body_snippet: row.body.slice(0, 500),
            status: row.status.slice(0, 30),
            created_by: row.createdBy,
            updated_by: row.createdBy,
          },
        }),
      );
      return created.id;
    } catch (err) {
      this.logger.warn(
        `Failed to write OutboundMessageLog: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
      return null;
    }
  }
}
