import { DocumentType, JobType } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

const AIR_EXPORT_DOCUMENTS: DocumentType[] = [
  'HAWB',
  'MAWB',
  'E_AWB',
  'PRE_ALERT',
  'CARGO_MANIFEST',
  'FREIGHT_MANIFEST',
  'BARCODE_LABEL',
  'CONSIGNEE_LABEL',
  'JOB_CARD',
  'JOB_PNL',
  'JOB_COSTING',
  'PROFORMA_INVOICE',
  'FREIGHT_CERTIFICATE',
  'BOOKING_CONFIRMATION',
  'PACKING_LIST',
  'COMMERCIAL_INVOICE',
];

const AIR_IMPORT_DOCUMENTS: DocumentType[] = [
  'PRE_CAN',
  'CAN',
  'DELIVERY_ORDER',
  'PROOF_OF_DELIVERY',
  'FREIGHT_MANIFEST',
  'FREIGHT_CERTIFICATE',
  'PROFORMA_INVOICE',
  'JOB_CARD',
  'JOB_PNL',
  'SHIPPING_ADVICE',
  'TRANSPORT_REQUEST',
];

const SEA_FCL_EXPORT_DOCUMENTS: DocumentType[] = [
  'HBL',
  'HBL_EXPRESS_RELEASE',
  'MBL',
  'FIATA_BL',
  'RIDER_BL',
  'SWITCH_BL',
  'PROXY_BL',
  'BACK_TO_BACK_BL',
  'SURRENDER_NOTICE',
  'SHIPPING_INSTRUCTION',
  'STUFFING_REPORT',
  'SAILING_CONFIRMATION',
  'TRANSHIPMENT_CONFIRMATION',
  'CARGO_MANIFEST',
  'FREIGHT_MANIFEST',
  'JOB_CARD',
  'JOB_PNL',
  'PROFORMA_INVOICE',
  'PRE_ALERT',
  'BOOKING_CONFIRMATION',
];

const SEA_FCL_IMPORT_DOCUMENTS: DocumentType[] = [
  'PRE_CAN',
  'CAN',
  'EXCHANGE_LETTER',
  'UNDERTAKE_LETTER',
  'DELIVERY_ORDER',
  'TRANSPORT_REQUEST',
  'PROOF_OF_DELIVERY',
  'SHIPPING_ADVICE',
  'CARGO_MANIFEST',
  'FREIGHT_MANIFEST',
  'PROFORMA_INVOICE',
  'JOB_CARD',
  'ARRIVAL_NOTICE',
];

const SEA_LCL_EXPORT_DOCUMENTS: DocumentType[] = [
  'HBL',
  'MBL',
  'SHIPPING_INSTRUCTION',
  'STUFFING_REPORT',
  'CARGO_MANIFEST',
  'FREIGHT_MANIFEST',
  'PACKING_LIST',
  'PRE_ALERT',
  'BOOKING_CONFIRMATION',
  'JOB_CARD',
  'JOB_PNL',
  'PROFORMA_INVOICE',
  'FREIGHT_CERTIFICATE',
  'SAILING_CONFIRMATION',
];

const SEA_LCL_IMPORT_DOCUMENTS: DocumentType[] = [
  'PRE_CAN',
  'CAN',
  'EXCHANGE_LETTER',
  'UNDERTAKE_LETTER',
  'DELIVERY_ORDER',
  'TRANSPORT_REQUEST',
  'PROOF_OF_DELIVERY',
  'SHIPPING_ADVICE',
  'CARGO_MANIFEST',
  'ARRIVAL_NOTICE',
  'JOB_CARD',
];

const LAND_DOCUMENTS: DocumentType[] = [
  'JOB_CARD',
  'JOB_PNL',
  'TRANSPORT_REQUEST',
  'DELIVERY_ORDER',
  'PROOF_OF_DELIVERY',
  'CARGO_MANIFEST',
  'PROFORMA_INVOICE',
  'CUSTOMS_TRANSIT',
  'CROSS_BORDER_DECLARATION',
];

const COURIER_DOCUMENTS: DocumentType[] = [
  'JOB_CARD',
  'BOOKING_CONFIRMATION',
  'BARCODE_LABEL',
  'DELIVERY_NOTE',
  'PROFORMA_INVOICE',
  'PROOF_OF_DELIVERY',
  'CUSTOMS_ENTRY',
  'COURIER_REPORT',
];

const NVOCC_DOCUMENTS: DocumentType[] = [
  'HBL',
  'HBL_EXPRESS_RELEASE',
  'MBL',
  'SURRENDER_NOTICE',
  'PRE_CAN',
  'CAN',
  'DELIVERY_ORDER',
  'PRE_ALERT',
  'BOOKING_CONFIRMATION',
  'NVOCC_LOAD_LIST',
  'STUFFING_REPORT',
  'CARGO_MANIFEST',
  'JOB_CARD',
  'JOB_PNL',
  'PROFORMA_INVOICE',
];

const ALLOWLIST: Partial<Record<JobType, DocumentType[]>> = {
  AIR_EXPORT: AIR_EXPORT_DOCUMENTS,
  AIR_IMPORT: AIR_IMPORT_DOCUMENTS,
  SEA_FCL_EXPORT: SEA_FCL_EXPORT_DOCUMENTS,
  SEA_FCL_IMPORT: SEA_FCL_IMPORT_DOCUMENTS,
  SEA_LCL_EXPORT: SEA_LCL_EXPORT_DOCUMENTS,
  SEA_LCL_IMPORT: SEA_LCL_IMPORT_DOCUMENTS,
  LAND: LAND_DOCUMENTS,
  COURIER: COURIER_DOCUMENTS,
  NVOCC_EXPORT: NVOCC_DOCUMENTS,
  NVOCC_IMPORT: NVOCC_DOCUMENTS,
};

export function isNvoccDocumentType(documentType: DocumentType): boolean {
  return NVOCC_DOCUMENTS.includes(documentType);
}

export function assertDocumentAllowedForJobType(jobType: JobType, documentType: DocumentType): void {
  const allowed = ALLOWLIST[jobType];
  if (!allowed) {
    throw new BadRequestException(`Document generation is not configured for job type ${jobType}.`);
  }
  if (!allowed.includes(documentType)) {
    throw new BadRequestException(
      `Document type ${documentType} is not allowed for ${jobType} jobs.`,
    );
  }
}

export function isSeaLclDocumentType(documentType: DocumentType): boolean {
  return [
    'HBL',
    'MBL',
    'SHIPPING_INSTRUCTION',
    'STUFFING_REPORT',
    'CARGO_MANIFEST',
    'FREIGHT_MANIFEST',
    'PACKING_LIST',
    'PRE_ALERT',
    'BOOKING_CONFIRMATION',
    'SAILING_CONFIRMATION',
    'PRE_CAN',
    'CAN',
    'EXCHANGE_LETTER',
    'UNDERTAKE_LETTER',
    'DELIVERY_ORDER',
    'TRANSPORT_REQUEST',
    'PROOF_OF_DELIVERY',
    'SHIPPING_ADVICE',
    'ARRIVAL_NOTICE',
  ].includes(documentType);
}

export function isSeaFclDocumentType(documentType: DocumentType): boolean {
  return [
    'HBL',
    'HBL_EXPRESS_RELEASE',
    'MBL',
    'FIATA_BL',
    'RIDER_BL',
    'SWITCH_BL',
    'PROXY_BL',
    'BACK_TO_BACK_BL',
    'SURRENDER_NOTICE',
    'SHIPPING_INSTRUCTION',
    'STUFFING_REPORT',
    'SAILING_CONFIRMATION',
    'TRANSHIPMENT_CONFIRMATION',
    'PRE_CAN',
    'CAN',
    'EXCHANGE_LETTER',
    'UNDERTAKE_LETTER',
    'DELIVERY_ORDER',
    'TRANSPORT_REQUEST',
    'PROOF_OF_DELIVERY',
    'SHIPPING_ADVICE',
    'ARRIVAL_NOTICE',
  ].includes(documentType);
}
