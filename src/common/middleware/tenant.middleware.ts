// src/common/middleware/tenant.middleware.ts

import {
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    next();
  }
}