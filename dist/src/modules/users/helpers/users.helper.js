"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersHelper = void 0;
class UsersHelper {
    static normalizeEmail(email) {
        return email.trim().toLowerCase();
    }
    static buildFullName(firstName, lastName) {
        return `${firstName} ${lastName}`.trim();
    }
    static maskEmail(email) {
        const [local, domain] = email.split('@');
        if (!domain || local.length <= 2) {
            return `${local?.[0] ?? '*'}***@${domain ?? ''}`;
        }
        return `${local.slice(0, 2)}***@${domain}`;
    }
    static isWithinOfficeHours(user, at = new Date()) {
        if (!user.office_hours_start || !user.office_hours_end) {
            return true;
        }
        const timeZone = user.office_hours_timezone ?? 'UTC';
        const formatter = new Intl.DateTimeFormat('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone,
        });
        const currentTime = formatter.format(at);
        return (currentTime >= user.office_hours_start && currentTime <= user.office_hours_end);
    }
    static isIpAllowed(user, ip) {
        if (!user.allowed_ips || user.allowed_ips.length === 0) {
            return true;
        }
        if (!ip) {
            return false;
        }
        return user.allowed_ips.includes(ip);
    }
    static isMacAllowed(user, mac) {
        if (!user.allowed_mac_addresses || user.allowed_mac_addresses.length === 0) {
            return true;
        }
        if (!mac) {
            return false;
        }
        return user.allowed_mac_addresses.includes(mac.toUpperCase());
    }
    static isAccountLocked(user, at = new Date()) {
        return Boolean(user.locked_until && user.locked_until.getTime() > at.getTime());
    }
}
exports.UsersHelper = UsersHelper;
//# sourceMappingURL=users.helper.js.map