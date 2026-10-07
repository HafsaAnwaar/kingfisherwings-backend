/**
 * Offline check: prints whether durable R2/S3 storage would activate
 * with the current process.env (loads .env via dotenv).
 *
 * Usage: npx ts-node -r dotenv/config scripts/check-storage.ts
 */
import { resolveStorageSettings } from "../src/config/storage.config";

const s = resolveStorageSettings();

const report = {
  provider: s.provider,
  requested_provider: s.requestedProvider,
  durable: s.useObjectStorage,
  bucket: s.bucket ?? null,
  endpoint: s.endpoint ?? null,
  region: s.region,
  missing_env: s.missingEnv,
  local_root: s.useObjectStorage ? null : s.root,
};

// eslint-disable-next-line no-console
console.log(JSON.stringify(report, null, 2));

if (!s.useObjectStorage) {
  // eslint-disable-next-line no-console
  console.error(
    "\nDurable storage is NOT active. For Render, set:\n" +
      "  STORAGE_PROVIDER=r2\n" +
      "  R2_ACCOUNT_ID=...\n" +
      "  R2_ACCESS_KEY_ID=...\n" +
      "  R2_SECRET_ACCESS_KEY=...\n" +
      "  R2_BUCKET=kingfisher-files\n" +
      "See docs/STORAGE_SETUP.md\n",
  );
  process.exitCode = 1;
} else {
  // eslint-disable-next-line no-console
  console.log("\nOK — durable object storage would be used at boot.\n");
}
