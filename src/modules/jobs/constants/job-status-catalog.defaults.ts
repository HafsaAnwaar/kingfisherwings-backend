import { JobStatusCategory } from "@prisma/client";

export type JobStatusCatalogSeed = {
  code: string;
  label: string;
  category: JobStatusCategory;
  is_terminal: boolean;
  sort_order: number;
  maps_to_system_status: string;
  is_system: boolean;
  is_custom: boolean;
};

/** Default Fresa-aligned labels for each JobStatus value. */
export const DEFAULT_JOB_STATUS_CATALOG: JobStatusCatalogSeed[] = [
  { code: "ENQUIRY", label: "Enquiry", category: "LIFECYCLE", is_terminal: false, sort_order: 10, maps_to_system_status: "ENQUIRY", is_system: true, is_custom: false },
  { code: "QUOTATION", label: "Quotation", category: "LIFECYCLE", is_terminal: false, sort_order: 20, maps_to_system_status: "QUOTATION", is_system: true, is_custom: false },
  {
    code: "BOOKING_CONFIRMED",
    label: "Approved",
    category: "LIFECYCLE",
    is_terminal: false,
    sort_order: 30,
    maps_to_system_status: "BOOKING_CONFIRMED",
    is_system: true,
    is_custom: false,
  },
  { code: "APPROVED", label: "Approved", category: "LIFECYCLE", is_terminal: false, sort_order: 35, maps_to_system_status: "APPROVED", is_system: true, is_custom: false },
  { code: "OPEN", label: "Open", category: "LIFECYCLE", is_terminal: false, sort_order: 40, maps_to_system_status: "OPEN", is_system: true, is_custom: false },
  {
    code: "IN_PROGRESS",
    label: "In Progress",
    category: "OPERATIONAL",
    is_terminal: false,
    sort_order: 50,
    maps_to_system_status: "IN_PROGRESS",
    is_system: true,
    is_custom: false,
  },
  {
    code: "DOCS_PENDING",
    label: "Docs Pending",
    category: "OPERATIONAL",
    is_terminal: false,
    sort_order: 60,
    maps_to_system_status: "DOCS_PENDING",
    is_system: true,
    is_custom: false,
  },
  {
    code: "CUSTOMS_CLEARANCE",
    label: "Customs Clearance",
    category: "OPERATIONAL",
    is_terminal: false,
    sort_order: 70,
    maps_to_system_status: "CUSTOMS_CLEARANCE",
    is_system: true,
    is_custom: false,
  },
  { code: "ON_HOLD", label: "On Hold", category: "OPERATIONAL", is_terminal: false, sort_order: 80, maps_to_system_status: "ON_HOLD", is_system: true, is_custom: false },
  { code: "DELIVERED", label: "Delivered", category: "OPERATIONAL", is_terminal: false, sort_order: 90, maps_to_system_status: "DELIVERED", is_system: true, is_custom: false },
  { code: "COMPLETED", label: "Closed", category: "LIFECYCLE", is_terminal: true, sort_order: 100, maps_to_system_status: "COMPLETED", is_system: true, is_custom: false },
  { code: "CANCELLED", label: "Cancelled", category: "LIFECYCLE", is_terminal: true, sort_order: 110, maps_to_system_status: "CANCELLED", is_system: true, is_custom: false },
];

export const DEFAULT_REOPEN_STATUS = "IN_PROGRESS";

export const SYSTEM_JOB_STATUSES = DEFAULT_JOB_STATUS_CATALOG.map((r) => r.code);

export const DEFAULT_SHIPMENT_STATUS_CATALOG = [
  { code: "BOOKED", label: "Booked", is_terminal: false, sort_order: 10, maps_to_system_status: "BOOKED", is_system: true, is_custom: false },
  { code: "CONFIRMED", label: "Confirmed", is_terminal: false, sort_order: 20, maps_to_system_status: "CONFIRMED", is_system: true, is_custom: false },
  { code: "APPROVED", label: "Approved", is_terminal: false, sort_order: 30, maps_to_system_status: "APPROVED", is_system: true, is_custom: false },
  { code: "IN_PROGRESS", label: "In Progress", is_terminal: false, sort_order: 40, maps_to_system_status: "IN_PROGRESS", is_system: true, is_custom: false },
  { code: "ON_HOLD", label: "On Hold", is_terminal: false, sort_order: 50, maps_to_system_status: "ON_HOLD", is_system: true, is_custom: false },
  { code: "COMPLETED", label: "Completed", is_terminal: true, sort_order: 60, maps_to_system_status: "COMPLETED", is_system: true, is_custom: false },
  { code: "CANCELLED", label: "Cancelled", is_terminal: true, sort_order: 70, maps_to_system_status: "CANCELLED", is_system: true, is_custom: false },
] as const;

export const SYSTEM_SHIPMENT_STATUSES = DEFAULT_SHIPMENT_STATUS_CATALOG.map(
  (r) => r.code,
);

export const DEFAULT_QUOTATION_STATUS_CATALOG = [
  { code: "DRAFT", label: "Draft", is_terminal: false, sort_order: 10, maps_to_system_status: "DRAFT", is_system: true, is_custom: false },
  { code: "SUBMITTED", label: "Submitted", is_terminal: false, sort_order: 20, maps_to_system_status: "SUBMITTED", is_system: true, is_custom: false },
  { code: "INTERNALLY_APPROVED", label: "Internally Approved", is_terminal: false, sort_order: 30, maps_to_system_status: "INTERNALLY_APPROVED", is_system: true, is_custom: false },
  { code: "REJECTED", label: "Rejected", is_terminal: true, sort_order: 40, maps_to_system_status: "REJECTED", is_system: true, is_custom: false },
  { code: "SENT", label: "Sent", is_terminal: false, sort_order: 50, maps_to_system_status: "SENT", is_system: true, is_custom: false },
  { code: "NEGOTIATING", label: "Negotiating", is_terminal: false, sort_order: 60, maps_to_system_status: "NEGOTIATING", is_system: true, is_custom: false },
  { code: "CUSTOMER_REVIEW", label: "Customer Review", is_terminal: false, sort_order: 70, maps_to_system_status: "CUSTOMER_REVIEW", is_system: true, is_custom: false },
  { code: "VERIFIED", label: "Verified", is_terminal: false, sort_order: 80, maps_to_system_status: "VERIFIED", is_system: true, is_custom: false },
  { code: "APPROVED", label: "Approved", is_terminal: false, sort_order: 90, maps_to_system_status: "APPROVED", is_system: true, is_custom: false },
  { code: "DISAPPROVED", label: "Disapproved", is_terminal: true, sort_order: 100, maps_to_system_status: "DISAPPROVED", is_system: true, is_custom: false },
  { code: "EXPIRED", label: "Expired", is_terminal: true, sort_order: 110, maps_to_system_status: "EXPIRED", is_system: true, is_custom: false },
  { code: "CONVERTED", label: "Converted", is_terminal: true, sort_order: 120, maps_to_system_status: "CONVERTED", is_system: true, is_custom: false },
] as const;

export const SYSTEM_QUOTATION_STATUSES = DEFAULT_QUOTATION_STATUS_CATALOG.map(
  (r) => r.code,
);
