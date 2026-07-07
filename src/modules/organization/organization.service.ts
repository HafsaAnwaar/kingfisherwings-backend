import { Injectable, NotFoundException } from '@nestjs/common';
import { Tenant } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateOrganizationProfileDto } from './dto/update-organization-profile.dto';

@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

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

    const updated = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { ...dto },
    });

    const { password_hash, ...safe } = updated;
    return safe;
  }
}
