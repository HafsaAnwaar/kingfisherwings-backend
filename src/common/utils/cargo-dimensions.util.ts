export type CargoDimensionInput = {
  length_m?: number | null;
  width_m?: number | null;
  height_m?: number | null;
  length_cm?: number | null;
  width_cm?: number | null;
  height_cm?: number | null;
  pieces?: number | null;
  gross_weight_kg?: number | null;
};

export type NormalizedCargoPackage = {
  length_m: number;
  width_m: number;
  height_m: number;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  pieces: number;
  gross_weight_kg: number;
  /** CBM = Length(m) × Width(m) × Height(m) × pieces */
  cbm: number;
};

/**
 * CBM for one piece: Length (m) × Width (m) × Height (m).
 * Total CBM multiplies by piece count.
 */
export function cbmFromMeters(
  lengthM: number,
  widthM: number,
  heightM: number,
  pieces = 1,
): number {
  if (lengthM <= 0 || widthM <= 0 || heightM <= 0 || pieces <= 0) {
    return 0;
  }
  return lengthM * widthM * heightM * pieces;
}

/** @deprecated Prefer metres via cbmFromMeters. Kept for cm payloads. */
export function cbmFromCm(
  lengthCm: number,
  widthCm: number,
  heightCm: number,
  pieces = 1,
): number {
  return cbmFromMeters(
    lengthCm / 100,
    widthCm / 100,
    heightCm / 100,
    pieces,
  );
}

export function resolveCargoPackage(
  input: CargoDimensionInput,
): NormalizedCargoPackage {
  const pieces = Number(input.pieces ?? 1);
  let lengthM = input.length_m != null ? Number(input.length_m) : null;
  let widthM = input.width_m != null ? Number(input.width_m) : null;
  let heightM = input.height_m != null ? Number(input.height_m) : null;

  if (lengthM == null && input.length_cm != null) {
    lengthM = Number(input.length_cm) / 100;
  }
  if (widthM == null && input.width_cm != null) {
    widthM = Number(input.width_cm) / 100;
  }
  if (heightM == null && input.height_cm != null) {
    heightM = Number(input.height_cm) / 100;
  }

  if (
    lengthM == null ||
    widthM == null ||
    heightM == null ||
    lengthM <= 0 ||
    widthM <= 0 ||
    heightM <= 0 ||
    pieces <= 0
  ) {
    throw new Error(
      "Package length, width, and height are required in metres (or centimetres).",
    );
  }

  const cbm = cbmFromMeters(lengthM, widthM, heightM, pieces);
  return {
    length_m: lengthM,
    width_m: widthM,
    height_m: heightM,
    length_cm: lengthM * 100,
    width_cm: widthM * 100,
    height_cm: heightM * 100,
    pieces,
    gross_weight_kg: Number(input.gross_weight_kg ?? 0),
    cbm,
  };
}

export function sumPackageCbm(packages: { cbm: number }[]): number {
  return packages.reduce((sum, pkg) => sum + Number(pkg.cbm), 0);
}

export function chargeableWeightKg(
  grossKg: number,
  cbm: number,
  factor = 167,
): number {
  const volumetric = cbm * factor;
  return Math.max(grossKg, volumetric);
}

export function totalGrossWeightKg(
  packages: { gross_weight_kg: number }[],
): number {
  return packages.reduce(
    (sum, pkg) => sum + Number(pkg.gross_weight_kg),
    0,
  );
}

export function totalPieces(packages: { pieces: number }[]): number {
  return packages.reduce((sum, pkg) => sum + Number(pkg.pieces), 0);
}
