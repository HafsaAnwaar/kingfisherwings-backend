import { Injectable, NotFoundException } from '@nestjs/common';
import { Tenant } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateOrganizationProfileDto } from './dto/update-organization-profile.dto';
import { CountryLocaleService } from '../../common/locale/country-locale.service';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly locale: CountryLocaleService,
  ) {}

  async getProfile(tenantId: string): Promise<Omit<Tenant, 'password_hash'>> {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id: tenantId, deleted_at: null },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found.');
    }

    const { password_hash, ...safe } = tenant;
    return safe;
  }

  async updateProfile(
    tenantId: string,
    dto: UpdateOrganizationProfileDto,
  ): Promise<Omit<Tenant, 'password_hash'>> {
    const existing = await this.prisma.tenant.findFirst({
      where: { id: tenantId, deleted_at: null },
    });

    if (!existing) {
      throw new NotFoundException('Tenant not found.');
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
}
