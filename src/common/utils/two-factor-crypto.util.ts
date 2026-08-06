import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const SALT = 'freightsaas-two-factor-secret-v1';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypts/decrypts 2FA TOTP secrets at rest (AES-256-GCM). The key is
 * derived via scrypt from TWO_FACTOR_ENCRYPTION_KEY so any operator-chosen
 * string works, not just a pre-formatted 32-byte value.
 */
export class TwoFactorCrypto {
  private static deriveKey(secret: string): Buffer {
    return scryptSync(secret, SALT, 32);
  }

  static encrypt(plainText: string, secret: string): string {
    const key = this.deriveKey(secret);
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, authTag, encrypted]).toString('base64');
  }

  static decrypt(payload: string, secret: string): string {
    const key = this.deriveKey(secret);
    const raw = Buffer.from(payload, 'base64');
    const iv = raw.subarray(0, IV_LENGTH);
    const authTag = raw.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = raw.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
  }
}
