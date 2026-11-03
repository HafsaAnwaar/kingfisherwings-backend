export type NormalizedQuoteRequest = {
  external_id: string;
  status: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  company_name: string | null;
  message: string | null;
  commodity: string | null;
  submitted_at: Date | null;
  /** KFQA / richer remotes */
  reference?: string | null;
  source?: string | null;
  source_label?: string | null;
  software_ref?: string | null;
  customer_type?: string | null;
  page_url?: string | null;
  admin_url?: string | null;
  raw: Record<string, unknown>;
};

export type QuoteRequestListOpts = {
  page?: number;
  per_page?: number;
  /** KFQA: only quotes not yet acknowledged by our software */
  synced?: boolean;
  order?: "asc" | "desc";
  source?: string;
  status?: string;
  since?: string;
};

export type UpdateStatusExtra = {
  software_ref?: string;
  synced?: boolean;
};

export interface QuoteRequestConnector {
  health(): Promise<{ ok: boolean; message?: string }>;
  list(
    opts?: QuoteRequestListOpts,
  ): Promise<{ total: number; pages?: number; items: NormalizedQuoteRequest[] }>;
  get(externalId: string): Promise<NormalizedQuoteRequest>;
  updateStatus(
    externalId: string,
    status: string,
    extra?: UpdateStatusExtra,
  ): Promise<void>;
  /** KFQA: mark ids received so they drop out of synced=false pulls */
  acknowledge?(ids: string[]): Promise<void>;
}
