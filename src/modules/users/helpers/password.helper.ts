import { BadRequestException } from '@nestjs/common';
import { PasswordHistory } from '@prisma/client';
import { PasswordUtil } from '../../../common/utils/password.util';
import { PASSWORD_CONSTANTS } from '../constants/password.constants';

export class PasswordHelper {
  /**
   * Throws if the password does not meet the platform policy. DTO-level
   * @IsStrongPassword() already blocks malformed requests; this is the
   * defense-in-depth check at the service boundary (e.g. for
   * admin-generated or programmatically composed passwords).
   */
  static assertStrength(password: string): void {
    if (
      password.length < PASSWORD_CONSTANTS.MIN_LENGTH ||
      password.length > PASSWORD_CONSTANTS.MAX_LENGTH ||
      !PASSWORD_CONSTANTS.STRENGTH_REGEX.test(password)
    ) {
      throw new BadRequestException(
        `Password must be ${PASSWORD_CONSTANTS.MIN_LENGTH}-${PASSWORD_CONSTANTS.MAX_LENGTH} characters and include uppercase, lowercase, a number, and a special character.`,
      );
    }
  }

  /**
   * Checks the candidate password against recent password history hashes.
   * Throws if it matches any of them.
   */
  static async assertNotReused(
    candidatePassword: string,
    history: PasswordHistory[],
  ): Promise<void> {
    for (const entry of history) {
      const matches = await PasswordUtil.verify(entry.password_hash, candidatePassword);
      if (matches) {
        throw new BadRequestException(
          `Password must not match any of your last ${PASSWORD_CONSTANTS.HISTORY_LIMIT} passwords.`,
        );
      }
    }
  }

  static calculateExpiryDate(fromDate: Date = new Date()): Date | null {
    if (PASSWORD_CONSTANTS.EXPIRY_DAYS <= 0) {
      return null;
    }
    const expires = new Date(fromDate);
    expires.setDate(expires.getDate() + PASSWORD_CONSTANTS.EXPIRY_DAYS);
    return expires;
  }

  static isExpired(passwordExpiresAt: Date | null): boolean {
    if (!passwordExpiresAt) {
      return false;
    }
    return passwordExpiresAt.getTime() < Date.now();
  }

  static generateResetToken(): string {
    return PasswordUtil.generateTemporaryPassword(PASSWORD_CONSTANTS.RESET_TOKEN_BYTES);
  }

  static resetTokenExpiry(): Date {
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + PASSWORD_CONSTANTS.RESET_TOKEN_TTL_MINUTES);
    return expires;
  }

  static inviteTokenExpiry(): Date {
    const expires = new Date();
    expires.setHours(expires.getHours() + PASSWORD_CONSTANTS.INVITE_TOKEN_TTL_HOURS);
    return expires;
  }

  static generateBackupCodes(
    count: number = PASSWORD_CONSTANTS.TWO_FACTOR_BACKUP_CODE_COUNT,
  ): string[] {
    return Array.from({ length: count }, () =>
      PasswordUtil.generateTemporaryPassword(PASSWORD_CONSTANTS.TWO_FACTOR_BACKUP_CODE_LENGTH),
    );
  }
}
