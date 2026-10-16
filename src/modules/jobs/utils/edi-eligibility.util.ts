import { DocumentationEdiType, JobType } from "@prisma/client";

const AIR_TYPES: JobType[] = ["AIR_EXPORT", "AIR_IMPORT"];
const EXPORT_TYPES: JobType[] = [
  "SEA_FCL_EXPORT",
  "SEA_LCL_EXPORT",
  "AIR_EXPORT",
  "NVOCC_EXPORT",
];
const SEA_TYPES: JobType[] = [
  "SEA_FCL_EXPORT",
  "SEA_FCL_IMPORT",
  "SEA_LCL_EXPORT",
  "SEA_LCL_IMPORT",
  "NVOCC_EXPORT",
  "NVOCC_IMPORT",
];

export function eligibleEdiTypes(
  jobType: JobType,
  isHouse: boolean,
): DocumentationEdiType[] {
  const types: DocumentationEdiType[] = [];
  const isAir = AIR_TYPES.includes(jobType);
  const isExport = EXPORT_TYPES.includes(jobType);
  const isSea = SEA_TYPES.includes(jobType);

  if (isAir) {
    types.push("CCN_FWB", "CCN_FHL");
  }
  if (isHouse && (isSea || isAir)) {
    types.push("BAYAN_HOUSE");
  } else if (isExport || isSea) {
    types.push("BAYAN_MASTER");
  }
  if (isExport || isSea) {
    types.push("EQO_DUBAI", "EQO_OMAN", "IAL");
  }

  return [...new Set(types)];
}

export function ediTypeLabel(type: DocumentationEdiType): string {
  const labels: Partial<Record<DocumentationEdiType, string>> = {
    BAYAN_MASTER: "Bayan (Master)",
    BAYAN_HOUSE: "Bayan (House)",
    CCN_FWB: "CCN FWB",
    CCN_FHL: "CCN FHL",
    EQO_DUBAI: "EQO Dubai BOL",
    EQO_OMAN: "EQO Oman BOL",
    IAL: "IAL",
    CGM: "CGM",
    MPCI: "MPCI",
  };
  return labels[type] ?? type;
}
