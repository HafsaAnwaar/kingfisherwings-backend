export type InvoiceFormatPayload = {
  format_key: string;
  template_code: string;
  company: {
    name: string;
    address_lines: string[];
    logo_url?: string;
    phone?: string;
    email?: string;
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
    /** FE alias of qty (display-ready; not recalculated). */
    quantity: number;
    amount_per_qty: number;
    /** FE alias of amount_per_qty. */
    unit_price: number;
    currency: string;
    exchange_rate: number;
    fcy_amount: number;
    taxable_amount: number;
    non_taxable_amount: number;
    /** Line tax when present (same as igst_amount mapping today). */
    tax_amount?: number;
    /** Alias of total_inr for FE pilots. */
    line_total: number;
    /** SGST/CGST stay 0 until line-level GST components exist — do not invent split. */
    sgst_rate?: number | null;
    sgst_amount?: number | null;
    cgst_rate?: number | null;
    cgst_amount?: number | null;
    igst_rate?: number | null;
    igst_amount?: number | null;
    total_inr: number;
  }>;
  totals: {
    taxable: number;
    non_taxable: number;
    /** FE alias of taxable (provider-derived from stored lines). */
    subtotal: number;
    sgst: number | null;
    cgst: number | null;
    igst: number | null;
    /** FE alias of summed line tax / igst. */
    tax_total: number;
    /** FE alias of tax_total. */
    tax_amount: number;
    grand_total: number;
    /** FE alias of grand_total (from stored invoice.total_amount). */
    total_amount: number;
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
