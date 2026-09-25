import {
  BadGatewayException,
  UnauthorizedException,
} from "@nestjs/common";
import {
  NormalizedQuoteRequest,
  QuoteRequestConnector,
} from "./quote-request-connector.interface";
import {
  normalizeQuoteRequestItem,
  normalizeQuoteRequestList,
} from "./normalize-quote-request";

export type KfppWpConnectorOptions = {
  baseUrl: string;
  apiKey: string;
  authHeaderName?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
};

function joinUrl(base: string, path: string): string {
  const b = base.replace(/\/+$/, "");
  const p = path.replace(/^\/+/, "");
  return `${b}/${p}`;
}

export class KfppWpConnector implements QuoteRequestConnector {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly authHeaderName: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(opts: KfppWpConnectorOptions) {
    this.baseUrl = opts.baseUrl.trim().replace(/\/+$/, "");
    this.apiKey = opts.apiKey.trim();
    this.authHeaderName = opts.authHeaderName?.trim() || "X-KFPP-Api-Key";
    this.timeoutMs = opts.timeoutMs ?? 15_000;
    this.fetchImpl = opts.fetchImpl ?? fetch;
  }

  async health(): Promise<{ ok: boolean; message?: string }> {
    try {
      const list = await this.list();
      return {
        ok: true,
        message: `OK — ${list.total} quote request(s) visible`,
      };
    } catch (err) {
      return {
        ok: false,
        message: err instanceof Error ? err.message : String(err),
      };
    }
  }

  async list(): Promise<{ total: number; items: NormalizedQuoteRequest[] }> {
    const json = await this.request("GET", "quotes");
    return normalizeQuoteRequestList(json);
  }

  async get(externalId: string): Promise<NormalizedQuoteRequest> {
    this.assertNumericId(externalId);
    const json = await this.request("GET", `quotes/${externalId}`);
    const item = normalizeQuoteRequestItem(json);
    if (!item) {
      throw new BadGatewayException(
        "Remote quote request payload could not be normalized.",
      );
    }
    return item;
  }

  async updateStatus(externalId: string, status: string): Promise<void> {
    this.assertNumericId(externalId);
    await this.request("PATCH", `quotes/${externalId}`, { status });
  }

  private assertNumericId(externalId: string) {
    if (!/^\d+$/.test(externalId)) {
      throw new BadGatewayException(
        "KFPP quote request id must be numeric digits only.",
      );
    }
  }

  private async request(
    method: string,
    path: string,
    body?: Record<string, unknown>,
  ): Promise<unknown> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await this.fetchImpl(joinUrl(this.baseUrl, path), {
        method,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          [this.authHeaderName]: this.apiKey,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      const text = await res.text();
      let json: unknown = null;
      if (text) {
        try {
          json = JSON.parse(text);
        } catch {
          json = { raw: text.slice(0, 400) };
        }
      }

      if (res.status === 401 || res.status === 403) {
        throw new UnauthorizedException(
          "External quote-requests API rejected the API key.",
        );
      }
      if (!res.ok) {
        const msg =
          (json as { message?: string })?.message ||
          `External API ${method} ${path} failed with HTTP ${res.status}`;
        throw new BadGatewayException(msg);
      }
      return json;
    } finally {
      clearTimeout(timer);
    }
  }
}
