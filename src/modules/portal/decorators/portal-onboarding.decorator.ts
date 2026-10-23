import { SetMetadata } from "@nestjs/common";

/**
 * auth — me / logout / change-password (always while authenticated)
 * verification — verification upload/list while password already changed
 * full — normal portal (default when decorator omitted)
 */
export type PortalOnboardingLevel = "auth" | "verification" | "full";

export const PORTAL_ONBOARDING_KEY = "portalOnboardingLevel";

export const PortalOnboarding = (level: PortalOnboardingLevel) =>
  SetMetadata(PORTAL_ONBOARDING_KEY, level);
