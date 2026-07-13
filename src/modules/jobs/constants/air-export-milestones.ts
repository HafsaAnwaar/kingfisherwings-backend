/**
 * Auto-seeded onto every AIR_EXPORT job at creation, in this order.
 * Matches spec Ch.8.5 exactly — 15 checkpoints from booking through
 * close-out. Sea FCL Export uses SEA_FCL_EXPORT_MILESTONES (Ch.10.3).
 */
export const AIR_EXPORT_MILESTONES: string[] = [
  'BOOKING_RECEIVED',
  'BOOKING_CONFIRMED',
  'SPACE_CONFIRMED',
  'CARGO_RECEIVED_AT_WAREHOUSE',
  'CARGO_ACCEPTED_BY_AIRLINE',
  'DOCS_SUBMITTED_TO_AIRLINE',
  'FLIGHT_UPLIFT_CONFIRMED',
  'MAWB_ISSUED',
  'CARGO_DEPARTED',
  'CARGO_IN_TRANSIT',
  'CARGO_ARRIVED_DESTINATION',
  'PRE_ALERT_SENT',
  'INVOICE_RAISED',
  'PAYMENT_RECEIVED',
  'JOB_CLOSED',
];
