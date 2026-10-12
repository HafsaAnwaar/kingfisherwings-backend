import { JobStatusCategory } from "@prisma/client";

export type JobStatusCatalogSeed = {
  code: string;
  label: string;
  category: JobStatusCategory;
  is_terminal: boolean;
  sort_order: number;
};

/** Default Fresa-aligned labels for each JobStatus value. */
export const DEFAULT_JOB_STATUS_CATALOG: JobStatusCatalogSeed[] = [
  { code: "ENQUIRY", label: "Enquiry", category: "LIFECYCLE", is_terminal: false, sort_order: 10 },
  { code: "QUOTATION", label: "Quotation", category: "LIFECYCLE", is_terminal: false, sort_order: 20 },
  {
    code: "BOOKING_CONFIRMED",
    label: "Approved",
    category: "LIFECYCLE",
    is_terminal: false,
    sort_order: 30,
  },
  { code: "APPROVED", label: "Approved", category: "LIFECYCLE", is_terminal: false, sort_order: 35 },
  { code: "OPEN", label: "Open", category: "LIFECYCLE", is_terminal: false, sort_order: 40 },
  {
    code: "IN_PROGRESS",
    label: "In Progress",
    category: "OPERATIONAL",
    is_terminal: false,
    sort_order: 50,
  },
  {
    code: "DOCS_PENDING",
    label: "Docs Pending",
    category: "OPERATIONAL",
    is_terminal: false,
    sort_order: 60,
  },
  {
    code: "CUSTOMS_CLEARANCE",
    label: "Customs Clearance",
    category: "OPERATIONAL",
    is_terminal: false,
    sort_order: 70,
  },
  { code: "ON_HOLD", label: "On Hold", category: "OPERATIONAL", is_terminal: false, sort_order: 80 },
  { code: "DELIVERED", label: "Delivered", category: "OPERATIONAL", is_terminal: false, sort_order: 90 },
  { code: "COMPLETED", label: "Closed", category: "LIFECYCLE", is_terminal: true, sort_order: 100 },
  { code: "CANCELLED", label: "Cancelled", category: "LIFECYCLE", is_terminal: true, sort_order: 110 },
];

export const DEFAULT_REOPEN_STATUS = "IN_PROGRESS";
