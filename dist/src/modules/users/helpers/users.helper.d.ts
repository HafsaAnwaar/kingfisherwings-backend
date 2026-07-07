import { User } from '@prisma/client';
export declare class UsersHelper {
    static normalizeEmail(email: string): string;
    static buildFullName(firstName: string, lastName: string): string;
    static maskEmail(email: string): string;
    static isWithinOfficeHours(user: User, at?: Date): boolean;
    static isIpAllowed(user: User, ip?: string): boolean;
    static isMacAllowed(user: User, mac?: string): boolean;
    static isAccountLocked(user: User, at?: Date): boolean;
}
