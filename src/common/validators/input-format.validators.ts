/**
 * Shared input-format validators for masters, parties, and user-facing DTOs.
 * Prefer E.164 phones (+971501234567) and ISO codes for codes/currency/country.
 */
import { applyDecorators } from '@nestjs/common';
import { IsEmail as CvIsEmail, Matches, MaxLength, MinLength, ValidationOptions } from 'class-validator';

/** E.164 international phone: + followed by 7–15 digits, first digit 1–9. */
const E164_PHONE = /^\+[1-9]\d{6,14}$/;

/** ISO 3166-1 alpha-2 */
const COUNTRY_CODE = /^[A-Z]{2}$/;

/** ISO 4217 */
const CURRENCY_CODE = /^[A-Z]{3}$/;

/** IATA airport / airline 2–3 letter codes */
const IATA_2 = /^[A-Z0-9]{2}$/;
const IATA_3 = /^[A-Z]{3}$/;
const ICAO_3 = /^[A-Z]{3}$/;
const ICAO_4 = /^[A-Z]{4}$/;

/** UN/LOCODE roughly: 2-letter country + 3 alnum */
const UN_LOCODE = /^[A-Z]{2}[A-Z0-9]{3}$/;

/** IMO vessel number: 7 digits */
const IMO = /^\d{7}$/;

/** SWIFT/BIC: 8 or 11 alphanumerics */
const SWIFT = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

/** Dial code like +971 */
const DIAL_CODE = /^\+[1-9]\d{0,3}$/;

/** AWB airline prefix: 3 digits */
const AWB_PREFIX = /^\d{3}$/;

export function IsE164Phone(validationOptions?: ValidationOptions) {
  return applyDecorators(
    Matches(E164_PHONE, {
      message: 'phone must be a valid E.164 number (e.g. +971501234567)',
      ...validationOptions,
    }),
  );
}

export function IsStrictEmail(validationOptions?: ValidationOptions) {
  return applyDecorators(
    CvIsEmail({}, { message: 'email must be a valid email address', ...validationOptions }),
    MaxLength(255, validationOptions),
  );
}

export function IsCountryCode(validationOptions?: ValidationOptions) {
  return applyDecorators(
    Matches(COUNTRY_CODE, {
      message: 'country_code must be ISO 3166-1 alpha-2 uppercase (e.g. AE)',
      ...validationOptions,
    }),
    MinLength(2, validationOptions),
    MaxLength(2, validationOptions),
  );
}

export function IsCurrencyCode(validationOptions?: ValidationOptions) {
  return applyDecorators(
    Matches(CURRENCY_CODE, {
      message: 'currency_code must be ISO 4217 uppercase (e.g. AED)',
      ...validationOptions,
    }),
  );
}

export function IsIata2Code(validationOptions?: ValidationOptions) {
  return applyDecorators(
    Matches(IATA_2, { message: 'must be a 2-character IATA code (A–Z / 0–9)', ...validationOptions }),
  );
}

export function IsIata3Code(validationOptions?: ValidationOptions) {
  return applyDecorators(
    Matches(IATA_3, { message: 'must be a 3-letter IATA code (A–Z)', ...validationOptions }),
  );
}

export function IsIcao3Code(validationOptions?: ValidationOptions) {
  return applyDecorators(
    Matches(ICAO_3, { message: 'must be a 3-letter ICAO code (A–Z)', ...validationOptions }),
  );
}

export function IsIcao4Code(validationOptions?: ValidationOptions) {
  return applyDecorators(
    Matches(ICAO_4, { message: 'must be a 4-letter ICAO code (A–Z)', ...validationOptions }),
  );
}

export function IsUnLocode(validationOptions?: ValidationOptions) {
  return applyDecorators(
    Matches(UN_LOCODE, { message: 'un_locode must look like AEJEA (UN/LOCODE)', ...validationOptions }),
  );
}

export function IsImoNumber(validationOptions?: ValidationOptions) {
  return applyDecorators(
    Matches(IMO, { message: 'imo_number must be a 7-digit IMO number', ...validationOptions }),
  );
}

export function IsSwiftCode(validationOptions?: ValidationOptions) {
  return applyDecorators(
    Matches(SWIFT, { message: 'swift_code must be a valid SWIFT/BIC (8 or 11 chars)', ...validationOptions }),
  );
}

export function IsDialCode(validationOptions?: ValidationOptions) {
  return applyDecorators(
    Matches(DIAL_CODE, { message: 'dial_code must look like +971', ...validationOptions }),
  );
}

export function IsAwbPrefix(validationOptions?: ValidationOptions) {
  return applyDecorators(
    Matches(AWB_PREFIX, { message: 'prefix_code must be a 3-digit AWB prefix', ...validationOptions }),
  );
}
