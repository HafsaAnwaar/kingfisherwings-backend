/**
 * Auto-seeded onto every COURIER job at creation, in this order.
 * Matches spec Ch.15 — courier delivery checkpoints.
 */
export const COURIER_MILESTONES: string[] = [
  'BOOKING_CREATED',
  'PICKED_UP',
  'IN_TRANSIT',
  'AT_DESTINATION_FACILITY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'POD_RECEIVED',
];

export const COURIER_CREATE_MILESTONE = 'BOOKING_CREATED';

export const COURIER_SCAN_CHECKPOINTS: string[] = [
  'PICKED_UP',
  'IN_TRANSIT',
  'AT_DESTINATION_FACILITY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];
