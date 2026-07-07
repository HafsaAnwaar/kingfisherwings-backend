"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MastersModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma/prisma.module");
const countries_controller_1 = require("./countries/countries.controller");
const countries_service_1 = require("./countries/countries.service");
const currencies_controller_1 = require("./currencies/currencies.controller");
const currencies_service_1 = require("./currencies/currencies.service");
const exchange_rates_controller_1 = require("./exchange-rates/exchange-rates.controller");
const exchange_rates_service_1 = require("./exchange-rates/exchange-rates.service");
const ports_controller_1 = require("./ports/ports.controller");
const ports_service_1 = require("./ports/ports.service");
const airports_controller_1 = require("./airports/airports.controller");
const airports_service_1 = require("./airports/airports.service");
const container_types_controller_1 = require("./container-types/container-types.controller");
const container_types_service_1 = require("./container-types/container-types.service");
const hs_codes_controller_1 = require("./hs-codes/hs-codes.controller");
const hs_codes_service_1 = require("./hs-codes/hs-codes.service");
const airlines_controller_1 = require("./airlines/airlines.controller");
const airlines_service_1 = require("./airlines/airlines.service");
const shipping_lines_controller_1 = require("./shipping-lines/shipping-lines.controller");
const shipping_lines_service_1 = require("./shipping-lines/shipping-lines.service");
const vessels_controller_1 = require("./vessels/vessels.controller");
const vessels_service_1 = require("./vessels/vessels.service");
const truckers_controller_1 = require("./truckers/truckers.controller");
const truckers_service_1 = require("./truckers/truckers.service");
const warehouses_controller_1 = require("./warehouses/warehouses.controller");
const warehouses_service_1 = require("./warehouses/warehouses.service");
const charge_codes_controller_1 = require("./charge-codes/charge-codes.controller");
const charge_codes_service_1 = require("./charge-codes/charge-codes.service");
const banks_controller_1 = require("./banks/banks.controller");
const banks_service_1 = require("./banks/banks.service");
const holidays_controller_1 = require("./holidays/holidays.controller");
const holidays_service_1 = require("./holidays/holidays.service");
const units_of_measure_controller_1 = require("./units-of-measure/units-of-measure.controller");
const units_of_measure_service_1 = require("./units-of-measure/units-of-measure.service");
const tax_rates_controller_1 = require("./tax-rates/tax-rates.controller");
const tax_rates_service_1 = require("./tax-rates/tax-rates.service");
const branches_controller_1 = require("./branches/branches.controller");
const branches_service_1 = require("./branches/branches.service");
const departments_controller_1 = require("./departments/departments.controller");
const departments_service_1 = require("./departments/departments.service");
const designations_controller_1 = require("./designations/designations.controller");
const designations_service_1 = require("./designations/designations.service");
const CONTROLLERS = [
    countries_controller_1.CountriesController,
    currencies_controller_1.CurrenciesController,
    exchange_rates_controller_1.ExchangeRatesController,
    ports_controller_1.PortsController,
    airports_controller_1.AirportsController,
    container_types_controller_1.ContainerTypesController,
    hs_codes_controller_1.HsCodesController,
    airlines_controller_1.AirlinesController,
    shipping_lines_controller_1.ShippingLinesController,
    vessels_controller_1.VesselsController,
    truckers_controller_1.TruckersController,
    warehouses_controller_1.WarehousesController,
    charge_codes_controller_1.ChargeCodesController,
    banks_controller_1.BanksController,
    holidays_controller_1.HolidaysController,
    units_of_measure_controller_1.UnitsOfMeasureController,
    tax_rates_controller_1.TaxRatesController,
    branches_controller_1.BranchesController,
    departments_controller_1.DepartmentsController,
    designations_controller_1.DesignationsController,
];
const SERVICES = [
    countries_service_1.CountriesService,
    currencies_service_1.CurrenciesService,
    exchange_rates_service_1.ExchangeRatesService,
    ports_service_1.PortsService,
    airports_service_1.AirportsService,
    container_types_service_1.ContainerTypesService,
    hs_codes_service_1.HsCodesService,
    airlines_service_1.AirlinesService,
    shipping_lines_service_1.ShippingLinesService,
    vessels_service_1.VesselsService,
    truckers_service_1.TruckersService,
    warehouses_service_1.WarehousesService,
    charge_codes_service_1.ChargeCodesService,
    banks_service_1.BanksService,
    holidays_service_1.HolidaysService,
    units_of_measure_service_1.UnitsOfMeasureService,
    tax_rates_service_1.TaxRatesService,
    branches_service_1.BranchesService,
    departments_service_1.DepartmentsService,
    designations_service_1.DesignationsService,
];
let MastersModule = class MastersModule {
};
exports.MastersModule = MastersModule;
exports.MastersModule = MastersModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: CONTROLLERS,
        providers: SERVICES,
        exports: SERVICES,
    })
], MastersModule);
//# sourceMappingURL=masters.module.js.map