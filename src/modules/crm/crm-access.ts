import { ForbiddenException } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../users/interfaces/current-user.interface";

export function isCrmManager(user: CurrentUser): boolean {
  return (
    user.role === UserRole.TENANT_ADMIN || user.role === UserRole.SALES_MANAGER
  );
}

export function salespersonScope(
  user: CurrentUser,
  requestedId?: string,
): string | undefined {
  if (isCrmManager(user)) {
    return requestedId;
  }
  if (requestedId && requestedId !== user.id) {
    throw new ForbiddenException(
      "Sales executives can only access their own CRM records.",
    );
  }
  return user.id;
}
