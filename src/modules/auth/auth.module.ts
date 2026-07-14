// src/modules/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { PrismaModule } from '../../prisma/prisma.module';
import { UsersModule } from '../users';
import { EmailModule } from '../../shared/email/email.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    PrismaModule,
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
    JwtStrategy,

    // Registers JwtAuthGuard globally — every route requires auth
    // unless marked with @Public(). Health and the tenant-creation
    // endpoint are explicitly marked @Public() for that reason.
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],

  exports: [AuthService],
})
export class AuthModule {}
