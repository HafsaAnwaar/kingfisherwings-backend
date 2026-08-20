// src/modules/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { PrismaModule } from '../../prisma/prisma.module';
import { RedisModule } from '../../shared/redis/redis.module';
import { UsersModule } from '../users';
import { EmailModule } from '../../shared/email/email.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthCronService } from './auth-cron.service';
import { SessionCacheService } from './session-cache.service';

import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TenantStaffGuard } from './guards/tenant-staff.guard';
import { MandatoryAdminTwoFactorGuard } from './guards/mandatory-admin-two-factor.guard';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    UsersModule,
    EmailModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m',
        },
      }),
    }),
  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    AuthCronService,
    SessionCacheService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: TenantStaffGuard,
    },
    {
      provide: APP_GUARD,
      useClass: MandatoryAdminTwoFactorGuard,
    },
  ],

  exports: [AuthService, SessionCacheService],
})
export class AuthModule {}
