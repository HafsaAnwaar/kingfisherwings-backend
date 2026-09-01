import { Global, Module, OnModuleInit } from "@nestjs/common";
import { CountryLocaleService } from "./country-locale.service";
import { setCountryLocaleService } from "./country-locale.accessor";
import { TenantContextStorage } from "../context/tenant-context.storage";
import { LocaleController } from "./locale.controller";

@Global()
@Module({
  controllers: [LocaleController],
  providers: [TenantContextStorage, CountryLocaleService],
  exports: [TenantContextStorage, CountryLocaleService],
})
export class LocaleModule implements OnModuleInit {
  constructor(private readonly locale: CountryLocaleService) {}

  onModuleInit() {
    setCountryLocaleService(this.locale);
  }
}
