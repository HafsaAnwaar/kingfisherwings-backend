/**
 * Display-ready job list summary row (finance.job_list_summary /
 * JOB_LIST_SUMMARY_REPORT_FORMAT).
 */

export type JobListSummaryRow = {
  /** Alias of job_number for FE list columns. */
  job: string;
  job_number: string;
  job_type: string;
  status: string;
  /** Bill-to / consignee / shipper name when present. */
  customer: string | null;
  pol: string | null;
  pod: string | null;
  etd: string | null;
  job_date: Date | string | null;
  chargeable_units: number;
  revenue_total: number;
  cost_total: number;
  gp_amount: number;
};
