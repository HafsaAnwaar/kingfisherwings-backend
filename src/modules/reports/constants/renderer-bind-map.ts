/**
 * Maps FRESA template codes → implemented Puppeteer pack keys.
 * Only applied when the target pack exists in IMPLEMENTED_RENDERER_KEYS.
 */

const EXACT: Record<string, string> = {
  INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA: "commercial.invoice_tax_india_1",
  INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA: "commercial.invoice_tax_india_2",
  INVOICE_REPORT_FORMAT_SUMMARY_INDIA: "commercial.invoice_summary_india",
  INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE: "commercial.invoice_summary_india",
  INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE: "commercial.invoice_standard",
  INVOICE_REPORT_FORMAT_5_TAX_INVOICE_INDIA: "commercial.invoice_tax_india_1",
  INVOICE_REPORT_FORMAT_6_SIMPLE_INVOICE_INDIA: "commercial.invoice_simple_india",
  INVOICE_REPORT_FORMAT_7_SIMPLE_INVOICE: "commercial.invoice_simple_india",
  INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC: "commercial.invoice_arabic",
  INVOICE_REPORT_FORMAT_9_STANDARD_INVOICE_USA: "commercial.invoice_usa",
  INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE: "commercial.invoice_standard",
  INVOICE_REPORT_FORMAT_21_WAREHOUSE_INVOICE: "commercial.invoice_warehouse",
  JOBS_LIST: "ops.jobs_list",
  OPS_LIST_GENERIC: "ops.list_generic",
  SEA_HBL_DRAFT: "sea.hbl_draft",
  SEA_HBL_ORIGINAL: "sea.hbl_original",
  SEA_ARRIVAL_NOTICE: "sea.arrival_notice",
  SEA_DELIVERY_ORDER: "sea.delivery_order",
  SEA_CARGO_MANIFEST: "sea.cargo_manifest",
  SEA_STUFFING_REPORT: "sea.stuffing_report",
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
  FINANCE_JOURNAL_VOUCHER: "finance.journal_voucher",
  FINANCE_PAYMENT_VOUCHER: "finance.payment_voucher",
  FINANCE_RECEIPT_VOUCHER: "finance.receipt_voucher",
  FINANCE_OUTSTANDING_LETTER: "finance.outstanding_letter",
  WMS_ASN: "wms.asn",
  WMS_GRN: "wms.grn",
  WMS_GDO: "wms.gdo",
  WMS_WAREHOUSE_NOTE: "wms.warehouse_note",
  OTHER_BOOKING_CONFIRMATION: "other.booking_confirmation",
  OTHER_PRE_ALERT: "other.pre_alert",
};

type Rule = { pattern: RegExp; renderer_key: string };

/** First matching rule wins — order matters (specific before broad). */
const RULES: Rule[] = [
  // Commercial — Format-N first
  {
    pattern: /^INVOICE_REPORT_FORMAT_1(_|$)|TAX_INVOICE_INDIA.*FORMAT_1|FORMAT_1.*TAX_INVOICE/i,
    renderer_key: "commercial.invoice_tax_india_1",
  },
  {
    pattern: /^INVOICE_REPORT_FORMAT_2(_|$)/i,
    renderer_key: "commercial.invoice_tax_india_2",
  },
  {
    pattern: /^INVOICE_REPORT_FORMAT_(3|SUMMARY)|SUMMARY_INVOICE/i,
    renderer_key: "commercial.invoice_summary_india",
  },
  {
    pattern: /^INVOICE_REPORT_FORMAT_6|SIMPLE_INVOICE/i,
    renderer_key: "commercial.invoice_simple_india",
  },
  {
    pattern: /^(INVOICE_.*ARABIC|STANDARD_INVOICE_ARABIC|SAUDI_TAX)/i,
    renderer_key: "commercial.invoice_arabic",
  },
  {
    pattern: /^(INVOICE_.*USA|STANDARD_INVOICE_USA)/i,
    renderer_key: "commercial.invoice_usa",
  },
  {
    pattern: /WAREHOUSE_INVOICE/i,
    renderer_key: "commercial.invoice_warehouse",
  },
  {
    pattern: /^INVOICE_REPORT_FORMAT_|PROFORMA_INVOICE|PURCHASE_INVOICE_REPORT|^TAX_INVOICE|^STANDARD_INVOICE|^SIMPLE_INVOICE/i,
    renderer_key: "commercial.invoice_standard",
  },

  // Sea HBL
  {
    pattern: /^(HBL_DRAFT_|FG_HBL_DRAFT|HBL_DRAFT)/i,
    renderer_key: "sea.hbl_draft",
  },
  {
    pattern: /^(HBL_ORIGINAL_|FG_HBL_ORIGINAL|HBL_FINAL|HBL_ORIGINAL)/i,
    renderer_key: "sea.hbl_original",
  },

  // Arrival notice — air vs sea by prefix/token
  {
    pattern: /^(AIR_ARRIVAL_|ARRIVAL_NOTICE_AIR|CARGO_ARRIVAL_NOTICE_AIR|FG_ARRIVAL_AIR)/i,
    renderer_key: "air.arrival_notice",
  },
  {
    pattern: /^(ARRIVAL_NOTICE_|FG_ARRIVAL_|CARGO_ARRIVAL_NOTICE|SEA_ARRIVAL)/i,
    renderer_key: "sea.arrival_notice",
  },

  // Delivery / POD — air vs sea
  {
    pattern: /^(AIR_DELIVERY_|DELIVERY_ORDER_AIR|FG_DELIVERY_AIR)/i,
    renderer_key: "air.delivery_order",
  },
  {
    pattern: /^(DELIVERY_|FG_DELIVERY_|PROOF_OF_|DO_ISSUED|E_DELIVERY)/i,
    renderer_key: "sea.delivery_order",
  },

  // Sea document shells
  {
    pattern: /CARGO_MANIFEST|FREIGHT_MANIFEST|IMPORT_CARGO_MANIFEST/i,
    renderer_key: "sea.cargo_manifest",
  },
  {
    pattern: /STUFFING_REPORT/i,
    renderer_key: "sea.stuffing_report",
  },
  {
    pattern: /\b(FCR|VGM|ISF|AMS|LETTER_OF_GUARANTEE|SURRENDERED_LETTER|IGM_FILLING)\b/i,
    renderer_key: "sea.letter_shell",
  },

  // Air HAWB / MAWB
  {
    pattern: /^HAWB_ORIGINAL|^HAWB_FINAL/i,
    renderer_key: "air.hawb_final",
  },
  {
    pattern: /^HAWB_/i,
    renderer_key: "air.hawb_draft",
  },
  {
    pattern: /^MAWB_/i,
    renderer_key: "air.mawb",
  },

  // Ops lists / DSR / status
  {
    pattern:
      /^(DSR_|DAILY_STATUS_|OPS_LIST_|JOB_LIST_|JOB_STATUS_|PENDING_|SHIPMENTS_WITH_|CLOSED_JOB|CANCELLED_JOB|CREATED_|ACTIVITY_COMPLETED|SALESPERSON_NOMINATION|OPS_\d+)/i,
    renderer_key: "ops.list_generic",
  },
  {
    pattern: /_LIST_REPORT|_LIST$|LIST_REPORT_FORMAT/i,
    renderer_key: "ops.list_generic",
  },

  // Finance vouchers — distinct packs (not aging)
  {
    pattern: /^JOURNAL_VOUCHER|^JOURNAL_/i,
    renderer_key: "finance.journal_voucher",
  },
  {
    pattern: /^PAYMENT_VOUCHER|^PAYMENT_REQUEST/i,
    renderer_key: "finance.payment_voucher",
  },
  {
    pattern: /^RECEIPT_VOUCHER|^RECEIPT_/i,
    renderer_key: "finance.receipt_voucher",
  },
  {
    pattern: /OUTSTANDING_LETTER/i,
    renderer_key: "finance.outstanding_letter",
  },
  {
    pattern: /TRIAL_BALANCE/i,
    renderer_key: "finance.trial_balance",
  },
  {
    pattern: /STATEMENT_OF_ACCOUNT|^SOA_|AR_OUTSTANDING|AP_OUTSTANDING/i,
    renderer_key: "finance.soa",
  },
  {
    pattern: /AGING|AP_AGING|AR_AGING/i,
    renderer_key: "finance.aging",
  },
  {
    pattern: /^GL_|PROFIT_AND_LOSS|BANK_CASH_BOOK/i,
    renderer_key: "finance.voucher",
  },

  // WMS
  {
    pattern: /^ADVANCE_SHIPPING_NOTE|^ASN_/i,
    renderer_key: "wms.asn",
  },
  {
    pattern: /^WMS_GRN_|GRN_/i,
    renderer_key: "wms.grn",
  },
  {
    pattern: /^WMS_GDO_|GDO_/i,
    renderer_key: "wms.gdo",
  },

  // Booking / pre-alert
  {
    pattern: /^BOOKING_CONFIRMATION_/i,
    renderer_key: "other.booking_confirmation",
  },
  {
    pattern: /^PRE_ALERT_|^PREALERT_/i,
    renderer_key: "other.pre_alert",
  },

  // Quotation
  {
    pattern: /^QUOTATION_REPORT_FORMAT_|^QUO_|FCL_QUOTATION|AIR_QUOTATION/i,
    renderer_key: "quotation.standard",
  },

  // Legacy numbered stubs — tighter than before
  {
    pattern: /^COM_\d+$/i,
    renderer_key: "commercial.invoice_tax_india_1",
  },
  {
    pattern: /^FIN_\d+$/i,
    renderer_key: "finance.outstanding_letter",
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
    renderer_key: "sea.hbl_draft",
  },
  {
    pattern: /^OPS_\d+$/i,
    renderer_key: "ops.list_generic",
  },
  {
    pattern: /^OTH_\d+$/i,
    renderer_key: "other.pre_alert",
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
