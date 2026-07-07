"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordUtil = void 0;
const argon2 = require("argon2");
class PasswordUtil {
    static async hash(password) {
        return argon2.hash(password, {
            type: argon2.argon2id,
            memoryCost: 65536,
            timeCost: 3,
            parallelism: 1,
        });
    }
    static async verify(hash, password) {
        return argon2.verify(hash, password);
    }
    static generateTemporaryPassword(length = 14) {
        const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
        const lower = 'abcdefghijkmnopqrstuvwxyz';
        const numbers = '23456789';
        const special = '!@#$%^&*';
        const all = upper + lower + numbers + special;
        let password = '';
        password += upper[Math.floor(Math.random() * upper.length)];
        password += lower[Math.floor(Math.random() * lower.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += special[Math.floor(Math.random() * special.length)];
        while (password.length < length) {
            password += all[Math.floor(Math.random() * all.length)];
        }
        return password
            .split('')
            .sort(() => Math.random() - 0.5)
            .join('');
    }
}
exports.PasswordUtil = PasswordUtil;
//# sourceMappingURL=password.util.js.map