/**
 * Convert a non-negative number to Indian-style words (rupees-friendly).
 * Supports up to crores; fractional part ignored for whole amount words.
 */
const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];
const TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

function twoDigits(n: number): string {
  if (n < 20) return ONES[n];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return `${TENS[t]}${o ? ` ${ONES[o]}` : ""}`.trim();
}

function threeDigits(n: number): string {
  const h = Math.floor(n / 100);
  const rest = n % 100;
  if (h && rest) return `${ONES[h]} Hundred ${twoDigits(rest)}`;
  if (h) return `${ONES[h]} Hundred`;
  return twoDigits(rest);
}

export function amountInWords(
  amount: number,
  currencyLabel = "Rupees",
): string {
  if (!Number.isFinite(amount) || amount < 0) return "";
  const whole = Math.floor(Math.abs(amount) + 1e-9);
  if (whole === 0) return `Zero ${currencyLabel} Only`;

  const crore = Math.floor(whole / 10_000_000);
  const lakh = Math.floor((whole % 10_000_000) / 100_000);
  const thousand = Math.floor((whole % 100_000) / 1000);
  const hundred = whole % 1000;

  const parts: string[] = [];
  if (crore) parts.push(`${threeDigits(crore)} Crore`);
  if (lakh) parts.push(`${threeDigits(lakh)} Lakh`);
  if (thousand) parts.push(`${threeDigits(thousand)} Thousand`);
  if (hundred) parts.push(threeDigits(hundred));

  return `${parts.join(" ")} ${currencyLabel} Only`;
}
