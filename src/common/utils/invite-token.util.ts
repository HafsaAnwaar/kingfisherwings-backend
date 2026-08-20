import { createHash, randomBytes } from 'crypto';

export function generateInviteToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString('hex');
  return { token, hash: hashInviteToken(token) };
}

export function hashInviteToken(token: string): string {
  return createHash('sha256').update(token.trim()).digest('hex');
}
