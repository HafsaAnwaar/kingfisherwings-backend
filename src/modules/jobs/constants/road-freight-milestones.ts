/**
 * Auto-seeded onto every ROAD_FREIGHT job at creation, in this order.
 * Matches LAND / trucking lifecycle (Excel ROAD_FREIGHT).
 */
export const ROAD_FREIGHT_MILESTONES: string[] = [
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

export const ROAD_FREIGHT_CREATE_MILESTONE = "BOOKING_CREATED";
