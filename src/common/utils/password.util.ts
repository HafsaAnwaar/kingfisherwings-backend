import * as argon2 from "argon2";
import { randomInt } from "crypto";

export class PasswordUtil {
  static async hash(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 1,
    });
  }

  static async verify(hash: string, password: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }

  static generateTemporaryPassword(length = 14): string {
    const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lower = "abcdefghijkmnopqrstuvwxyz";
    const numbers = "23456789";
    const special = "!@#$%^&*";

    const all = upper + lower + numbers + special;
    const pick = (charset: string) => charset[randomInt(charset.length)];

    const chars = [pick(upper), pick(lower), pick(numbers), pick(special)];
    while (chars.length < length) {
      chars.push(pick(all));
    }

    // Fisher-Yates shuffle using a CSPRNG (Math.random() is not
    // cryptographically secure and this value backs 2FA backup codes
    // and password-reset tokens).
    for (let i = chars.length - 1; i > 0; i--) {
      const j = randomInt(i + 1);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }

    return chars.join("");
  }
}
