import {
  DimensionLengthUnit,
  DimensionVolumeUnit,
  DimensionWeightUnit,
} from "@prisma/client";

/** IATA air / common sea volumetric divisor when dims are in cm → kg. */
export const DEFAULT_VOLUMETRIC_DIVISOR_CM = 6000;

export function lengthToCm(
  value: number,
  unit: DimensionLengthUnit = DimensionLengthUnit.CM,
): number {
  switch (unit) {
    case DimensionLengthUnit.MM:
      return value / 10;
    case DimensionLengthUnit.M:
      return value * 100;
    case DimensionLengthUnit.IN:
      return value * 2.54;
    case DimensionLengthUnit.FT:
      return value * 30.48;
    case DimensionLengthUnit.CM:
    default:
      return value;
  }
}

export function weightToKg(
  value: number,
  unit: DimensionWeightUnit = DimensionWeightUnit.KG,
): number {
  switch (unit) {
    case DimensionWeightUnit.G:
      return value / 1000;
    case DimensionWeightUnit.LB:
      return value * 0.45359237;
    case DimensionWeightUnit.MT:
      return value * 1000;
    case DimensionWeightUnit.KG:
    default:
      return value;
  }
}

export function computeVolumeCbm(params: {
  length?: number | null;
  width?: number | null;
  height?: number | null;
  no_of_pcs?: number | null;
  length_unit?: DimensionLengthUnit | null;
  volume?: number | null;
  volume_unit?: DimensionVolumeUnit | null;
}): number | null {
  if (params.volume != null && params.volume_unit) {
    const v = Number(params.volume);
    if (params.volume_unit === DimensionVolumeUnit.CBM) return v;
    if (params.volume_unit === DimensionVolumeUnit.CFT) return v * 0.0283168;
    if (params.volume_unit === DimensionVolumeUnit.CI) return v * 1.63871e-5;
  }
  const L = params.length;
  const W = params.width;
  const H = params.height;
  if (L == null || W == null || H == null) return null;
  const pcs = params.no_of_pcs ?? 1;
  const unit = params.length_unit ?? DimensionLengthUnit.CM;
  const lCm = lengthToCm(Number(L), unit);
  const wCm = lengthToCm(Number(W), unit);
  const hCm = lengthToCm(Number(H), unit);
  // cm³ → m³
  return (lCm * wCm * hCm * pcs) / 1_000_000;
}

export function computeVolumetricWeightKg(params: {
  length?: number | null;
  width?: number | null;
  height?: number | null;
  no_of_pcs?: number | null;
  length_unit?: DimensionLengthUnit | null;
  divisor?: number;
}): number | null {
  const L = params.length;
  const W = params.width;
  const H = params.height;
  if (L == null || W == null || H == null) return null;
  const pcs = params.no_of_pcs ?? 1;
  const unit = params.length_unit ?? DimensionLengthUnit.CM;
  const lCm = lengthToCm(Number(L), unit);
  const wCm = lengthToCm(Number(W), unit);
  const hCm = lengthToCm(Number(H), unit);
  const divisor = params.divisor ?? DEFAULT_VOLUMETRIC_DIVISOR_CM;
  return (lCm * wCm * hCm * pcs) / divisor;
}

export function computeTotalWeightKg(params: {
  g_weight?: number | null;
  g_weight_unit?: DimensionWeightUnit | null;
  no_of_pcs?: number | null;
  total_weight?: number | null;
  total_weight_unit?: DimensionWeightUnit | null;
}): number | null {
  if (params.total_weight != null) {
    return weightToKg(
      Number(params.total_weight),
      params.total_weight_unit ?? DimensionWeightUnit.KG,
    );
  }
  if (params.g_weight == null) return null;
  const pcs = params.no_of_pcs ?? 1;
  return (
    weightToKg(
      Number(params.g_weight),
      params.g_weight_unit ?? DimensionWeightUnit.KG,
    ) * pcs
  );
}
