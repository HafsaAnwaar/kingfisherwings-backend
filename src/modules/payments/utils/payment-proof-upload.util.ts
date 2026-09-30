import { BadRequestException } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import {
  PAYMENT_PROOF_MAX_BYTES,
  PAYMENT_PROOF_MIME_TYPES,
} from "../constants/online-payment.constants";

/**
 * Multipart interceptor for payment proof uploads: memory storage (the
 * buffer goes straight to StorageService / S3), 8 MB cap, one file, and a
 * PDF/JPEG/PNG/WebP allow-list checked before anything is stored.
 */
export function paymentProofUploadInterceptor() {
  return FileInterceptor("file", {
    storage: memoryStorage(),
    limits: { fileSize: PAYMENT_PROOF_MAX_BYTES, files: 1 },
    fileFilter: (_req, file, callback) => {
      if (!PAYMENT_PROOF_MIME_TYPES.has(file.mimetype)) {
        return callback(
          new BadRequestException(
            "Only PDF, JPEG, PNG, or WebP payment proof files are accepted.",
          ),
          false,
        );
      }
      callback(null, true);
    },
  });
}
