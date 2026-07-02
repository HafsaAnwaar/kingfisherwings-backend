// src/modules/auth/auth.controller.ts

import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { AuthService } from './auth.service';

import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';

import { RequestWithUser } from './interfaces/request-with-user.interface';
import { LoginMeta } from './interfaces/login-meta.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  // =====================================================
  // LOGIN
  // =====================================================

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Log in with tenant slug, email, and password',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful.',
  })
  login(
    @Body()
    dto: LoginDto,

    @Req()
    req: Request,
  ) {
    return this.authService.login(dto, this.extractMeta(req));
  }

  // =====================================================
  // REFRESH TOKEN
  // =====================================================

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Exchange a refresh token for a new token pair',
  })
  refresh(
    @Body()
    dto: RefreshTokenDto,
  ) {
    return this.authService.refresh(dto);
  }

  // =====================================================
  // LOGOUT
  // =====================================================

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Revoke the current session',
  })
  logout(
    @CurrentUser()
    user: RequestWithUser['user'],
  ) {
    return this.authService.logout(user.id, user.jti);
  }

  // =====================================================
  // CURRENT USER
  // =====================================================

  @Get('me')
  @ApiOperation({
    summary: 'Get the authenticated user profile',
  })
  me(
    @CurrentUser('id')
    userId: string,
  ) {
    return this.authService.me(userId);
  }

  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Change the authenticated user password',
  })
  changePassword(
    @CurrentUser('id')
    userId: string,

    @Body()
    dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(userId, dto);
  }

  // =====================================================
  // PRIVATE HELPERS
  // =====================================================

  private extractMeta(req: any): LoginMeta {
    return {
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
    };
  }
}