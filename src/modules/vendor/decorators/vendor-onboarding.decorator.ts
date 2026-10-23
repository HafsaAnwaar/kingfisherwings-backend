import { SetMetadata } from "@nestjs/common";

export type VendorOnboardingLevel = "auth" | "verification" | "full";

export const VENDOR_ONBOARDING_KEY = "vendorOnboardingLevel";

export const VendorOnboarding = (level: VendorOnboardingLevel) =>
  SetMetadata(VENDOR_ONBOARDING_KEY, level);
