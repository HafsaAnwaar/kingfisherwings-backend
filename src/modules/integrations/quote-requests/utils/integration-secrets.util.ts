import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const ALGO = "aes-256-gcm";

function deriveKey(): Buffer {
  const raw =
    process.env.INTEGRATION_SECRETS_KEY?.trim() ||
    process.env.JWT_ACCESS_SECRET?.trim() ||
    "dev-only-integration-secrets-key";
  return createHash("sha256").update(raw).digest();
}

/** Encrypt a secret for storage. Returns `iv:tag:ciphertext` (hex). */
export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, deriveKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${enc.toString("hex")}`;
}

export function decryptSecret(payload: string): string {
  const [ivHex, tagHex, dataHex] = payload.split(":");
  if (!ivHex || !tagHex || !dataHex) {
    throw new Error("Invalid secret ciphertext format.");
  }
  const decipher = createDecipheriv(ALGO, deriveKey(), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  const dec = Buffer.concat([
    decipher.update(Buffer.from(dataHex, "hex")),
    decipher.final(),
  ]);
  return dec.toString("utf8");
}

export function secretPrefix(plain: string, len = 8): string {
  const cleaned = plain.trim();
  if (cleaned.length <= len) return cleaned.slice(0, Math.max(2, cleaned.length));
  return cleaned.slice(0, len);
}
