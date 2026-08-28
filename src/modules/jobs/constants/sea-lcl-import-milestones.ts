/**
 * Auto-seeded onto every SEA_LCL_IMPORT job at creation, in this order.
 * Matches spec Ch.13 — LCL import CFS / customs / delivery lifecycle.
 */
export const SEA_LCL_IMPORT_MILESTONES: string[] = [
  'BOOKING_CREATED',
  'MBL_RECEIVED',
  'CARGO_ARRIVED_AT_POD',
  'CAN_SENT',
  'CUSTOMS_CLEARED',
  'DO_ISSUED',
  'CFS_DEVANNING_COMPLETED',
  'CARGO_DELIVERED',
  'INVOICE_RAISED',
  'PAYMENT_RECEIVED',
  'JOB_CLOSED',
];

export const SEA_LCL_IMPORT_CREATE_MILESTONE = 'BOOKING_CREATED';
export const SEA_LCL_IMPORT_MBL_RECEIVED_MILESTONE = 'MBL_RECEIVED';
