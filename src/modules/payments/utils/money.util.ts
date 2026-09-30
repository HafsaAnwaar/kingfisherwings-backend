import { Prisma } from "@prisma/client";

type DecimalLike = Prisma.Decimal | number | string;

/** Stripe zero-decimal currencies (amount is already in the minor unit). */
const ZERO_DECIMAL = new Set([
  "BIF",
  "CLP",
  "DJF",
  "GNF",
  "JPY",
  "KMF",
  "KRW",
  "MGA",
  "PYG",
  "RWF",
  "UGX",
  "VND",
  "VUV",
  "XAF",
  "XOF",
  "XPF",
]);

/**
 * Stripe three-decimal currencies. Stripe requires the minor-unit amount
 * to be divisible by 10 for these (i.e. effectively 2 decimals).
 */
const THREE_DECIMAL = new Set(["BHD", "JOD", "KWD", "OMR", "TND"]);

export function toDecimal(
  value: DecimalLike | null | undefined,
): Prisma.Decimal {
  if (value === null || value === undefined || value === "") {
    return new Prisma.Decimal(0);
  }
  return new Prisma.Decimal(value as Prisma.Decimal.Value);
}

/** Rounds to 2dp (money presentation) using banker-safe HALF_UP. */
export function roundMoney(value: DecimalLike): Prisma.Decimal {
  return toDecimal(value).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
}

export function currencyExponent(currency: string): number {
  const c = currency.toUpperCase();
  if (ZERO_DECIMAL.has(c)) return 0;
  if (THREE_DECIMAL.has(c)) return 3;
  return 2;
}

/**
 * Converts an ERP major-unit amount to Stripe's integer minor unit,
 * never going through binary floating point.
 */
export function toMinorUnits(amount: DecimalLike, currency: string): bigint {
  const exp = currencyExponent(currency);
  let minor = toDecimal(amount)
    .mul(new Prisma.Decimal(10).pow(exp))
    .toDecimalPlaces(0, Prisma.Decimal.ROUND_HALF_UP);
  if (exp === 3) {
    // Stripe: last digit must be 0 for three-decimal currencies.
    minor = minor
      .div(10)
      .toDecimalPlaces(0, Prisma.Decimal.ROUND_HALF_UP)
      .mul(10);
  }
  return BigInt(minor.toFixed(0));
}

export function fromMinorUnits(
  minor: number | bigint,
  currency: string,
): Prisma.Decimal {
  const exp = currencyExponent(currency);
  return new Prisma.Decimal(minor.toString()).div(
    new Prisma.Decimal(10).pow(exp),
  );
}

/** a > b + epsilon (money comparisons at 4dp storage precision). */
export function gtMoney(a: DecimalLike, b: DecimalLike): boolean {
  return toDecimal(a).minus(toDecimal(b)).greaterThan("0.0001");
}

export function isPositiveMoney(a: DecimalLike): boolean {
  return toDecimal(a).greaterThan("0.0001");
}

export function minDecimal(a: DecimalLike, b: DecimalLike): Prisma.Decimal {
  const da = toDecimal(a);
  const db = toDecimal(b);
  return da.lessThan(db) ? da : db;
}
