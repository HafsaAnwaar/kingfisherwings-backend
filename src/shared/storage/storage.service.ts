import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface StoredFile {
  fileUrl: string;
  s3Key: string;
  fileSize: number;
  mimeType: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly root: string;
  private readonly publicBaseUrl: string;
  private readonly useS3: boolean;
  private s3?: S3Client;
  private s3Bucket?: string;
  private readonly presignSeconds: number;

  constructor(private readonly config: ConfigService) {
    this.root = this.config.get<string>('storage.root')!;
    this.publicBaseUrl = this.config.get<string>('storage.publicBaseUrl')!;
    this.useS3 = this.config.get<boolean>('storage.useS3') ?? false;
    this.s3Bucket = this.config.get<string>('storage.s3Bucket');
    this.presignSeconds = this.config.get<number>('storage.presignedUrlExpires') ?? 3600;

    if (this.useS3 && this.s3Bucket) {
      this.s3 = new S3Client({
        region: this.config.get<string>('storage.s3Region'),
        credentials:
          process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
            ? {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
              }
            : undefined,
      });
    }
  }

  async saveBuffer(
    tenantId: string,
    buffer: Buffer,
    filename: string,
    mimeType = 'application/pdf',
  ): Promise<StoredFile> {
    const safeName = path.basename(String(filename).replace(/\\/g, '/'));
    if (!safeName || safeName === '.' || safeName === '..' || safeName.includes('\0')) {
      throw new Error('Invalid filename.');
    }
    const s3Key = `${tenantId}/${Date.now()}-${safeName}`;

    if (this.useS3 && this.s3 && this.s3Bucket) {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.s3Bucket,
          Key: s3Key,
          Body: buffer,
          ContentType: mimeType,
          ServerSideEncryption: 'AES256',
        }),
      );

      const fileUrl = await this.presignedGetUrl(s3Key);
      return { fileUrl, s3Key, fileSize: buffer.length, mimeType };
    }

    const dir = path.join(this.root, tenantId);
    await fs.mkdir(dir, { recursive: true });
    const filePath = this.resolveLocalPath(tenantId, safeName);
    await fs.writeFile(filePath, buffer);

    const fileUrl = `${this.publicBaseUrl}/${tenantId}/${encodeURIComponent(safeName)}`;
    this.logger.log(`Saved file locally: ${filePath}`);

    return { fileUrl, s3Key, fileSize: buffer.length, mimeType };
  }

  async presignedGetUrl(s3Key: string): Promise<string> {
    if (!this.s3 || !this.s3Bucket) {
      throw new Error('S3 is not configured.');
    }
    return getSignedUrl(
      this.s3,
      new GetObjectCommand({ Bucket: this.s3Bucket, Key: s3Key }),
      { expiresIn: this.presignSeconds },
    );
  }

  async readBuffer(tenantId: string, filename: string): Promise<Buffer> {
    const filePath = this.resolveLocalPath(tenantId, filename);
    return fs.readFile(filePath);
  }

  async readByStoredFile(
    tenantId: string,
    file: { file_name: string; file_url: string; s3_key?: string | null; mime_type?: string | null },
  ): Promise<{ buffer: Buffer; mimeType: string; fileName: string }> {
    if (file.s3_key && this.useS3 && this.s3 && this.s3Bucket) {
      const result = await this.s3.send(
        new GetObjectCommand({ Bucket: this.s3Bucket, Key: file.s3_key }),
      );
      const body = result.Body;
      const buffer =
        body instanceof Buffer
          ? body
          : Buffer.from(await (body as { transformToByteArray(): Promise<Uint8Array> }).transformToByteArray());
      return {
        buffer,
        mimeType: file.mime_type ?? 'application/pdf',
        fileName: file.file_name,
      };
    }

    const fromUrl = file.file_url.split('/').pop();
    const filename = decodeURIComponent(fromUrl ?? file.file_name);
    const buffer = await this.readBuffer(tenantId, filename);
    return {
      buffer,
      mimeType: file.mime_type ?? 'application/pdf',
      fileName: file.file_name,
    };
  }

  resolveLocalPath(tenantId: string, filename: string): string {
    const safeName = path.basename(filename.replace(/\\/g, '/'));
    if (
      !safeName ||
      safeName === '.' ||
      safeName === '..' ||
      safeName.includes('\0') ||
      filename.includes('..')
    ) {
      throw new Error('Invalid filename.');
    }

    const rootResolved = path.resolve(this.root);
    const tenantDir = path.resolve(rootResolved, tenantId);
    const filePath = path.resolve(tenantDir, safeName);

    if (!filePath.startsWith(tenantDir + path.sep) && filePath !== tenantDir) {
      throw new Error('Invalid filename.');
    }

    return filePath;
  }
}
