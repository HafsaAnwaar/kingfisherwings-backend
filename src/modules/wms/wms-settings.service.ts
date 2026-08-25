import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CurrentUser } from '../users/interfaces/current-user.interface';
import { UpsertWmsSettingsDto } from './dto/wms.dto';

@Injectable()
export class WmsSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  getOrCreate(user: CurrentUser) {
    return this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.wmsSettings.upsert({
        where: { tenant_id: user.tenantId },
        create: { tenant_id: user.tenantId, default_currency: user.baseCurrency ?? 'AED' },
        update: {},
      }),
    );
  }

  upsert(user: CurrentUser, dto: UpsertWmsSettingsDto) {
    return this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.wmsSettings.upsert({
        where: { tenant_id: user.tenantId },
        create: { tenant_id: user.tenantId, ...dto, default_currency: dto.default_currency.toUpperCase(), updated_by: user.id },
        update: { ...dto, default_currency: dto.default_currency.toUpperCase(), updated_by: user.id },
      }),
    );
  }
}
