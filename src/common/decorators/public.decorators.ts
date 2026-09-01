import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";

/**
 * Marks a route (or entire controller) as exempt from the global
 * JwtAuthGuard. Lives in common/ rather than modules/auth/ so modules
 * like Health and Tenants can use it without depending on the Auth
 * module.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
