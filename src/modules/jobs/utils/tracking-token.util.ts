import { randomUUID } from 'crypto';

/** Matches DB default: replace(gen_random_uuid()::text, '-', '') */
export function mintTrackingToken(): string {
  return randomUUID().replace(/-/g, '');
}
