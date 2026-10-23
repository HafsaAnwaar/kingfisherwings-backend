import { PartyVerificationDocKind } from "@prisma/client";

export const REQUIRED_VERIFICATION_DOC_KINDS: PartyVerificationDocKind[] = [
  PartyVerificationDocKind.VAT_CERTIFICATE,
  PartyVerificationDocKind.BUSINESS_LICENSE,
];

export const VERIFICATION_DOC_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const VERIFICATION_DOC_MAX_BYTES = 10 * 1024 * 1024;
