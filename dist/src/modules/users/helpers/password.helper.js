"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordHelper = void 0;
const common_1 = require("@nestjs/common");
const password_util_1 = require("../../../common/utils/password.util");
const password_constants_1 = require("../constants/password.constants");
class PasswordHelper {
    static assertStrength(password) {
        if (password.length < password_constants_1.PASSWORD_CONSTANTS.MIN_LENGTH ||
            password.length > password_constants_1.PASSWORD_CONSTANTS.MAX_LENGTH ||
            !password_constants_1.PASSWORD_CONSTANTS.STRENGTH_REGEX.test(password)) {
            throw new common_1.BadRequestException(`Password must be ${password_constants_1.PASSWORD_CONSTANTS.MIN_LENGTH}-${password_constants_1.PASSWORD_CONSTANTS.MAX_LENGTH} characters and include uppercase, lowercase, a number, and a special character.`);
        }
    }
    static async assertNotReused(candidatePassword, history) {
        for (const entry of history) {
            const matches = await password_util_1.PasswordUtil.verify(entry.password_hash, candidatePassword);
            if (matches) {
                throw new common_1.BadRequestException(`Password must not match any of your last ${password_constants_1.PASSWORD_CONSTANTS.HISTORY_LIMIT} passwords.`);
            }
        }
    }
    static calculateExpiryDate(fromDate = new Date()) {
        if (password_constants_1.PASSWORD_CONSTANTS.EXPIRY_DAYS <= 0) {
            return null;
        }
        const expires = new Date(fromDate);
        expires.setDate(expires.getDate() + password_constants_1.PASSWORD_CONSTANTS.EXPIRY_DAYS);
        return expires;
    }
    static isExpired(passwordExpiresAt) {
        if (!passwordExpiresAt) {
            return false;
        }
        return passwordExpiresAt.getTime() < Date.now();
    }
    static generateResetToken() {
        return password_util_1.PasswordUtil.generateTemporaryPassword(password_constants_1.PASSWORD_CONSTANTS.RESET_TOKEN_BYTES);
    }
    static resetTokenExpiry() {
        const expires = new Date();
        expires.setMinutes(expires.getMinutes() + password_constants_1.PASSWORD_CONSTANTS.RESET_TOKEN_TTL_MINUTES);
        return expires;
    }
    static inviteTokenExpiry() {
        const expires = new Date();
        expires.setHours(expires.getHours() + password_constants_1.PASSWORD_CONSTANTS.INVITE_TOKEN_TTL_HOURS);
        return expires;
    }
    static generateBackupCodes(count = password_constants_1.PASSWORD_CONSTANTS.TWO_FACTOR_BACKUP_CODE_COUNT) {
        return Array.from({ length: count }, () => password_util_1.PasswordUtil.generateTemporaryPassword(password_constants_1.PASSWORD_CONSTANTS.TWO_FACTOR_BACKUP_CODE_LENGTH));
    }
}
exports.PasswordHelper = PasswordHelper;
//# sourceMappingURL=password.helper.js.map