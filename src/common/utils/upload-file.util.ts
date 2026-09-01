import { BadRequestException } from "@nestjs/common";

const ALLOWED_UPLOAD_MIMES = new Set([
  "text/csv",
  "application/csv",
  "text/plain",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export function assertDocumentationUploadFile(file?: Express.Multer.File) {
  if (!file?.buffer?.length) {
    throw new BadRequestException("File is required.");
  }
  if (file.size > MAX_UPLOAD_BYTES || file.buffer.length > MAX_UPLOAD_BYTES) {
    throw new BadRequestException("Upload exceeds 5 MB limit.");
  }
  const mime = (file.mimetype || "").toLowerCase();
  const ext = (file.originalname || "").toLowerCase();
  const mimeOk =
    ALLOWED_UPLOAD_MIMES.has(mime) ||
    ext.endsWith(".csv") ||
    ext.endsWith(".xlsx") ||
    ext.endsWith(".xls");
  if (!mimeOk) {
    throw new BadRequestException(
      "Only CSV or Excel (.xlsx) uploads are allowed.",
    );
  }
}
