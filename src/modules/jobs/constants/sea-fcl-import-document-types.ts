import { DocumentType } from "@prisma/client";

/** Sea FCL Import document types (Week 9 / Ch.11). */
export const SEA_FCL_IMPORT_DOCUMENT_TYPES: DocumentType[] = [
  "PRE_CAN",
  "CAN",
  "EXCHANGE_LETTER",
  "UNDERTAKE_LETTER",
  "DELIVERY_ORDER",
  "TRANSPORT_REQUEST",
  "PROOF_OF_DELIVERY",
  "SHIPPING_ADVICE",
  "CARGO_MANIFEST",
  "FREIGHT_MANIFEST",
  "PROFORMA_INVOICE",
  "JOB_CARD",
  "ARRIVAL_NOTICE",
];
