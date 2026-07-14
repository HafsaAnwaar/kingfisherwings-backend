import { CountryLocaleService } from './country-locale.service';

/**
 * class-validator decorators cannot inject Nest providers. We register the
 * singleton CountryLocaleService here from LocaleModule.onModuleInit.
 */
let localeService: CountryLocaleService | null = null;

export function setCountryLocaleService(service: CountryLocaleService): void {
  localeService = service;
}

export function getCountryLocaleService(): CountryLocaleService {
  if (!localeService) {
    // Construction without tenant context is fine for pure validation helpers
    // that only use catalog + libphonenumber (tenant fallbacks return AE/null).
    const { TenantContextStorage } = require('../context/tenant-context.storage');
    localeService = new CountryLocaleService(new TenantContextStorage());
  }
  return localeService;
}
