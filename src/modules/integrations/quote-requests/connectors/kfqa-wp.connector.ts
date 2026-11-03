import {
  BadGatewayException,
  UnauthorizedException,
} from "@nestjs/common";
import {
  NormalizedQuoteRequest,
  QuoteRequestConnector,
  QuoteRequestListOpts,
  UpdateStatusExtra,
} from "./quote-request-connector.interface";
import {
  normalizeQuoteRequestItem,
  normalizeQuoteRequestList,
} from "./normalize-quote-request";

export type KfqaWpConnectorOptions = {
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

/**
 * Accept pasted full endpoints like
 * https://host/wp-json/kfqa/v1/quotes → strip /quotes.
 */
function normalizeKfqaBaseUrl(raw: string): string {
  let url = raw.trim().replace(/\/+$/, "");
  url = url.replace(/\/quotes\/?$/i, "");
  return url;
}

/**
 * KingFisher Wings Quote Aggregator (kfqa/v1) — product / general-trading quotes.
 * Auth: X-API-Key. Sync: GET ?synced=false then POST /quotes/ack.
 */
export class KfqaWpConnector implements QuoteRequestConnector {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly authHeaderName: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(opts: KfqaWpConnectorOptions) {
    this.baseUrl = normalizeKfqaBaseUrl(opts.baseUrl);
    this.apiKey = opts.apiKey.trim();
    this.authHeaderName = opts.authHeaderName?.trim() || "X-API-Key";
    this.timeoutMs = opts.timeoutMs ?? 15_000;
    this.fetchImpl = opts.fetchImpl ?? fetch;
  }

  async health(): Promise<{ ok: boolean; message?: string }> {
    try {
      const json = await this.request("GET", "ping");
      const rec = json as {
        ok?: boolean;
        sources?: unknown;
        statuses?: unknown;
        message?: string;
      };
      return {
        ok: rec?.ok !== false,
        message:
          typeof rec?.message === "string"
            ? rec.message
            : `OK — KFQA ping${Array.isArray(rec?.sources) ? ` (sources: ${(rec.sources as string[]).join(",")})` : ""}`,
      };
    } catch (err) {
      // Fallback: list unsynced
      try {
        const list = await this.list({ synced: false, per_page: 1 });
        return {
          ok: true,
          message: `OK — list reachable (${list.total} unsynced)`,
        };
      } catch {
        return {
          ok: false,
          message: err instanceof Error ? err.message : String(err),
        };
      }
    }
  }

  async list(
    opts: QuoteRequestListOpts = {},
  ): Promise<{ total: number; pages?: number; items: NormalizedQuoteRequest[] }> {
    const page = opts.page ?? 1;
    const perPage = Math.min(opts.per_page ?? 50, 100);
    const qs = new URLSearchParams();
    qs.set("page", String(page));
    qs.set("per_page", String(perPage));
    qs.set("order", opts.order ?? "asc");
    if (opts.synced === false) qs.set("synced", "false");
    if (opts.synced === true) qs.set("synced", "true");
    if (opts.source) qs.set("source", opts.source);
    if (opts.status) qs.set("status", opts.status);
    if (opts.since) qs.set("since", opts.since);

    const json = await this.request("GET", `quotes?${qs.toString()}`);
    return normalizeQuoteRequestList(json);
  }

  async get(externalId: string): Promise<NormalizedQuoteRequest> {
    const id = encodeURIComponent(String(externalId).trim());
    const json = await this.request("GET", `quotes/${id}`);
    const item = normalizeQuoteRequestItem(json);
    if (!item) {
      throw new BadGatewayException(
        "Remote KFQA quote payload could not be normalized.",
      );
    }
    return item;
  }

  async updateStatus(
    externalId: string,
    status: string,
    extra?: UpdateStatusExtra,
  ): Promise<void> {
    const id = encodeURIComponent(String(externalId).trim());
    const body: Record<string, unknown> = { status };
    if (extra?.software_ref != null) body.software_ref = extra.software_ref;
    if (extra?.synced != null) body.synced = extra.synced;
    await this.request("PATCH", `quotes/${id}`, body);
  }

  async acknowledge(ids: string[]): Promise<void> {
    const clean = ids.map((x) => String(x).trim()).filter(Boolean);
    if (!clean.length) return;
    await this.request("POST", "quotes/ack", { ids: clean });
  }

  private async request(
    method: string,
    path: string,
    body?: Record<string, unknown>,
  ): Promise<unknown> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const url = joinUrl(this.baseUrl, path);
      const headers: Record<string, string> = {
        Accept: "application/json",
        [this.authHeaderName]: this.apiKey,
        "X-API-Key": this.apiKey,
      };
      if (body) headers["Content-Type"] = "application/json";

      const res = await this.fetchImpl(url, {
        method,
        headers,
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
          "KFQA API rejected the API key (use header X-API-Key).",
        );
      }
      if (!res.ok) {
        const msg =
          (json as { message?: string })?.message ||
          `KFQA ${method} ${path} failed with HTTP ${res.status}`;
        throw new BadGatewayException(msg);
      }
      return json;
    } finally {
      clearTimeout(timer);
    }
  }
}
