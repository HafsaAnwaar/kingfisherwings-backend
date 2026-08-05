import { DocumentType, PortalDocumentType } from '@prisma/client';

/** Internal job documents that must never appear in the customer portal. */
export const PORTAL_BLOCKED_DOCUMENT_TYPES: DocumentType[] = [
  'JOB_PNL',
  'JOB_COSTING',
  'JOB_CARD',
  'FREIGHT_MANIFEST',
];

export function toPortalDocumentType(documentType: DocumentType): PortalDocumentType {
  switch (documentType) {
    case 'HAWB':
    case 'E_AWB':
      return 'HAWB';
    case 'MAWB':
      return 'MAWB';
    case 'HBL':
    case 'HBL_EXPRESS_RELEASE':
    case 'FIATA_BL':
    case 'RIDER_BL':
    case 'SWITCH_BL':
    case 'PROXY_BL':
    case 'BACK_TO_BACK_BL':
      return 'HBL';
    case 'MBL':
      return 'MBL';
    case 'PROFORMA_INVOICE':
    case 'COMMERCIAL_INVOICE':
      return 'INVOICE';
    case 'CAN':
    case 'PRE_CAN':
      return 'CAN';
    case 'DELIVERY_ORDER':
      return 'DO';
    case 'PROOF_OF_DELIVERY':
      return 'POD';
    case 'PRE_ALERT':
      return 'PRE_ALERT';
    default:
      return 'OTHER';
  }
}

export function isPortalVisibleDocumentType(documentType: DocumentType): boolean {
  return !PORTAL_BLOCKED_DOCUMENT_TYPES.includes(documentType);
}
