import { Injectable } from "@nestjs/common";
import { AsyncLocalStorage } from "async_hooks";

export interface TenantContextStore {
  tenantId: string | null;
  /** Tenant organization country — optional. */
  countryCode: string | null;
  /** Authenticated user's preferred country — optional. */
  preferredCountryCode: string | null;
  baseCurrency: string | null;
  timezone: string | null;
}

export interface TenantLocaleSnapshot {
  tenantId: string | null;
  countryCode: string | null;
  preferredCountryCode: string | null;
  baseCurrency: string | null;
  timezone: string | null;
}

/**
 * Request-scoped tenant + locale. Country fields are optional at every level.
 */
@Injectable()
export class TenantContextStorage {
  private readonly storage = new AsyncLocalStorage<TenantContextStore>();

  run<T>(
    tenantId: string | null,
    callback: () => T,
    locale?: Partial<Omit<TenantContextStore, "tenantId">>,
  ): T {
    return this.storage.run(
      {
        tenantId,
        countryCode: locale?.countryCode ?? null,
        preferredCountryCode: locale?.preferredCountryCode ?? null,
        baseCurrency: locale?.baseCurrency ?? null,
        timezone: locale?.timezone ?? null,
      },
      callback,
    );
  }

  getTenantId(): string | null {
    return this.storage.getStore()?.tenantId ?? null;
  }

  getCountryCode(): string | null {
    return this.storage.getStore()?.countryCode ?? null;
  }

  getPreferredCountryCode(): string | null {
    return this.storage.getStore()?.preferredCountryCode ?? null;
  }

  getBaseCurrency(): string | null {
    return this.storage.getStore()?.baseCurrency ?? null;
  }

  getTimezone(): string | null {
    return this.storage.getStore()?.timezone ?? null;
  }

  getLocale(): TenantLocaleSnapshot {
    const store = this.storage.getStore();
    return {
      tenantId: store?.tenantId ?? null,
      countryCode: store?.countryCode ?? null,
      preferredCountryCode: store?.preferredCountryCode ?? null,
      baseCurrency: store?.baseCurrency ?? null,
      timezone: store?.timezone ?? null,
    };
  }
}
