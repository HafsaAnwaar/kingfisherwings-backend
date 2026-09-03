import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";

import { CountriesController } from "./countries/countries.controller";
import { CountriesService } from "./countries/countries.service";

import { CurrenciesController } from "./currencies/currencies.controller";
import { CurrenciesService } from "./currencies/currencies.service";

import { ExchangeRatesController } from "./exchange-rates/exchange-rates.controller";
import { ExchangeRatesService } from "./exchange-rates/exchange-rates.service";

import { PortsController } from "./ports/ports.controller";
import { PortsService } from "./ports/ports.service";

import { AirportsController } from "./airports/airports.controller";
import { AirportsService } from "./airports/airports.service";

import { ContainerTypesController } from "./container-types/container-types.controller";
import { ContainerTypesService } from "./container-types/container-types.service";

import { HsCodesController } from "./hs-codes/hs-codes.controller";
import { HsCodesService } from "./hs-codes/hs-codes.service";

import { AirlinesController } from "./airlines/airlines.controller";
import { AirlinesService } from "./airlines/airlines.service";

import { ShippingLinesController } from "./shipping-lines/shipping-lines.controller";
import { ShippingLinesService } from "./shipping-lines/shipping-lines.service";

import { VesselsController } from "./vessels/vessels.controller";
import { VesselsService } from "./vessels/vessels.service";
import { VesselSchedulesController } from "./vessels/vessel-schedules.controller";
import { VesselSchedulesService } from "./vessels/vessel-schedules.service";

import { TruckersController } from "./truckers/truckers.controller";
import { TruckersService } from "./truckers/truckers.service";

import { CourierVendorsController } from "./courier-vendors/courier-vendors.controller";
import { CourierVendorsService } from "./courier-vendors/courier-vendors.service";

import { WarehousesController } from "./warehouses/warehouses.controller";
import { WarehousesService } from "./warehouses/warehouses.service";

import { WorldPortsSeedService } from "./world-ports-seed.service";

import { ChargeCodesController } from "./charge-codes/charge-codes.controller";
import { ChargeCodesService } from "./charge-codes/charge-codes.service";

import { BanksController } from "./banks/banks.controller";
import { BanksService } from "./banks/banks.service";

import { HolidaysController } from "./holidays/holidays.controller";
import { HolidaysService } from "./holidays/holidays.service";

import { UnitsOfMeasureController } from "./units-of-measure/units-of-measure.controller";
import { UnitsOfMeasureService } from "./units-of-measure/units-of-measure.service";

import { TaxRatesController } from "./tax-rates/tax-rates.controller";
import { TaxRatesService } from "./tax-rates/tax-rates.service";

import { BranchesController } from "./branches/branches.controller";
import { BranchesService } from "./branches/branches.service";

import { DepartmentsController } from "./departments/departments.controller";
import { DepartmentsService } from "./departments/departments.service";

import { DesignationsController } from "./designations/designations.controller";
import { DesignationsService } from "./designations/designations.service";

const CONTROLLERS = [
  CountriesController,
  CurrenciesController,
  ExchangeRatesController,
  PortsController,
  AirportsController,
  ContainerTypesController,
  HsCodesController,
  AirlinesController,
  ShippingLinesController,
  VesselsController,
  VesselSchedulesController,
  TruckersController,
  CourierVendorsController,
  WarehousesController,
  ChargeCodesController,
  BanksController,
  HolidaysController,
  UnitsOfMeasureController,
  TaxRatesController,
  BranchesController,
  DepartmentsController,
  DesignationsController,
];

const SERVICES = [
  CountriesService,
  CurrenciesService,
  ExchangeRatesService,
  PortsService,
  AirportsService,
  ContainerTypesService,
  HsCodesService,
  AirlinesService,
  ShippingLinesService,
  VesselsService,
  VesselSchedulesService,
  TruckersService,
  CourierVendorsService,
  WarehousesService,
  ChargeCodesService,
  BanksService,
  HolidaysService,
  UnitsOfMeasureService,
  TaxRatesService,
  BranchesService,
  DepartmentsService,
  DesignationsService,
  WorldPortsSeedService,
];

@Module({
  imports: [PrismaModule],
  controllers: CONTROLLERS,
  providers: SERVICES,
  exports: SERVICES,
})
export class MastersModule {}
