export declare class PasswordUtil {
    static hash(password: string): Promise<string>;
    static verify(hash: string, password: string): Promise<boolean>;
    static generateTemporaryPassword(length?: number): string;
}
