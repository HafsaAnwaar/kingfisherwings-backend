import { registerAs } from "@nestjs/config";
import * as path from "path";

export type StorageProvider = "local" | "s3" | "r2" | "supabase";

function trim(key: string): string | undefined {
  const v = process.env[key]?.trim();
  return v ? v : undefined;
}

function truthy(raw: string | undefined): boolean {
  if (!raw) return false;
  return ["1", "true", "yes", "on"].includes(raw.toLowerCase());
}

/**
 * Resolve durable object-storage settings.
 * Prefer Cloudflare R2 on Render (S3 API, cheap, no egress fees).
 * Also supports AWS S3 and Supabase Storage (S3-compatible).
 */
export function resolveStorageSettings() {
  const forced = (trim("STORAGE_PROVIDER") ?? "auto").toLowerCase();

  const accessKeyId =
    trim("STORAGE_ACCESS_KEY_ID") ??
    trim("AWS_ACCESS_KEY_ID") ??
    trim("R2_ACCESS_KEY_ID");
  const secretAccessKey =
    trim("STORAGE_SECRET_ACCESS_KEY") ??
    trim("AWS_SECRET_ACCESS_KEY") ??
    trim("R2_SECRET_ACCESS_KEY");
  const bucket =
    trim("STORAGE_BUCKET") ??
    trim("AWS_S3_BUCKET") ??
    trim("R2_BUCKET") ??
    trim("SUPABASE_STORAGE_BUCKET");

  const r2AccountId = trim("R2_ACCOUNT_ID");
  const explicitEndpoint =
    trim("STORAGE_S3_ENDPOINT") ??
    trim("AWS_S3_ENDPOINT") ??
    trim("SUPABASE_STORAGE_ENDPOINT");

  let requested: StorageProvider | "auto" = "auto";
  if (
    forced === "local" ||
    forced === "s3" ||
    forced === "r2" ||
    forced === "supabase"
  ) {
    requested = forced;
  } else if (r2AccountId && accessKeyId && secretAccessKey && bucket) {
    requested = "r2";
  } else if (
    explicitEndpoint?.includes("supabase") &&
    accessKeyId &&
    secretAccessKey &&
    bucket
  ) {
    requested = "supabase";
  } else if (
    (truthy(trim("STORAGE_USE_S3")) ||
      (accessKeyId && secretAccessKey && bucket)) &&
    accessKeyId &&
    secretAccessKey &&
    bucket
  ) {
    requested = "s3";
  } else {
    requested = "local";
  }

  const provider: StorageProvider =
    requested === "s3" ||
    requested === "r2" ||
    requested === "supabase" ||
    requested === "local"
      ? requested
      : "local";

  let endpoint: string | undefined = explicitEndpoint;
  let region =
    trim("STORAGE_REGION") ??
    trim("AWS_REGION") ??
    trim("R2_REGION") ??
    "auto";
  let forcePathStyle = truthy(trim("STORAGE_FORCE_PATH_STYLE"));

  if (provider === "r2") {
    if (!endpoint && r2AccountId) {
      endpoint = `https://${r2AccountId}.r2.cloudflarestorage.com`;
    }
    // R2 rejects AWS regional names; keep auto unless explicitly set to something else.
    if (!trim("R2_REGION") && !trim("STORAGE_REGION")) {
      region = "auto";
    }
    forcePathStyle = true;
  }

  if (provider === "supabase") {
    forcePathStyle = true;
    if (!region || region === "auto") region = "us-east-1";
  }

  const missingEnv: string[] = [];
  if (provider === "r2") {
    if (!r2AccountId && !endpoint) missingEnv.push("R2_ACCOUNT_ID");
    if (!accessKeyId) missingEnv.push("R2_ACCESS_KEY_ID");
    if (!secretAccessKey) missingEnv.push("R2_SECRET_ACCESS_KEY");
    if (!bucket) missingEnv.push("R2_BUCKET");
  } else if (provider === "s3" || provider === "supabase") {
    if (!accessKeyId) {
      missingEnv.push("STORAGE_ACCESS_KEY_ID|AWS_ACCESS_KEY_ID");
    }
    if (!secretAccessKey) {
      missingEnv.push("STORAGE_SECRET_ACCESS_KEY|AWS_SECRET_ACCESS_KEY");
    }
    if (!bucket) missingEnv.push("STORAGE_BUCKET|AWS_S3_BUCKET");
    if (provider === "supabase" && !endpoint) {
      missingEnv.push("STORAGE_S3_ENDPOINT");
    }
  }

  const useObjectStorage =
    provider !== "local" &&
    !!accessKeyId &&
    !!secretAccessKey &&
    !!bucket &&
    (provider !== "r2" || !!endpoint);

  // If user asked for r2/s3/supabase but creds incomplete, fall back to local
  const effectiveProvider: StorageProvider = useObjectStorage
    ? provider
    : "local";

  return {
    provider: effectiveProvider,
    requestedProvider: provider,
    missingEnv,
    root:
      trim("STORAGE_PATH") ?? path.join(process.cwd(), "storage", "uploads"),
    publicBaseUrl: trim("STORAGE_PUBLIC_BASE_URL") ?? "/files",
    useObjectStorage,
    /** @deprecated use useObjectStorage */
    useS3: useObjectStorage,
    bucket: bucket ?? undefined,
    region,
    endpoint,
    forcePathStyle,
    accessKeyId,
    secretAccessKey,
    /** R2 does not support AWS SSE-S3 the same way — omit encryption header. */
    serverSideEncryption: effectiveProvider === "s3",
    publicBase:
      trim("STORAGE_PUBLIC_BASE") ??
      trim("R2_PUBLIC_BASE_URL") ??
      trim("AWS_S3_PUBLIC_BASE_URL"),
    presignedUrlExpires: parseInt(
      trim("AWS_S3_PRESIGNED_URL_EXPIRES") ??
        trim("STORAGE_PRESIGNED_URL_EXPIRES") ??
        "3600",
      10,
    ),
  };
}

export type StorageSettings = ReturnType<typeof resolveStorageSettings>;

export default registerAs("storage", () => resolveStorageSettings());
