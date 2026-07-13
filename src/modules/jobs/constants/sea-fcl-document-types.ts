import { DocumentType } from '@prisma/client';

/** All Sea FCL Export document types introduced/covered in Week 8 (Ch.10 / Ch.16). */
export const SEA_FCL_DOCUMENT_TYPES: DocumentType[] = [
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
  'VGM',
];

export function isSeaFclDocumentType(documentType: DocumentType): boolean {
  return SEA_FCL_DOCUMENT_TYPES.includes(documentType);
}
