import { TechLogPrincipal } from "@prisma/client";
import { Request } from "express";
import { isSuperAdminPrincipal } from "../../common/utils/principal.util";

export type TechLogActor = {
  principal: TechLogPrincipal;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  tenantId: string | null;
};

type RequestLike = Request & {
  user?: {
    id?: string;
    email?: string;
    tenantId?: string;
    principal?: string;
  };
  portalUser?: {
    id?: string;
    email?: string;
    full_name?: string | null;
    tenant_id?: string;
  };
  vendorUser?: {
    id?: string;
    email?: string;
    full_name?: string | null;
    tenant_id?: string;
  };
};

export function resolveTechLogActor(req: RequestLike): TechLogActor {
  if (req.portalUser?.id) {
    return {
      principal: TechLogPrincipal.PORTAL,
      userId: req.portalUser.id,
      userEmail: req.portalUser.email ?? null,
      userName: req.portalUser.full_name?.trim() || req.portalUser.email || null,
      tenantId: req.portalUser.tenant_id ?? null,
    };
  }
  if (req.vendorUser?.id) {
    return {
      principal: TechLogPrincipal.VENDOR,
      userId: req.vendorUser.id,
      userEmail: req.vendorUser.email ?? null,
      userName: req.vendorUser.full_name?.trim() || req.vendorUser.email || null,
      tenantId: req.vendorUser.tenant_id ?? null,
    };
  }
  const user = req.user;
  if (user && isSuperAdminPrincipal(user)) {
    return {
      principal: TechLogPrincipal.SUPER_ADMIN,
      userId: user.id ?? null,
      userEmail: user.email ?? null,
      userName: user.email ?? "Super Admin",
      tenantId: null,
    };
  }
  if (user?.id && user.tenantId) {
    return {
      principal: TechLogPrincipal.USER,
      userId: user.id,
      userEmail: user.email ?? null,
      userName: null, // filled from DB in writer
      tenantId: user.tenantId,
    };
  }
  return {
    principal: TechLogPrincipal.ANONYMOUS,
    userId: null,
    userEmail: null,
    userName: null,
    tenantId: null,
  };
}

export function clientIp(req: Request): string | null {
  const xf = req.headers["x-forwarded-for"];
  if (typeof xf === "string" && xf.trim()) {
    return xf.split(",")[0]?.trim() || null;
  }
  return req.ip || req.socket?.remoteAddress || null;
}
