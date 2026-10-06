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

/**
 * Stripe minimum charge amounts (major units) for common currencies —
 * see https://docs.stripe.com/currencies#minimum-and-maximum-charge-amounts.
 * Checked up front so payers get a clear message instead of a provider error.
 */
export const STRIPE_MINIMUM_CHARGE: Record<string, string> = {
  USD: "0.50",
  AED: "2.00",
  AUD: "0.50",
  BGN: "1.00",
  BRL: "0.50",
  CAD: "0.50",
  CHF: "0.50",
  CZK: "15.00",
  DKK: "2.50",
  EUR: "0.50",
  GBP: "0.30",
  HKD: "4.00",
  HUF: "175.00",
  INR: "0.50",
  JPY: "50",
  MXN: "10.00",
  MYR: "2.00",
  NOK: "3.00",
  NZD: "0.50",
  PLN: "2.00",
  RON: "2.00",
  SEK: "3.00",
  SGD: "0.50",
  THB: "10.00",
};

/** Returns an error message when the amount is below Stripe's minimum. */
export function stripeMinimumError(
  amount: DecimalLike,
  currency: string,
): string | null {
  const min = STRIPE_MINIMUM_CHARGE[currency.toUpperCase()];
  if (!min) return null;
  return toDecimal(amount).lessThan(min)
    ? `Online payments in ${currency.toUpperCase()} must be at least ${min}; please pay this balance by another method.`
    : null;
}
