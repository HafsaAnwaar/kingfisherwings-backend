
import { Request } from 'express';
import { UserRole } from '@prisma/client';

/**
 * Shape of the authenticated principal attached to `request.user` by the
 * Auth module's JWT strategy (see Auth Module Phase 4 — JWT payload).
 * This is the contract the Auth module's guards/strategies must satisfy;
 * the Users module's guards and decorators depend on it existing.
 */
export interface CurrentUser {
  /** User id (JWT `sub`). */
  id: string;

  tenantId: string;

  branchId: string | null;

  /**
   * Primary/legacy role id (foreign key to a Role row). Multi-role
   * assignment is resolved into `permissions` below; this remains for
   * backwards compatibility with the legacy `User.role` enum field.
   */
  roleId: string | null;

  /** Legacy role enum, present until role-based checks are fully retired. */
  role: UserRole;

  sessionId: string;

  email: string;

  /** Flattened effective permission codes, e.g. "users.create". */
  permissions: string[];
}

export interface AuthenticatedRequest extends Request {
  user: CurrentUser;
}
