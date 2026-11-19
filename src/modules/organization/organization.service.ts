import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Tenant } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { UpdateOrganizationProfileDto } from "./dto/update-organization-profile.dto";
import { CountryLocaleService } from "../../common/locale/country-locale.service";
import { StorageService } from "../../shared/storage/storage.service";

const LOGO_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/svg+xml",
  "image/gif",
]);

@Injectable()
export class OrganizationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly locale: CountryLocaleService,
    private readonly storage: StorageService,
  ) {}

  async getProfile(tenantId: string): Promise<Omit<Tenant, "password_hash">> {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id: tenantId, deleted_at: null },
    });

    if (!tenant) {
      throw new NotFoundException("Tenant not found.");
    }

    const { password_hash, ...safe } = tenant;
    const durable = this.storage.toDurableLogoUrl(tenantId, safe.logo_url);
    // Heal DB when a legacy presigned URL is still stored.
    if (
      durable &&
      safe.logo_url &&
      durable !== safe.logo_url &&
      this.storage.isPresignedObjectUrl(safe.logo_url)
    ) {
      await this.prisma.tenant.update({
        where: { id: tenantId },
        data: { logo_url: durable },
      });
    }
    return {
      ...safe,
      logo_url: durable ?? safe.logo_url,
    };
  }

  async updateProfile(
    tenantId: string,
    dto: UpdateOrganizationProfileDto,
  ): Promise<Omit<Tenant, "password_hash">> {
    const existing = await this.prisma.tenant.findFirst({
      where: { id: tenantId, deleted_at: null },
    });

    if (!existing) {
      throw new NotFoundException("Tenant not found.");
    }

    const data: UpdateOrganizationProfileDto = { ...dto };

    // Country is optional. Changing it only suggests currency/timezone when caller left them unset.
    // Passing null clears country without touching currency/timezone.
    if (data.country_code) {
      const defaults = this.locale.getLocaleDefaults(data.country_code);
      data.country_code = defaults.countryCode ?? data.country_code;
      if (data.base_currency === undefined && defaults.baseCurrency) {
        data.base_currency = defaults.baseCurrency;
      }
      if (data.timezone === undefined && defaults.timezone) {
        data.timezone = defaults.timezone;
      }
    }

    if (data.logo_url !== undefined && data.logo_url !== null) {
      const trimmed = String(data.logo_url).trim();
      if (this.storage.isPresignedObjectUrl(trimmed)) {
        throw new BadRequestException(
          "logo_url must be a durable URL (/files/... or public CDN), not a presigned R2/S3 link.",
        );
      }
      const durable = this.storage.toDurableLogoUrl(tenantId, trimmed);
      if (!durable) {
        throw new BadRequestException(
          "logo_url must be an absolute https URL or /files/{tenantId}/{filename}.",
        );
      }
      data.logo_url = durable;
    }

    const updated = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { ...data },
    });

    const { password_hash, ...safe } = updated;
    return {
      ...safe,
      logo_url:
        this.storage.toDurableLogoUrl(tenantId, safe.logo_url) ??
        safe.logo_url,
    };
  }

  async uploadLogo(
    tenantId: string,
    file?: Express.Multer.File,
  ): Promise<{ logo_url: string }> {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Upload a logo under the "file" field.');
    }
    const mime = (file.mimetype || "").toLowerCase();
    if (!LOGO_MIME.has(mime)) {
      throw new BadRequestException(
        "Logo must be an image (png, jpeg, webp, gif, or svg).",
      );
    }
    if (file.size > 2 * 1024 * 1024) {
      throw new BadRequestException("Logo file must be 2 MB or smaller.");
    }

    const existing = await this.prisma.tenant.findFirst({
      where: { id: tenantId, deleted_at: null },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException("Tenant not found.");
    }

    const stored = await this.storage.saveBuffer(
      tenantId,
      file.buffer,
      file.originalname || "logo.png",
      mime || "image/png",
    );

    // saveBuffer already returns durableFileUrl; normalize again for safety.
    const logoUrl =
      this.storage.toDurableLogoUrl(tenantId, stored.fileUrl) ??
      this.storage.durableFileUrl(stored.s3Key);

    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { logo_url: logoUrl },
    });

    return { logo_url: logoUrl };
  }

  /**
   * Current tenant logo bytes for PDF embed / sidebar (no R2 CORS).
   */
  async getLogoBytes(tenantId: string): Promise<{
    buffer: Buffer;
    mimeType: string;
    fileName: string;
  }> {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id: tenantId, deleted_at: null },
      select: { logo_url: true },
    });
    if (!tenant?.logo_url?.trim()) {
      throw new NotFoundException("Organization logo not set.");
    }

    const logoUrl = tenant.logo_url.trim();
    const s3Key = this.storage.deriveObjectKey(logoUrl, tenantId);
    const fileName = s3Key
      ? s3Key.split("/").pop() || "logo.png"
      : "logo.png";

    if (s3Key) {
      return this.storage.readByStoredFile(tenantId, {
        file_name: fileName,
        file_url: logoUrl,
        s3_key: s3Key,
        mime_type: this.guessLogoMime(fileName),
      });
    }

    throw new NotFoundException(
      "Organization logo file not found in storage. Re-upload the logo.",
    );
  }

  /** Data URI for Puppeteer PDFs (avoids remote fetch / CORS / expiry). */
  async resolveLogoDataUri(tenantId: string): Promise<string | null> {
    try {
      const { buffer, mimeType } = await this.getLogoBytes(tenantId);
      return `data:${mimeType};base64,${buffer.toString("base64")}`;
    } catch {
      return null;
    }
  }

  private guessLogoMime(fileName: string): string {
    const lower = fileName.toLowerCase();
    if (lower.endsWith(".png")) return "image/png";
    if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
    if (lower.endsWith(".webp")) return "image/webp";
    if (lower.endsWith(".gif")) return "image/gif";
    if (lower.endsWith(".svg")) return "image/svg+xml";
    return "image/png";
  }
}
