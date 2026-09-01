/**
 * Auto-seeded onto every SEA_FCL_EXPORT job at creation, in this order.
 * Matches spec Ch.10.3 — 16 checkpoints from booking through close-out.
 */
export const SEA_FCL_EXPORT_MILESTONES: string[] = [
  "BOOKING_CREATED",
  "SI_SUBMITTED",
  "VGM_SUBMITTED",
  "CONTAINER_GATED_IN",
  "STUFFING_COMPLETED",
  "VESSEL_LOADED",
  "VESSEL_SAILED",
  "DRAFT_BL_RECEIVED",
  "DRAFT_BL_APPROVED_BY_SHIPPER",
  "ORIGINAL_BL_ISSUED_OR_SURRENDERED",
  "PRE_ALERT_SENT",
  "CARGO_IN_TRANSIT",
  "CARGO_ARRIVED_POD",
  "INVOICE_RAISED",
  "PAYMENT_RECEIVED",
  "JOB_CLOSED",
];
