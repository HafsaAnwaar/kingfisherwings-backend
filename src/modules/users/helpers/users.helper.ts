import { User } from '@prisma/client';

export class UsersHelper {
  static normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  static buildFullName(firstName: string, lastName: string): string {
    return `${firstName} ${lastName}`.trim();
  }

  static maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!domain || local.length <= 2) {
      return `${local?.[0] ?? '*'}***@${domain ?? ''}`;
    }
    return `${local.slice(0, 2)}***@${domain}`;
  }

  /**
   * True if the given time (default now) falls within the user's
   * configured office hours. If no restriction is configured, access is
   * always allowed. Times are stored as "HH:mm" strings interpreted in
   * office_hours_timezone.
   */
  static isWithinOfficeHours(user: User, at: Date = new Date()): boolean {
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

    const currentTime = formatter.format(at); // "HH:mm"

    return (
      currentTime >= user.office_hours_start && currentTime <= user.office_hours_end
    );
  }

  /** Empty allow-list means unrestricted. */
  static isIpAllowed(user: User, ip?: string): boolean {
    if (!user.allowed_ips || user.allowed_ips.length === 0) {
      return true;
    }
    if (!ip) {
      return false;
    }
    return user.allowed_ips.includes(ip);
  }

  /** Empty allow-list means unrestricted. */
  static isMacAllowed(user: User, mac?: string): boolean {
    if (!user.allowed_mac_addresses || user.allowed_mac_addresses.length === 0) {
      return true;
    }
    if (!mac) {
      return false;
    }
    return user.allowed_mac_addresses.includes(mac.toUpperCase());
  }

  static isAccountLocked(user: User, at: Date = new Date()): boolean {
    return Boolean(user.locked_until && user.locked_until.getTime() > at.getTime());
  }
}
