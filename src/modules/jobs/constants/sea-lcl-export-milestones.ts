/**
 * Auto-seeded onto every SEA_LCL_EXPORT job at creation, in this order.
 * Matches spec Ch.12 — LCL export consolidation lifecycle.
 */
export const SEA_LCL_EXPORT_MILESTONES: string[] = [
  "BOOKING_CREATED",
  "CARGO_RECEIVED_AT_CFS",
  "CONSOLIDATION_STARTED",
  "SI_SUBMITTED",
  "CFS_STUFFING_COMPLETED",
  "MBL_RECEIVED",
  "VESSEL_SAILED",
  "HBL_ISSUED",
  "PRE_ALERT_SENT",
  "CARGO_IN_TRANSIT",
  "CARGO_ARRIVED_POD",
  "INVOICE_RAISED",
  "PAYMENT_RECEIVED",
  "JOB_CLOSED",
];

export const SEA_LCL_EXPORT_CREATE_MILESTONE = "BOOKING_CREATED";
