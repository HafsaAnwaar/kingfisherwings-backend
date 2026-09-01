/**
 * Auto-seeded onto every LAND job at creation, in this order.
 * Matches spec Ch.14 — land / trucking lifecycle.
 */
export const LAND_MILESTONES: string[] = [
  "BOOKING_CREATED",
  "PICKUP_SCHEDULED",
  "CARGO_PICKED_UP",
  "IN_TRANSIT",
  "AT_BORDER",
  "CUSTOMS_CLEARED_BORDER",
  "DELIVERED",
  "POD_RECEIVED",
  "INVOICE_RAISED",
  "PAYMENT_RECEIVED",
  "JOB_CLOSED",
];

export const LAND_CREATE_MILESTONE = "BOOKING_CREATED";
