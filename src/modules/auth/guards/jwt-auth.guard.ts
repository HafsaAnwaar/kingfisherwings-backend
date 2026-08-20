// src/modules/auth/guards/jwt-auth.guard.ts

import {
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

import { SKIP_STAFF_JWT_KEY } from '../../../common/decorators/skip-staff-jwt.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [
        context.getHandler(),
        context.getClass(),
      ],
    );

    if (isPublic) {
      return true;
    }

    const skipStaffJwt = this.reflector.getAllAndOverride<boolean>(
      SKIP_STAFF_JWT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skipStaffJwt) {
      return true;
    }

    return super.canActivate(context);
  }
}