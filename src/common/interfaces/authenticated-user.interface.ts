// src/common/interfaces/authenticated-user.interface.ts
//
// SINGLE SOURCE OF TRUTH for what `request.user` looks like once
// JwtAuthGuard + JwtStrategy have run.
//
// Why this file exists:
// Previously the Auth module and the Users module each declared their
// OWN incompatible version of this shape (auth used `tenant_id`
// snake_case with 5 fields; users used `tenantId` camelCase with 8
// fields including `permissions`). JwtStrategy only ever populated the
// auth-module shape, so every guard/decorator in the Users module that
// read `user.tenantId` or `user.permissions` silently got `undefined`.
// That is the root cause of "tenant admin logs in fine but every
// subsequent request is rejected."
//
// Fix: one interface, populated fully by JwtStrategy, imported by both
// modules (and by any future module, e.g. Tenants).

import { Request } from "express";
import { UserRole } from "@prisma/client";

export interface AuthenticatedUser {
  /** User id (JWT `sub`). */
  id: string;

  /** Tenant the user belongs to. */
  tenantId: string;

  /** Tenant slug — handy for logging/audit without a extra lookup. */
  tenantSlug: string;

  /**
   * True only for users that belong to the reserved platform tenant
   * AND hold the SUPER_ADMIN role. This is what actually gates
   * platform-level operations (creating/suspending tenants) — NOT the
   * `role` field alone, because a careless/compromised tenant admin
   * could otherwise self-assign the SUPER_ADMIN enum value inside
   * their own tenant. See PlatformAdminGuard.
   */
  isPlatformAdmin: boolean;

  branchId: string | null;

  /**
   * All role ids assigned to this user via UserRoleAssignment.
   */
  roleIds: string[];

  /** Legacy single-role enum, retained until RBAC fully replaces it. */
  role: UserRole;

  /** Flattened effective permission codes, e.g. "users.create". */
  permissions: string[];

  email: string;

  /** Session identifier — matches Session.jti. */
  jti: string;

  /** Alias of `jti`, kept because the Users module refers to it as sessionId. */
  sessionId: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
