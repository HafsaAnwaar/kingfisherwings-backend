import { PasswordHistory } from '@prisma/client';
export declare class PasswordHelper {
    static assertStrength(password: string): void;
    static assertNotReused(candidatePassword: string, history: PasswordHistory[]): Promise<void>;
    static calculateExpiryDate(fromDate?: Date): Date | null;
    static isExpired(passwordExpiresAt: Date | null): boolean;
    static generateResetToken(): string;
    static resetTokenExpiry(): Date;
    static inviteTokenExpiry(): Date;
    static generateBackupCodes(count?: number): string[];
}
