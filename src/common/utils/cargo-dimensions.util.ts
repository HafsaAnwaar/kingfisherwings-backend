export function cbmFromCm(
  lengthCm: number,
  widthCm: number,
  heightCm: number,
  pieces = 1,
): number {
  if (lengthCm <= 0 || widthCm <= 0 || heightCm <= 0 || pieces <= 0) {
    return 0;
  }
  const unitCbm = (lengthCm * widthCm * heightCm) / 1_000_000;
  return unitCbm * pieces;
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
