import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../shared/redis/redis.service';

export type CachedStaffSession = {
  userId: string;
  tenantId: string;
  role: string;
  twoFactorEnabled: boolean;
};

export type CachedSuperAdminSession = {
  superAdminId: string;
  twoFactorEnabled: boolean;
};

@Injectable()
export class SessionCacheService {
  private readonly ttl: number;

  constructor(
    private readonly redis: RedisService,
    config: ConfigService,
  ) {
    this.ttl = config.get<number>('redis.ttl.session') ?? 86400;
  }

  private staffKey(jti: string) {
    return `session:staff:${jti}`;
  }

  private superAdminKey(jti: string) {
    return `session:sa:${jti}`;
  }

  async getStaffSession(jti: string): Promise<CachedStaffSession | null> {
    const raw = await this.redis.get(this.staffKey(jti));
    if (!raw) return null;
    try {
      return JSON.parse(raw) as CachedStaffSession;
    } catch {
      return null;
    }
  }

  async setStaffSession(jti: string, data: CachedStaffSession): Promise<void> {
    await this.redis.set(this.staffKey(jti), JSON.stringify(data), this.ttl);
  }

  async invalidateStaffSession(jti: string): Promise<void> {
    await this.redis.del(this.staffKey(jti));
  }

  async getSuperAdminSession(jti: string): Promise<CachedSuperAdminSession | null> {
    const raw = await this.redis.get(this.superAdminKey(jti));
    if (!raw) return null;
    try {
      return JSON.parse(raw) as CachedSuperAdminSession;
    } catch {
      return null;
    }
  }

  async setSuperAdminSession(jti: string, data: CachedSuperAdminSession): Promise<void> {
    await this.redis.set(this.superAdminKey(jti), JSON.stringify(data), this.ttl);
  }

  async invalidateSuperAdminSession(jti: string): Promise<void> {
    await this.redis.del(this.superAdminKey(jti));
  }
}
