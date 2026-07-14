import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CountryLocaleService } from './country-locale.service';
import { Public } from '../decorators/public.decorators';

@ApiTags('Locale')
@Public()
@Controller('locale')
export class LocaleController {
  constructor(private readonly locale: CountryLocaleService) {}

  @Get('defaults')
  @ApiOperation({
    summary: 'Optional country → suggested dial / currency / timezone',
    description:
      'Country is optional. Pass ?country=AE to get suggestions for forms. Omit country (or call without query) to receive null suggestions — nothing is forced.',
  })
  getDefaults(@Query('country') country?: string) {
    const defaults = this.locale.getLocaleDefaults(country);
    const profile = this.locale.getProfile(defaults.countryCode);
    return {
      country_code: defaults.countryCode,
      dial_code: defaults.dialCode,
      base_currency: defaults.baseCurrency,
      timezone: defaults.timezone,
      timezones: profile?.timezones ?? [],
      tax_id_label: defaults.countryCode
        ? this.locale.taxIdLabel(defaults.countryCode)
        : null,
      has_postal_pattern: Boolean(profile?.postalCodePattern),
      has_tax_pattern: Boolean(profile?.taxIdPattern),
      country_required: false,
    };
  }

  @Get(':countryCode')
  @ApiOperation({ summary: 'Locale suggestions for an ISO country (still optional to use)' })
  getProfile(@Param('countryCode') countryCode: string) {
    return this.getDefaults(countryCode);
  }
}
