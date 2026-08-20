/**
 * Auto-seeded onto every AIR_IMPORT job at creation (Ch.9.3 — 16 checkpoints).
 */
export const AIR_IMPORT_MILESTONES: string[] = [
  'BOOKING_CREATED',
  'MAWB_RECEIVED',
  'CARGO_MANIFESTED',
  'CARGO_ARRIVED_AT_DESTINATION_AIRPORT',
  'CARGO_RELEASED_BY_AIRLINE',
  'CUSTOMS_ENTRY_FILED',
  'CUSTOMS_CLEARED',
  'CARGO_RELEASED_FROM_CUSTOMS',
  'CAN_SENT',
  'DO_ISSUED',
  'CARGO_OUT_FOR_DELIVERY',
  'DELIVERED_TO_CONSIGNEE',
  'POD_RECEIVED',
  'INVOICE_RAISED',
  'PAYMENT_RECEIVED',
  'JOB_CLOSED',
];

/** Milestone auto-completed when the job is first created. */
export const AIR_IMPORT_CREATE_MILESTONE = 'BOOKING_CREATED';

/** Milestone auto-completed when mawb_number_from_origin is first set. */
export const AIR_IMPORT_MAWB_RECEIVED_MILESTONE = 'MAWB_RECEIVED';
