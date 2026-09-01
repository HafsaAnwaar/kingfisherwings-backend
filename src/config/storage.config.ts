import { registerAs } from "@nestjs/config";
import * as path from "path";

export default registerAs("storage", () => ({
  root:
    process.env.STORAGE_PATH ?? path.join(process.cwd(), "storage", "uploads"),
  publicBaseUrl: process.env.STORAGE_PUBLIC_BASE_URL ?? "/files",
  useS3: process.env.STORAGE_USE_S3 === "true",
  s3Bucket: process.env.AWS_S3_BUCKET,
  s3Region: process.env.AWS_REGION ?? "me-south-1",
}));
