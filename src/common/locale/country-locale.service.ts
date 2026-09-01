import { Injectable } from "@nestjs/common";
import {
  CountryCode,
  getCountryCallingCode,
  isSupportedCountry,
  isValidPhoneNumber,
  parsePhoneNumberFromString,
} from "libphonenumber-js";
import {
  COUNTRY_LOCALE_PROFILES,
  CountryLocaleProfile,
  DEFAULT_CURRENCY_BY_COUNTRY,
  KNOWN_CURRENCY_CODES,
} from "./country-locale.catalog";
import { TenantContextStorage } from "../context/tenant-context.storage";

export interface LocaleDefaults {
  /** null when no country is selected — country is never mandatory. */
  countryCode: string | null;
  dialCode: string | null;
  /** Suggested base currency when country is set; null if no country. */
  baseCurrency: string | null;
  /** Suggested timezone when country is set; null if no country. */
  timezone: string | null;
}

@Injectable()
export class CountryLocaleService {
  constructor(private readonly tenantContext: TenantContextStorage) {}

  normalizeCountryCode(raw?: string | null): string | null {
    if (!raw) return null;
    const code = raw.trim().toUpperCase();
    return /^[A-Z]{2}$/.test(code) ? code : null;
  }

  getProfile(countryCode?: string | null): CountryLocaleProfile | null {
    const code = this.normalizeCountryCode(countryCode);
    if (!code) return null;
    return COUNTRY_LOCALE_PROFILES[code] ?? null;
  }

  /**
   * Resolve country for validation when present:
   * 1) explicit DTO/record country
   * 2) authenticated user's preferred_country_code
   * 3) tenant country_code
   * Never invents a platform country — returns null if unset.
   */
  resolveCountryCode(explicitCountry?: string | null): string | null {
    const fromDto = this.normalizeCountryCode(explicitCountry);
    if (fromDto) return fromDto;

    const fromUser = this.normalizeCountryCode(
      this.tenantContext.getPreferredCountryCode(),
    );
    if (fromUser) return fromUser;

    return this.normalizeCountryCode(this.tenantContext.getCountryCode());
  }

  getDefaultCurrency(countryCode?: string | null): string | null {
    const code = this.normalizeCountryCode(countryCode);
    if (!code) return null;
    const profile = COUNTRY_LOCALE_PROFILES[code];
    if (profile) return profile.defaultCurrency;
    return DEFAULT_CURRENCY_BY_COUNTRY[code] ?? null;
  }

  getDefaultTimezone(countryCode?: string | null): string | null {
    const profile = this.getProfile(countryCode);
    return profile?.timezones[0] ?? null;
  }

  getDialCode(countryCode?: string | null): string | null {
    const code = this.normalizeCountryCode(countryCode);
    if (!code) return null;

    const profile = COUNTRY_LOCALE_PROFILES[code];
    if (profile?.dialCode) return profile.dialCode;

    if (isSupportedCountry(code as CountryCode)) {
      return `+${getCountryCallingCode(code as CountryCode)}`;
    }
    return null;
  }

  /** Suggestions only — all fields null when country is omitted. */
  getLocaleDefaults(countryCode?: string | null): LocaleDefaults {
    const code = this.normalizeCountryCode(countryCode);
    if (!code) {
      return {
        countryCode: null,
        dialCode: null,
        baseCurrency: null,
        timezone: null,
      };
    }
    return {
      countryCode: code,
      dialCode: this.getDialCode(code),
      baseCurrency: this.getDefaultCurrency(code),
      timezone: this.getDefaultTimezone(code),
    };
  }

  isKnownCurrency(code?: string | null): boolean {
    if (!code) return false;
    return KNOWN_CURRENCY_CODES.has(code.trim().toUpperCase());
  }

  isCurrencyAllowedForCountry(
    currencyCode?: string | null,
    countryCode?: string | null,
    options?: { mustMatchCountryDefault?: boolean },
  ): boolean {
    if (!this.isKnownCurrency(currencyCode)) return false;
    if (!options?.mustMatchCountryDefault) return true;
    const country = this.normalizeCountryCode(countryCode);
    if (!country) return true;
    return (
      currencyCode!.trim().toUpperCase() === this.getDefaultCurrency(country)
    );
  }

  isValidTimezoneForCountry(
    timezone?: string | null,
    countryCode?: string | null,
  ): boolean {
    if (!timezone) return true;
    const profile = this.getProfile(countryCode);
    if (!profile) {
      // No country selected → any IANA-looking zone is fine
      return (
        /^[A-Za-z_]+\/[A-Za-z0-9_+\-]+$/.test(timezone) || timezone === "UTC"
      );
    }
    return profile.timezones.includes(timezone);
  }

  isValidPostalCode(
    postalCode?: string | null,
    countryCode?: string | null,
  ): boolean {
    if (!postalCode) return true;
    const profile = this.getProfile(countryCode);
    if (!profile?.postalCodePattern) {
      return postalCode.length >= 2 && postalCode.length <= 20;
    }
    return profile.postalCodePattern.test(postalCode.trim());
  }

  isValidTaxId(taxId?: string | null, countryCode?: string | null): boolean {
    if (!taxId) return true;
    const profile = this.getProfile(countryCode);
    if (!profile?.taxIdPattern) {
      return taxId.trim().length >= 3 && taxId.trim().length <= 50;
    }
    return profile.taxIdPattern.test(taxId.trim().replace(/\s+/g, ""));
  }

  taxIdLabel(countryCode?: string | null): string {
    return this.getProfile(countryCode)?.taxIdLabel ?? "tax / VAT number";
  }

  /**
   * When country is set → validate for that country (national or E.164).
   * When country is unset → any valid international number (E.164 with +).
   */
  validateAndNormalizePhone(
    phone?: string | null,
    countryCode?: string | null,
  ): { valid: boolean; e164?: string; message?: string } {
    if (!phone || !String(phone).trim()) {
      return { valid: false, message: "phone is required" };
    }

    const country = this.resolveCountryCode(countryCode);
    const trimmed = String(phone).trim();

    if (country && isSupportedCountry(country as CountryCode)) {
      if (isValidPhoneNumber(trimmed, country as CountryCode)) {
        const parsed = parsePhoneNumberFromString(
          trimmed,
          country as CountryCode,
        );
        return { valid: true, e164: parsed!.format("E.164") };
      }
      const international = parsePhoneNumberFromString(trimmed);
      if (international?.isValid() && international.country === country) {
        return { valid: true, e164: international.format("E.164") };
      }
      const dial = this.getDialCode(country);
      return {
        valid: false,
        message: `phone must be a valid ${country} number${dial ? ` (e.g. ${dial}…)` : ""}`,
      };
    }

    const parsed = parsePhoneNumberFromString(trimmed);
    if (parsed?.isValid()) {
      return { valid: true, e164: parsed.format("E.164") };
    }
    return {
      valid: false,
      message:
        "phone must be a valid international number (include country code, e.g. +971…)",
    };
  }

  isPhoneValidForCountry(
    phone?: string | null,
    countryCode?: string | null,
  ): boolean {
    return this.validateAndNormalizePhone(phone, countryCode).valid;
  }

  dialCodeMatchesCountry(
    dialCode?: string | null,
    countryCode?: string | null,
  ): boolean {
    if (!dialCode) return true;
    const country = this.normalizeCountryCode(countryCode);
    if (!country) return /^\+[1-9]\d{0,3}$/.test(dialCode);
    const expected = this.getDialCode(country);
    if (!expected) return /^\+[1-9]\d{0,3}$/.test(dialCode);
    return dialCode.trim() === expected;
  }
}
