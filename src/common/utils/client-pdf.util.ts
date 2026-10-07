import { BadRequestException } from "@nestjs/common";
import { memoryStorage } from "multer";
import { FileInterceptor } from "@nestjs/platform-express";

const MAX_PDF_BYTES = 15 * 1024 * 1024;

/** Shared multer interceptor for optional PDF uploads on quote/invoice routes. */
export function optionalPdfUploadInterceptor() {
  return FileInterceptor("file", {
    storage: memoryStorage(),
    limits: { fileSize: MAX_PDF_BYTES, files: 1 },
    fileFilter: (_req, file, cb) => {
      const ok =
        !file.mimetype ||
        file.mimetype === "application/pdf" ||
        file.mimetype === "application/octet-stream" ||
        (file.originalname ?? "").toLowerCase().endsWith(".pdf");
      if (!ok) {
        cb(
          new BadRequestException("Only PDF files are accepted (field name: file).") as never,
          false,
        );
        return;
      }
      cb(null, true);
    },
  });
}

/**
 * Resolve a client-supplied PDF from multipart `file` or JSON/form `pdf_base64`.
 * Returns null when neither is provided (server may generate its own).
 */
export function resolveClientPdfBuffer(input: {
  file?: Express.Multer.File;
  pdf_base64?: string | null;
}): Buffer | null {
  if (input.file?.buffer?.length) {
    if (input.file.buffer.length > MAX_PDF_BYTES) {
      throw new BadRequestException("PDF exceeds 15 MB limit.");
    }
    return input.file.buffer;
  }

  const raw = input.pdf_base64?.trim();
  if (!raw) return null;

  const b64 = raw.includes("base64,")
    ? raw.slice(raw.indexOf("base64,") + 7)
    : raw;
  let buf: Buffer;
  try {
    buf = Buffer.from(b64, "base64");
  } catch {
    throw new BadRequestException("pdf_base64 is not valid base64.");
  }
  if (!buf.length) {
    throw new BadRequestException("pdf_base64 decoded to an empty file.");
  }
  if (buf.length > MAX_PDF_BYTES) {
    throw new BadRequestException("PDF exceeds 15 MB limit.");
  }
  // PDF magic header
  if (buf.subarray(0, 4).toString("utf8") !== "%PDF") {
    throw new BadRequestException("Uploaded content is not a valid PDF.");
  }
  return buf;
}
