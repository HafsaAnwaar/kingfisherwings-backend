export type InvoiceFormatPayload = {
  format_key: string;
  template_code: string;
  company: {
    name: string;
    address_lines: string[];
    logo_url?: string;
    website?: string;
    gstin?: string;
  };
  bill_to: {
    name: string;
    address_lines: string[];
    phone?: string;
    gstin?: string;
  };
  invoice: {
    number: string;
    invoice_date: string;
    due_date?: string;
    status?: string;
    currency_code: string;
    exchange_rate: number;
    remarks?: string;
    narration?: string;
  };
  shipment?: {
    shipper?: string;
    consignee?: string;
    job_no?: string;
    shipment_no?: string;
    mbl_mawb?: string;
    hbl_hawb?: string;
    place_of_receipt?: string;
    por?: string;
    pol?: string;
    pod?: string;
    place_of_delivery?: string;
    vessel_voyage?: string;
    etd?: string;
    eta?: string;
    igm?: string;
    reference_no?: string;
    inco_terms?: string;
  };
  containers: Array<{
    container_no: string;
    type?: string;
    pieces?: string;
    gross_weight?: string;
    volume?: string;
    volume_weight?: string;
  }>;
  lines: Array<{
    description: string;
    sac_hsn?: string;
    qty: number;
    amount_per_qty: number;
    currency: string;
    exchange_rate: number;
    fcy_amount: number;
    taxable_amount: number;
    non_taxable_amount: number;
    sgst_rate?: number;
    sgst_amount?: number;
    cgst_rate?: number;
    cgst_amount?: number;
    igst_rate?: number;
    igst_amount?: number;
    total_inr: number;
  }>;
  totals: {
    taxable: number;
    non_taxable: number;
    sgst: number;
    cgst: number;
    igst: number;
    grand_total: number;
    amount_in_words: string;
    tax_buckets?: Array<{ label: string; amount: number }>;
  };
  terms: string[];
  bank?: {
    beneficiary_name?: string;
    bank_name?: string;
    account_no?: string;
    iban?: string;
    swift?: string;
    address?: string;
  };
  footer?: {
    created_by?: string;
    generated_at?: string;
    timezone?: string;
  };
  gst_note?: string;
};
