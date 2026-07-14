import { DocumentType } from '@prisma/client';

/** Sea FCL document types covered in Weeks 8–9 (export + import). */
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
  'PRE_CAN',
  'CAN',
  'EXCHANGE_LETTER',
  'UNDERTAKE_LETTER',
  'DELIVERY_ORDER',
  'TRANSPORT_REQUEST',
  'PROOF_OF_DELIVERY',
  'SHIPPING_ADVICE',
  'ARRIVAL_NOTICE',
];

export function isSeaFclDocumentType(documentType: DocumentType): boolean {
  return SEA_FCL_DOCUMENT_TYPES.includes(documentType);
}
