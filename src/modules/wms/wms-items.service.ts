import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CurrentUser } from '../users/interfaces/current-user.interface';
import { CreateWmsItemDto, ItemQueryDto, UpdateWmsItemDto } from './dto/wms.dto';

@Injectable()
export class WmsItemsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: CurrentUser, dto: CreateWmsItemDto) {
    try {
      return await this.prisma.runWithTenant(user.tenantId, (tx) =>
        tx.wmsItem.create({
          data: {
            tenant_id: user.tenantId,
            ...dto,
            code: dto.code.trim().toUpperCase(),
            name: dto.name.trim(),
            created_by: user.id,
            updated_by: user.id,
          },
        }),
      );
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('An item with this code already exists.');
      }
      throw error;
    }
  }

  async list(user: CurrentUser, query: ItemQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.WmsItemWhereInput = {
      tenant_id: user.tenantId,
      deleted_at: null,
      ...(query.is_active !== undefined ? { is_active: query.is_active } : {}),
      ...(query.search
        ? { OR: [{ code: { contains: query.search, mode: 'insensitive' } }, { name: { contains: query.search, mode: 'insensitive' } }] }
        : {}),
    };
    const [data, total] = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      Promise.all([
        tx.wmsItem.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { code: 'asc' } }),
        tx.wmsItem.count({ where }),
      ]),
    );
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } };
  }

  async get(user: CurrentUser, id: string) {
    return this.requireItem(user.tenantId, id);
  }

  async update(user: CurrentUser, id: string, dto: UpdateWmsItemDto) {
    await this.requireItem(user.tenantId, id);
    return this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.wmsItem.update({
        where: { id },
        data: {
          ...dto,
          ...(dto.code ? { code: dto.code.trim().toUpperCase() } : {}),
          ...(dto.name ? { name: dto.name.trim() } : {}),
          updated_by: user.id,
        },
      }),
    );
  }

  async remove(user: CurrentUser, id: string) {
    await this.requireItem(user.tenantId, id);
    return this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.wmsItem.update({ where: { id }, data: { deleted_at: new Date(), is_active: false, updated_by: user.id } }),
    );
  }

  private async requireItem(tenantId: string, id: string) {
    const item = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.wmsItem.findFirst({ where: { id, tenant_id: tenantId, deleted_at: null } }),
    );
    if (!item) throw new NotFoundException('WMS item not found.');
    return item;
  }
}
