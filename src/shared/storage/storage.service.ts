import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { S3 } from 'aws-sdk';

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
  private s3?: S3;
  private s3Bucket?: string;

  constructor(private readonly config: ConfigService) {
    this.root = this.config.get<string>('storage.root')!;
    this.publicBaseUrl = this.config.get<string>('storage.publicBaseUrl')!;
    this.useS3 = this.config.get<boolean>('storage.useS3') ?? false;
    this.s3Bucket = this.config.get<string>('storage.s3Bucket');

    if (this.useS3 && this.s3Bucket) {
      this.s3 = new S3({
        region: this.config.get<string>('storage.s3Region'),
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      });
    }
  }

  async saveBuffer(
    tenantId: string,
    buffer: Buffer,
    filename: string,
    mimeType = 'application/pdf',
  ): Promise<StoredFile> {
    const s3Key = `${tenantId}/${Date.now()}-${filename}`;

    if (this.useS3 && this.s3 && this.s3Bucket) {
      await this.s3
        .putObject({
          Bucket: this.s3Bucket,
          Key: s3Key,
          Body: buffer,
          ContentType: mimeType,
        })
        .promise();

      const fileUrl = `https://${this.s3Bucket}.s3.amazonaws.com/${s3Key}`;
      return { fileUrl, s3Key, fileSize: buffer.length, mimeType };
    }

    const dir = path.join(this.root, tenantId);
    await fs.mkdir(dir, { recursive: true });
    const filePath = path.join(dir, filename);
    await fs.writeFile(filePath, buffer);

    const fileUrl = `${this.publicBaseUrl}/${tenantId}/${encodeURIComponent(filename)}`;
    this.logger.log(`Saved file locally: ${filePath}`);

    return { fileUrl, s3Key, fileSize: buffer.length, mimeType };
  }

  async readBuffer(tenantId: string, filename: string): Promise<Buffer> {
    const filePath = path.join(this.root, tenantId, filename);
    return fs.readFile(filePath);
  }

  resolveLocalPath(tenantId: string, filename: string): string {
    // Reject path traversal / absolute paths — only a bare file name is allowed.
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