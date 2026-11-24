/** Hybrid Option C HTML pilot catalog codes (payload preview whitelist). */
export const HTML_PILOT_REPORT_CODES = [
  "HBL_DRAFT_REPORT_FORMAT_JASPER",
  "INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA",
  "JOB_LIST_SUMMARY_REPORT_FORMAT",
] as const;

export type HtmlPilotReportCode = (typeof HTML_PILOT_REPORT_CODES)[number];

export function isHtmlPilotReportCode(code: string): code is HtmlPilotReportCode {
  return (HTML_PILOT_REPORT_CODES as readonly string[]).includes(code);
}
