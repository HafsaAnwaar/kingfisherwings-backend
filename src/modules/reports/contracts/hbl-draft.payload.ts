/**
 * Display-ready HBL draft payload (sea.hbl_draft / HBL_DRAFT_REPORT_FORMAT_JASPER).
 * Calculations stay in the pack; templates consume these values as-is.
 * Missing optional fields stay null/omitted — do not invent notify/net_weight/freight_terms.
 */

export type HblPartyBlock = {
  name: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
} | null;

export type HblContainerRow = {
  container_no: string;
  seal: string;
  type: string;
  gross_weight: string;
  cbm: string;
};

export type HblDraftPayload = {
  job_number: string;
  hbl_number: string;
  mbl_number: string;
  doc_ref: string;
  /** Flat party strings for HTML shell (empty when party absent). */
  shipper: string;
  consignee: string;
  notify: string;
  shipper_name: string;
  consignee_name: string;
  /** Structured parties — notify null when no party on job. */
  parties: {
    shipper: HblPartyBlock;
    consignee: HblPartyBlock;
    notify: HblPartyBlock;
  };
  routing: {
    pol: string;
    pod: string;
    vessel: string;
    voyage: string;
    etd: string | null;
    eta: string | null;
  };
  pol: string;
  pod: string;
  place_of_receipt: string;
  place_of_delivery: string;
  vessel_voyage: string;
  vessel_name: string;
  voyage_number: string;
  etd: string;
  eta: string;
  /** Comma-joined container numbers for shell; empty → "—". */
  containers: string;
  container_rows: HblContainerRow[];
  cargo: {
    description: string;
    pieces: string | null;
    gross_weight: string | null;
    volume: string | null;
    /** Intentionally omitted from schema — no net_weight on Job. */
  };
  commodity: string;
  pieces: string;
  gross_weight: string;
  volume_cbm: string;
  /** Freight terms when present (incoterms); null when absent. */
  freight_terms: string | null;
  letter_kind: string;
  letter_body: string;
  company_logo: string | null;
  company_name: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  company_vat: string;
  company_web: string;
  bank: unknown;
  is_draft: boolean;
  is_original: boolean;
};
