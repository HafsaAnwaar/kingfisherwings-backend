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
    return safe;
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

    const updated = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { ...data },
    });

    const { password_hash, ...safe } = updated;
    return safe;
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

    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { logo_url: stored.fileUrl },
    });

    return { logo_url: stored.fileUrl };
  }
}
