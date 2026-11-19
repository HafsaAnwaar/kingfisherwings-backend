import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as fs from "fs/promises";
import * as path from "path";
import {
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  resolveStorageSettings,
  StorageSettings,
} from "../../config/storage.config";

export interface StoredFile {
  fileUrl: string;
  s3Key: string;
  fileSize: number;
  mimeType: string;
}

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly settings: StorageSettings;
  private s3?: S3Client;

  constructor(private readonly config: ConfigService) {
    this.settings = resolveStorageSettings();

    if (this.settings.useObjectStorage) {
      this.s3 = new S3Client({
        region: this.settings.region,
        endpoint: this.settings.endpoint,
        forcePathStyle: this.settings.forcePathStyle,
        credentials: {
          accessKeyId: this.settings.accessKeyId!,
          secretAccessKey: this.settings.secretAccessKey!,
        },
      });
    }
  }

  /** True when uploads survive Render redeploys (R2 / S3 / Supabase). */
  isDurable(): boolean {
    return this.settings.useObjectStorage && !!this.s3 && !!this.settings.bucket;
  }

  getStatus() {
    return {
      provider: this.settings.provider,
      requested_provider: this.settings.requestedProvider,
      durable: this.isDurable(),
      bucket: this.settings.bucket ?? null,
      region: this.settings.region,
      endpoint: this.settings.endpoint ?? null,
      local_root: this.isDurable() ? null : this.settings.root,
      missing_env: this.settings.missingEnv,
      hint: this.isDurable()
        ? null
        : this.settings.missingEnv.length
          ? `Set missing env: ${this.settings.missingEnv.join(", ")} (see docs/STORAGE_SETUP.md)`
          : "Set STORAGE_PROVIDER=r2 and R2_* vars for durable storage on Render",
    };
  }

  async onModuleInit() {
    if (this.isDurable()) {
      this.logger.log(
        `Storage: durable provider=${this.settings.provider} bucket=${this.settings.bucket}` +
          (this.settings.endpoint ? ` endpoint=${this.settings.endpoint}` : ""),
      );
      try {
        await this.s3!.send(
          new HeadBucketCommand({ Bucket: this.settings.bucket! }),
        );
        this.logger.log(`Storage: bucket reachable (${this.settings.bucket})`);
      } catch (err) {
        this.logger.warn(
          `Storage: could not verify bucket ${this.settings.bucket}: ${
            err instanceof Error ? err.message : String(err)
          }. Uploads may fail until credentials/bucket are fixed.`,
        );
      }
      return;
    }

    if (
      this.settings.requestedProvider !== "local" &&
      this.settings.missingEnv.length
    ) {
      this.logger.warn(
        `Storage: requested ${this.settings.requestedProvider} but incomplete config ` +
          `(missing ${this.settings.missingEnv.join(", ")}). Falling back to local. ` +
          `See docs/STORAGE_SETUP.md.`,
      );
    }

    try {
      await fs.mkdir(this.settings.root, { recursive: true });
    } catch (err) {
      this.logger.error(
        `Could not create storage root ${this.settings.root}: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }

    const onRender = !!process.env.RENDER || !!process.env.RENDER_SERVICE_ID;
    if (onRender) {
      this.logger.warn(
        "Storage: LOCAL on Render — files vanish on redeploy. Set STORAGE_PROVIDER=r2 (recommended) or s3/supabase. See docs/STORAGE_SETUP.md.",
      );
    } else {
      this.logger.log(
        `Storage: local root=${this.settings.root} (dev OK; use R2/S3 in production)`,
      );
    }
  }

  /**
   * Non-expiring URL for persistence (org logos, etc.).
   * Prefer public CDN base when configured; otherwise `/files/{tenantId}/{filename}`.
   * Never returns a presigned X-Amz-* URL.
   */
  durableFileUrl(s3Key: string): string {
    const key = s3Key.replace(/^\/+/, "");
    if (this.settings.publicBase) {
      return `${this.settings.publicBase.replace(/\/$/, "")}/${key}`;
    }
    const slash = key.indexOf("/");
    const tenantId = slash >= 0 ? key.slice(0, slash) : key;
    const filename = slash >= 0 ? key.slice(slash + 1) : key;
    const base = (this.settings.publicBaseUrl || "/files").replace(/\/$/, "");
    return `${base}/${tenantId}/${encodeURIComponent(filename)}`;
  }

  /** True when a stored logo_url looks like an expiring S3/R2 signed link. */
  isPresignedObjectUrl(url: string | null | undefined): boolean {
    if (!url?.trim()) return false;
    const u = url.trim();
    return (
      /[?&]X-Amz-Algorithm=/i.test(u) ||
      /[?&]X-Amz-Signature=/i.test(u) ||
      /[?&]X-Amz-Credential=/i.test(u)
    );
  }

  /**
   * Rewrite a stored logo_url to a durable form (CDN or /files/…).
   * Extracts object key from legacy presigned R2/S3 URLs when possible.
   */
  toDurableLogoUrl(
    tenantId: string,
    logoUrl: string | null | undefined,
  ): string | null {
    if (!logoUrl?.trim()) return null;
    const raw = logoUrl.trim();

    if (raw.startsWith("/files/")) {
      return raw.split("?")[0];
    }

    if (this.settings.publicBase) {
      const base = this.settings.publicBase.replace(/\/$/, "");
      if (raw.startsWith(base + "/") && !this.isPresignedObjectUrl(raw)) {
        return raw.split("?")[0];
      }
    }

    const key = this.deriveObjectKey(raw, tenantId);
    if (key) return this.durableFileUrl(key);

    // Absolute non-presigned https (external CDN / website) — keep as-is.
    if (
      /^https?:\/\//i.test(raw) &&
      !this.isPresignedObjectUrl(raw)
    ) {
      return raw;
    }

    return null;
  }

  /** Recover object key from /files path, CDN URL, or expired presigned URL. */
  deriveObjectKey(
    fileUrl: string | null | undefined,
    tenantId: string,
  ): string | null {
    if (!fileUrl?.trim()) return null;
    const raw = fileUrl.trim();

    const filesMatch = raw.match(/^\/files\/([^/]+)\/(.+?)(?:\?|$)/i);
    if (filesMatch) {
      const tid = decodeURIComponent(filesMatch[1]);
      const name = decodeURIComponent(filesMatch[2]);
      if (tid === tenantId) return `${tid}/${name}`;
    }

    try {
      const u = new URL(raw);
      const keyParam = u.searchParams.get("Key") ?? u.searchParams.get("key");
      if (keyParam?.includes(tenantId)) {
        return decodeURIComponent(keyParam);
      }
      const pathPart = decodeURIComponent(u.pathname.replace(/^\/+/, ""));
      // Strip bucket name prefix when path-style: bucket/tenantId/file
      const idx = pathPart.indexOf(`${tenantId}/`);
      if (idx >= 0) return pathPart.slice(idx);
    } catch {
      /* relative / opaque */
    }
    return null;
  }

  /** Resolve a public/presigned URL for an existing storage key (backfill mirrors). */
  async resolveUrlForKey(s3Key: string): Promise<string> {
    return this.durableFileUrl(s3Key);
  }

  async saveBuffer(
    tenantId: string,
    buffer: Buffer,
    filename: string,
    mimeType = "application/pdf",
  ): Promise<StoredFile> {
    const safeName = path.basename(String(filename).replace(/\\/g, "/"));
    if (
      !safeName ||
      safeName === "." ||
      safeName === ".." ||
      safeName.includes("\0")
    ) {
      throw new Error("Invalid filename.");
    }
    const uniqueName = `${Date.now()}-${safeName}`;
    const s3Key = `${tenantId}/${uniqueName}`;

    if (this.isDurable()) {
      try {
        await this.s3!.send(
          new PutObjectCommand({
            Bucket: this.settings.bucket!,
            Key: s3Key,
            Body: buffer,
            ContentType: mimeType,
            ...(this.settings.serverSideEncryption
              ? { ServerSideEncryption: "AES256" as const }
              : {}),
          }),
        );
      } catch (err) {
        this.logger.error(
          `Object storage put failed: ${err instanceof Error ? err.message : String(err)}`,
        );
        throw new ServiceUnavailableException(
          "Failed to store file in object storage. Check STORAGE_/R2_/AWS_ credentials and bucket.",
        );
      }

      // Always durable — never persist a short-lived presigned URL.
      return {
        fileUrl: this.durableFileUrl(s3Key),
        s3Key,
        fileSize: buffer.length,
        mimeType,
      };
    }

    const dir = path.join(this.settings.root, tenantId);
    await fs.mkdir(dir, { recursive: true });
    const filePath = this.resolveLocalPath(tenantId, uniqueName);
    await fs.writeFile(filePath, buffer);

    const fileUrl = this.durableFileUrl(s3Key);
    this.logger.log(`Saved file locally: ${filePath}`);

    return { fileUrl, s3Key, fileSize: buffer.length, mimeType };
  }

  async presignedGetUrl(s3Key: string): Promise<string> {
    if (!this.s3 || !this.settings.bucket) {
      throw new Error("Object storage is not configured.");
    }
    return getSignedUrl(
      this.s3,
      new GetObjectCommand({
        Bucket: this.settings.bucket,
        Key: s3Key,
      }),
      {
        expiresIn: Number.isFinite(this.settings.presignedUrlExpires)
          ? this.settings.presignedUrlExpires
          : 3600,
      },
    );
  }

  async readBuffer(tenantId: string, filename: string): Promise<Buffer> {
    const filePath = this.resolveLocalPath(tenantId, filename);
    try {
      return await fs.readFile(filePath);
    } catch (err) {
      const code = (err as NodeJS.ErrnoException)?.code;
      if (code === "ENOENT") {
        throw new NotFoundException(
          `File not found on disk (${filename}). Enable durable storage (R2/S3) or regenerate.`,
        );
      }
      throw err;
    }
  }

  async readByStoredFile(
    tenantId: string,
    file: {
      file_name: string;
      file_url: string;
      s3_key?: string | null;
      mime_type?: string | null;
    },
  ): Promise<{ buffer: Buffer; mimeType: string; fileName: string }> {
    if (file.s3_key && this.isDurable()) {
      try {
        const result = await this.s3!.send(
          new GetObjectCommand({
            Bucket: this.settings.bucket!,
            Key: file.s3_key,
          }),
        );
        const body = result.Body;
        const buffer =
          body instanceof Buffer
            ? body
            : Buffer.from(
                await (
                  body as { transformToByteArray(): Promise<Uint8Array> }
                ).transformToByteArray(),
              );
        return {
          buffer,
          mimeType: file.mime_type ?? "application/pdf",
          fileName: file.file_name,
        };
      } catch (err) {
        this.logger.warn(
          `Object storage read failed for ${file.s3_key}: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
        throw new NotFoundException(
          "Stored file not found in object storage. Regenerate the document.",
        );
      }
    }

    // If we have an s3_key but durable storage isn't on, still try local candidates
    const candidates = [
      file.file_url
        ? decodeURIComponent(file.file_url.split("/").pop() ?? "")
        : "",
      file.s3_key ? path.basename(file.s3_key) : "",
      file.file_name ? path.basename(file.file_name) : "",
    ].filter((n) => n && n !== "." && n !== "..");

    let lastErr: unknown;
    for (const name of [...new Set(candidates)]) {
      try {
        const buffer = await this.readBuffer(tenantId, name);
        return {
          buffer,
          mimeType: file.mime_type ?? "application/pdf",
          fileName: file.file_name || name,
        };
      } catch (err) {
        lastErr = err;
        if (err instanceof NotFoundException) continue;
        throw err;
      }
    }

    if (lastErr instanceof NotFoundException) throw lastErr;
    throw new NotFoundException(
      "Stored file not found. Regenerate the document or configure R2/S3 durable storage.",
    );
  }

  resolveLocalPath(tenantId: string, filename: string): string {
    const safeName = path.basename(filename.replace(/\\/g, "/"));
    if (
      !safeName ||
      safeName === "." ||
      safeName === ".." ||
      safeName.includes("\0") ||
      filename.includes("..")
    ) {
      throw new Error("Invalid filename.");
    }

    const rootResolved = path.resolve(this.settings.root);
    const tenantDir = path.resolve(rootResolved, tenantId);
    const filePath = path.resolve(tenantDir, safeName);

    if (!filePath.startsWith(tenantDir + path.sep) && filePath !== tenantDir) {
      throw new Error("Invalid filename.");
    }

    return filePath;
  }
}
