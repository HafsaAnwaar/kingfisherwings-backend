import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { getCountryLocaleService } from '../locale/country-locale.accessor';
import { IsCountryCode, IsCurrencyCode as IsCurrencyCodeFormat } from '../validators/input-format.validators';
import { KNOWN_CURRENCY_CODES } from '../locale/country-locale.catalog';

export type CountryFieldOptions = {
  /** Sibling property holding ISO2 country (default: country_code). */
  countryField?: string;
  /** When DTO has no country, use tenant ALS country (default true). */
  useTenantCountry?: boolean;
};

function resolveCountryFromArgs(args: ValidationArguments, options?: CountryFieldOptions): string | null {
  const field = options?.countryField ?? 'country_code';
  const obj = args.object as Record<string, unknown>;
  const explicit = typeof obj[field] === 'string' ? (obj[field] as string) : null;
  const locale = getCountryLocaleService();
  if (options?.useTenantCountry === false) {
    return locale.normalizeCountryCode(explicit);
  }
  return locale.resolveCountryCode(explicit);
}

@ValidatorConstraint({ name: 'isPhoneForCountry', async: false })
export class IsPhoneForCountryConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    if (value === undefined || value === null || value === '') return true;
    if (typeof value !== 'string') return false;
    const options = (args.constraints[0] ?? {}) as CountryFieldOptions;
    const country = resolveCountryFromArgs(args, options);
    return getCountryLocaleService().isPhoneValidForCountry(value, country);
  }

  defaultMessage(args: ValidationArguments): string {
    const options = (args.constraints[0] ?? {}) as CountryFieldOptions;
    const country = resolveCountryFromArgs(args, options);
    return country
      ? `phone must be a valid number for ${country}`
      : 'phone must be a valid international number (include country code, e.g. +971…)';
  }
}

/** Phone valid for DTO/tenant country; national or E.164 accepted. */
export function IsPhoneForCountry(options?: CountryFieldOptions & ValidationOptions) {
  const { countryField, useTenantCountry, ...validationOptions } = options ?? {};
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [{ countryField, useTenantCountry }],
      validator: IsPhoneForCountryConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'isPostalCodeForCountry', async: false })
export class IsPostalCodeForCountryConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    if (value === undefined || value === null || value === '') return true;
    if (typeof value !== 'string') return false;
    const options = (args.constraints[0] ?? {}) as CountryFieldOptions;
    const country = resolveCountryFromArgs(args, options);
    return getCountryLocaleService().isValidPostalCode(value, country);
  }

  defaultMessage(args: ValidationArguments): string {
    const options = (args.constraints[0] ?? {}) as CountryFieldOptions;
    const country = resolveCountryFromArgs(args, options) ?? 'selected country';
    return `postal_code is not valid for ${country}`;
  }
}

export function IsPostalCodeForCountry(options?: CountryFieldOptions & ValidationOptions) {
  const { countryField, useTenantCountry, ...validationOptions } = options ?? {};
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [{ countryField, useTenantCountry }],
      validator: IsPostalCodeForCountryConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'isTaxIdForCountry', async: false })
export class IsTaxIdForCountryConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    if (value === undefined || value === null || value === '') return true;
    if (typeof value !== 'string') return false;
    const options = (args.constraints[0] ?? {}) as CountryFieldOptions;
    const country = resolveCountryFromArgs(args, options);
    return getCountryLocaleService().isValidTaxId(value, country);
  }

  defaultMessage(args: ValidationArguments): string {
    const options = (args.constraints[0] ?? {}) as CountryFieldOptions;
    const country = resolveCountryFromArgs(args, options);
    const label = getCountryLocaleService().taxIdLabel(country);
    return `${args.property} must be a valid ${label}`;
  }
}

export function IsTaxIdForCountry(options?: CountryFieldOptions & ValidationOptions) {
  const { countryField, useTenantCountry, ...validationOptions } = options ?? {};
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [{ countryField, useTenantCountry }],
      validator: IsTaxIdForCountryConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'isDialCodeForCountry', async: false })
export class IsDialCodeForCountryConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    if (value === undefined || value === null || value === '') return true;
    if (typeof value !== 'string') return false;
    const options = (args.constraints[0] ?? {}) as CountryFieldOptions;
    const country = resolveCountryFromArgs(args, {
      countryField: options.countryField ?? 'iso_code',
      useTenantCountry: options.useTenantCountry,
    });
    return getCountryLocaleService().dialCodeMatchesCountry(value, country);
  }

  defaultMessage(args: ValidationArguments): string {
    const options = (args.constraints[0] ?? {}) as CountryFieldOptions;
    const country = resolveCountryFromArgs(args, {
      countryField: options.countryField ?? 'iso_code',
      useTenantCountry: options.useTenantCountry,
    });
    const expected = getCountryLocaleService().getDialCode(country);
    return expected
      ? `dial_code must be ${expected} for ${country}`
      : 'dial_code must look like +971';
  }
}

export function IsDialCodeForCountry(options?: CountryFieldOptions & ValidationOptions) {
  const { countryField, useTenantCountry, ...validationOptions } = options ?? {};
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [{ countryField: countryField ?? 'iso_code', useTenantCountry }],
      validator: IsDialCodeForCountryConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'isTimezoneForCountry', async: false })
export class IsTimezoneForCountryConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    if (value === undefined || value === null || value === '') return true;
    if (typeof value !== 'string') return false;
    const options = (args.constraints[0] ?? {}) as CountryFieldOptions;
    const country = resolveCountryFromArgs(args, options);
    // If country has a profile, enforce its zones; otherwise accept IANA-ish
    return getCountryLocaleService().isValidTimezoneForCountry(value, country);
  }

  defaultMessage(args: ValidationArguments): string {
    const options = (args.constraints[0] ?? {}) as CountryFieldOptions;
    const country = resolveCountryFromArgs(args, options);
    const profile = getCountryLocaleService().getProfile(country);
    if (profile) {
      return `timezone must be one of: ${profile.timezones.join(', ')}`;
    }
    return 'timezone must be a valid IANA timezone (e.g. Asia/Dubai)';
  }
}

export function IsTimezoneForCountry(options?: CountryFieldOptions & ValidationOptions) {
  const { countryField, useTenantCountry, ...validationOptions } = options ?? {};
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [{ countryField, useTenantCountry }],
      validator: IsTimezoneForCountryConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'isKnownCurrencyCode', async: false })
export class IsKnownCurrencyCodeConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (value === undefined || value === null || value === '') return true;
    if (typeof value !== 'string') return false;
    return KNOWN_CURRENCY_CODES.has(value.trim().toUpperCase());
  }

  defaultMessage(): string {
    return 'currency_code must be a valid ISO 4217 currency code';
  }
}

/** Real ISO 4217 membership (not just A–Z × 3). */
export function IsKnownCurrencyCode(validationOptions?: ValidationOptions) {
  return applyDecorators(
    IsCurrencyCodeFormat(validationOptions),
    function (object: object, propertyName: string) {
      registerDecorator({
        target: object.constructor,
        propertyName,
        options: validationOptions,
        validator: IsKnownCurrencyCodeConstraint,
      });
    },
  );
}

/**
 * When creating a tenant/org: if currency omitted, defaults come from service.
 * When both country + currency are set with mustMatch, enforce primary currency
 * of that country (tenant bootstrap only).
 */
@ValidatorConstraint({ name: 'isCountryDefaultCurrency', async: false })
export class IsCountryDefaultCurrencyConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    if (value === undefined || value === null || value === '') return true;
    if (typeof value !== 'string') return false;
    if (!KNOWN_CURRENCY_CODES.has(value.trim().toUpperCase())) return false;
    const options = (args.constraints[0] ?? {}) as CountryFieldOptions & {
      mustMatchCountryDefault?: boolean;
    };
    if (!options.mustMatchCountryDefault) return true;
    const country = resolveCountryFromArgs(args, options);
    return getCountryLocaleService().isCurrencyAllowedForCountry(value, country, {
      mustMatchCountryDefault: true,
    });
  }

  defaultMessage(args: ValidationArguments): string {
    const options = (args.constraints[0] ?? {}) as CountryFieldOptions;
    const country = resolveCountryFromArgs(args, options);
    const expected = getCountryLocaleService().getDefaultCurrency(country);
    return `base_currency for ${country ?? 'this country'} should be ${expected}`;
  }
}

export function IsCountryDefaultCurrency(
  options?: CountryFieldOptions & { mustMatchCountryDefault?: boolean } & ValidationOptions,
) {
  const { countryField, useTenantCountry, mustMatchCountryDefault, ...validationOptions } =
    options ?? {};
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [{ countryField, useTenantCountry, mustMatchCountryDefault }],
      validator: IsCountryDefaultCurrencyConstraint,
    });
  };
}

/** Uppercase + trim; empty string → undefined so country stays optional / clearable. */
export function NormalizeCountryCode() {
  return Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    return typeof value === 'string' ? value.trim().toUpperCase() : value;
  });
}

export function NormalizeCurrencyCode() {
  return Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    return typeof value === 'string' ? value.trim().toUpperCase() : value;
  });
}

export function CountryCodeField(validationOptions?: ValidationOptions) {
  return applyDecorators(NormalizeCountryCode(), IsCountryCode(validationOptions));
}
