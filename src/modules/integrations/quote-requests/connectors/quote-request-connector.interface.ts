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
  raw: Record<string, unknown>;
};

export interface QuoteRequestConnector {
  health(): Promise<{ ok: boolean; message?: string }>;
  list(opts?: {
    page?: number;
  }): Promise<{ total: number; items: NormalizedQuoteRequest[] }>;
  get(externalId: string): Promise<NormalizedQuoteRequest>;
  updateStatus(externalId: string, status: string): Promise<void>;
}
