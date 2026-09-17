/** Fresa Online Tracking converter parity (observed factors, 3 dp display). */

export const FRESA_VOLUME_WEIGHT_FACTOR = 166.667;

export const FRESA_VALIDATION = {
  LENGTH: "Require value to calculate Length",
  CBM: "Require sufficient values to calculate Cubic Meter",
  WEIGHT: "Require value to calculate Weight",
  LIQUID: "Require value to calculate Liquid Volume",
  VOLUME: "Require value to calculate Volume",
} as const;

export const FRESA_CBM_UNITS = ["C", "M", "MM", "I", "F"] as const;
export type FresaCbmUnit = (typeof FRESA_CBM_UNITS)[number];

export const FRESA_VOLUME_UNITS = ["CM", "FT", "IN", "MT", "MM"] as const;
export type FresaVolumeUnit = (typeof FRESA_VOLUME_UNITS)[number];

export function roundFresa(value: number): number {
  return Math.round(value * 1000) / 1000;
}

export function formatVolumeDisplay(value: number): string {
  const fixed = roundFresa(value).toFixed(3);
  const [intPart, dec] = fixed.split(".");
  const withSep = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${withSep}.${dec}`;
}

export interface LengthConvertInput {
  mm?: number;
  cm?: number;
  meter?: number;
  inch?: number;
  feet?: number;
  yard?: number;
  mile?: number;
  nautical_mile?: number;
}

export interface LengthConvertResult {
  mm: number;
  cm: number;
  meter: number;
  inch: number;
  feet: number;
  yard: number;
  mile: number;
  nautical_mile: number;
  message?: string;
}

const LENGTH_FIELD_ORDER: (keyof LengthConvertInput)[] = [
  "mm",
  "cm",
  "meter",
  "inch",
  "feet",
  "yard",
  "mile",
  "nautical_mile",
];

function lengthToMeters(field: keyof LengthConvertInput, value: number): number {
  switch (field) {
    case "mm":
      return value / 1000;
    case "cm":
      return value / 100;
    case "meter":
      return value;
    case "inch":
      return value * 0.0254;
    case "feet":
      return value * 0.3048;
    case "yard":
      return value * 0.9144;
    case "mile":
      return value * 1609.347;
    case "nautical_mile":
      return value * (1609.347 / 0.88);
    default:
      return value;
  }
}

function metersToLength(meters: number): Omit<LengthConvertResult, "message"> {
  return {
    mm: roundFresa(meters * 1000),
    cm: roundFresa(meters * 100),
    meter: roundFresa(meters),
    inch: roundFresa(meters / 0.0254),
    feet: roundFresa(meters / 0.3048),
    yard: roundFresa(meters / 0.9144),
    mile: roundFresa(meters / 1609.347),
    nautical_mile: roundFresa(meters / (1609.347 / 0.88)),
  };
}

export function convertLength(input: LengthConvertInput): LengthConvertResult {
  let source: { field: keyof LengthConvertInput; value: number } | null = null;
  for (const field of LENGTH_FIELD_ORDER) {
    const raw = input[field];
    if (raw !== undefined && raw !== null && !Number.isNaN(raw)) {
      source = { field, value: Number(raw) };
      break;
    }
  }
  if (!source) {
    return {
      mm: 0,
      cm: 0,
      meter: 0,
      inch: 0,
      feet: 0,
      yard: 0,
      mile: 0,
      nautical_mile: 0,
      message: FRESA_VALIDATION.LENGTH,
    };
  }
  const meters = lengthToMeters(source.field, source.value);
  return metersToLength(meters);
}

export interface CbmConvertInput {
  length?: number;
  width?: number;
  height?: number;
  quantity?: number;
  unit?: FresaCbmUnit;
}

export interface CbmConvertResult {
  cubic_meter: number;
  volume_weight: number;
  message?: string;
}

function cbmFromDimensions(
  l: number,
  w: number,
  h: number,
  qty: number,
  unit: FresaCbmUnit,
): number {
  const product = l * w * h * qty;
  switch (unit) {
    case "C":
      return product / 1_000_000;
    case "M":
      return product;
    case "MM":
      return product / 1_000_000_000;
    case "I":
      return product * 0.0000163870316;
    case "F":
      return product * 0.028316846592;
    default:
      return product / 1_000_000;
  }
}

export function convertCbm(input: CbmConvertInput): CbmConvertResult {
  const { length, width, height, quantity, unit = "C" } = input;
  const missing =
    length === undefined ||
    width === undefined ||
    height === undefined ||
    quantity === undefined ||
    Number.isNaN(length) ||
    Number.isNaN(width) ||
    Number.isNaN(height) ||
    Number.isNaN(quantity);
  if (missing) {
    return {
      cubic_meter: 0,
      volume_weight: 0,
      message: FRESA_VALIDATION.CBM,
    };
  }
  const rawCbm = cbmFromDimensions(
    Number(length),
    Number(width),
    Number(height),
    Number(quantity),
    unit,
  );
  return {
    cubic_meter: roundFresa(rawCbm),
    volume_weight: roundFresa(rawCbm * FRESA_VOLUME_WEIGHT_FACTOR),
  };
}

export interface WeightConvertInput {
  gram?: number;
  kilogram?: number;
  ton?: number;
  ounce?: number;
  pound?: number;
}

export interface WeightConvertResult {
  gram: number;
  kilogram: number;
  ton: number;
  ounce: number;
  pound: number;
  message?: string;
}

const WEIGHT_FIELD_ORDER: (keyof WeightConvertInput)[] = [
  "gram",
  "kilogram",
  "ton",
  "ounce",
  "pound",
];

function weightToKg(field: keyof WeightConvertInput, value: number): number {
  switch (field) {
    case "gram":
      return value / 1000;
    case "kilogram":
      return value;
    case "ton":
      return value * 1000;
    case "ounce":
      return value / 35.274;
    case "pound":
      return value / 2.205;
    default:
      return value;
  }
}

function kgToWeight(kg: number): Omit<WeightConvertResult, "message"> {
  return {
    gram: roundFresa(kg * 1000),
    kilogram: roundFresa(kg),
    ton: roundFresa(kg / 1000),
    ounce: roundFresa(kg * 35.274),
    pound: roundFresa(kg * 2.205),
  };
}

export function convertWeight(input: WeightConvertInput): WeightConvertResult {
  let source: { field: keyof WeightConvertInput; value: number } | null = null;
  for (const field of WEIGHT_FIELD_ORDER) {
    const raw = input[field];
    if (raw !== undefined && raw !== null && !Number.isNaN(raw)) {
      source = { field, value: Number(raw) };
      break;
    }
  }
  if (!source) {
    return {
      gram: 0,
      kilogram: 0,
      ton: 0,
      ounce: 0,
      pound: 0,
      message: FRESA_VALIDATION.WEIGHT,
    };
  }
  return kgToWeight(weightToKg(source.field, source.value));
}

export interface LiquidConvertInput {
  litre?: number;
  fluid_ounce?: number;
  quart?: number;
  gallon?: number;
  imperial_gallon?: number;
}

export interface LiquidConvertResult {
  litre: number;
  fluid_ounce: number;
  quart: number;
  gallon: number;
  imperial_gallon: number;
  message?: string;
}

const LIQUID_FIELD_ORDER: (keyof LiquidConvertInput)[] = [
  "litre",
  "fluid_ounce",
  "quart",
  "gallon",
  "imperial_gallon",
];

function liquidToLitres(
  field: keyof LiquidConvertInput,
  value: number,
): number {
  switch (field) {
    case "litre":
      return value;
    case "fluid_ounce":
      return value / 33.824;
    case "quart":
      return value / 1.057;
    case "gallon":
      return value * 3.785;
    case "imperial_gallon":
      return value / 0.22;
    default:
      return value;
  }
}

function litresToLiquid(l: number): Omit<LiquidConvertResult, "message"> {
  return {
    litre: roundFresa(l),
    fluid_ounce: roundFresa(l * 33.824),
    quart: roundFresa(l * 1.057),
    gallon: roundFresa(l / 3.785),
    imperial_gallon: roundFresa(l * 0.22),
  };
}

export function convertLiquid(input: LiquidConvertInput): LiquidConvertResult {
  let source: { field: keyof LiquidConvertInput; value: number } | null = null;
  for (const field of LIQUID_FIELD_ORDER) {
    const raw = input[field];
    if (raw !== undefined && raw !== null && !Number.isNaN(raw)) {
      source = { field, value: Number(raw) };
      break;
    }
  }
  if (!source) {
    return {
      litre: 0,
      fluid_ounce: 0,
      quart: 0,
      gallon: 0,
      imperial_gallon: 0,
      message: FRESA_VALIDATION.LIQUID,
    };
  }
  return litresToLiquid(liquidToLitres(source.field, source.value));
}

export interface VolumeConvertInput {
  input_unit: FresaVolumeUnit;
  value?: number;
  output_unit: FresaVolumeUnit;
}

export interface VolumeConvertResult {
  input_unit: FresaVolumeUnit;
  output_unit: FresaVolumeUnit;
  value: number;
  result: number;
  display?: string;
  message?: string;
}

function volumeToCubicMeters(unit: FresaVolumeUnit, value: number): number {
  switch (unit) {
    case "MT":
      return value;
    case "CM":
      return value / 1_000_000;
    case "MM":
      return value / 1_000_000_000;
    case "FT":
      return value * 0.028316846592;
    case "IN":
      return value * 0.000016387064;
    default:
      return value;
  }
}

function cubicMetersToVolume(unit: FresaVolumeUnit, m3: number): number {
  switch (unit) {
    case "MT":
      return m3;
    case "CM":
      return m3 * 1_000_000;
    case "MM":
      return m3 * 1_000_000_000;
    case "FT":
      return m3 * 35.315;
    case "IN":
      return m3 * 61023.843;
    default:
      return m3;
  }
}

export function convertVolume(input: VolumeConvertInput): VolumeConvertResult {
  const { input_unit, output_unit } = input;
  const value = input.value;
  if (value === undefined || value === null || Number.isNaN(value)) {
    return {
      input_unit,
      output_unit,
      value: 0,
      result: 0,
      message: FRESA_VALIDATION.VOLUME,
    };
  }
  const num = Number(value);
  const m3 = volumeToCubicMeters(input_unit, num);
  const rawResult = cubicMetersToVolume(output_unit, m3);
  const result = roundFresa(rawResult);
  return {
    input_unit,
    output_unit,
    value: num,
    result,
    display: formatVolumeDisplay(result),
  };
}
