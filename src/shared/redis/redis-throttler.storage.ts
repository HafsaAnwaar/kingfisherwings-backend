import { Injectable } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';
import { RedisService } from './redis.service';

@Injectable()
export class RedisThrottlerStorage implements ThrottlerStorage {
  constructor(private readonly redis: RedisService) {}

  async increment(key: string, ttl: number) {
    const record = await this.redis.incr(`throttle:${key}`, ttl);
    return { totalHits: record.totalHits, timeToExpire: record.timeToExpire };
  }
}
