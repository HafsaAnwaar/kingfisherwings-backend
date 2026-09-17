/**
 * Maps FRESA template codes → implemented Puppeteer pack keys.
 * Only applied when the target pack exists in IMPLEMENTED_RENDERER_KEYS.
 */

const EXACT: Record<string, string> = {
  INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA: "commercial.invoice_tax_india_1",
  INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA: "commercial.invoice_tax_india_2",
  INVOICE_REPORT_FORMAT_SUMMARY_INDIA: "commercial.invoice_summary_india",
  JOBS_LIST: "ops.jobs_list",
  OPS_LIST_GENERIC: "ops.list_generic",
  SEA_HBL_DRAFT: "sea.hbl_draft",
  SEA_HBL_ORIGINAL: "sea.hbl_original",
  SEA_ARRIVAL_NOTICE: "sea.arrival_notice",
  SEA_DELIVERY_ORDER: "sea.delivery_order",
  AIR_HAWB_DRAFT: "air.hawb_draft",
  AIR_HAWB_FINAL: "air.hawb_final",
  AIR_MAWB: "air.mawb",
  AIR_ARRIVAL_NOTICE: "air.arrival_notice",
  AIR_DELIVERY_ORDER: "air.delivery_order",
  QUOTATION_STANDARD: "quotation.standard",
  FINANCE_AGING: "finance.aging",
  FINANCE_SOA: "finance.soa",
  FINANCE_TRIAL_BALANCE: "finance.trial_balance",
  FINANCE_VOUCHER: "finance.voucher",
  FINANCE_OUTSTANDING_LETTER: "finance.outstanding_letter",
  WMS_ASN: "wms.asn",
  WMS_WAREHOUSE_NOTE: "wms.warehouse_note",
};

type Rule = { pattern: RegExp; renderer_key: string };

const RULES: Rule[] = [
  {
    pattern: /^INVOICE_REPORT_FORMAT_1/i,
    renderer_key: "commercial.invoice_tax_india_1",
  },
  {
    pattern: /^INVOICE_REPORT_FORMAT_2/i,
    renderer_key: "commercial.invoice_tax_india_2",
  },
  {
    pattern: /TAX_INVOICE_INDIA.*FORMAT_1|FORMAT_1.*TAX_INVOICE/i,
    renderer_key: "commercial.invoice_tax_india_1",
  },
  {
    pattern: /^(HBL_DRAFT_|FG_HBL_DRAFT)/i,
    renderer_key: "sea.hbl_draft",
  },
  {
    pattern: /^(HBL_ORIGINAL_|FG_HBL_ORIGINAL|HBL_FINAL)/i,
    renderer_key: "sea.hbl_original",
  },
  {
    pattern: /^(ARRIVAL_NOTICE_|FG_ARRIVAL_)/i,
    renderer_key: "sea.arrival_notice",
  },
  {
    pattern: /^(DELIVERY_|FG_DELIVERY_|PROOF_OF_)/i,
    renderer_key: "sea.delivery_order",
  },
  {
    pattern: /^HAWB_/i,
    renderer_key: "air.hawb_draft",
  },
  {
    pattern: /^MAWB_/i,
    renderer_key: "air.mawb",
  },
  {
    pattern: /^(DSR_|OPS_LIST_|JOB_LIST_|OPS_\d+)/i,
    renderer_key: "ops.list_generic",
  },
  {
    pattern: /^(JOURNAL_|PAYMENT_|RECEIPT_|.*_AGING_)/i,
    renderer_key: "finance.aging",
  },
  {
    pattern: /^ADVANCE_SHIPPING_NOTE|^ASN_/i,
    renderer_key: "wms.asn",
  },
  {
    pattern: /^COM_\d+$/i,
    renderer_key: "commercial.invoice_tax_india_1",
  },
  {
    pattern: /^FIN_\d+$/i,
    renderer_key: "finance.aging",
  },
  {
    pattern: /^WMS_\d+$/i,
    renderer_key: "wms.asn",
  },
  {
    pattern: /^AIR_\d+$/i,
    renderer_key: "air.hawb_draft",
  },
  {
    pattern: /^QUO_\d+$/i,
    renderer_key: "quotation.standard",
  },
  {
    pattern: /^SEA_\d+$/i,
    renderer_key: "sea.arrival_notice",
  },
];

/**
 * Resolve a preferred renderer_key for a template code, or null if no rule.
 * Caller must still check the pack is implemented before binding.
 */
export function resolveRendererKeyForCode(code: string): string | null {
  const trimmed = String(code ?? "").trim();
  if (!trimmed) return null;
  if (EXACT[trimmed]) return EXACT[trimmed];
  for (const rule of RULES) {
    if (rule.pattern.test(trimmed)) return rule.renderer_key;
  }
  return null;
}
