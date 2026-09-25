import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { OrganizationModule } from "../organization/organization.module";
import { NotificationsModule } from "../notifications/notifications.module";

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
import { AirPalletTypesController } from "./air-pallet-types/air-pallet-types.controller";
import { AirPalletTypesService } from "./air-pallet-types/air-pallet-types.service";

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
import { FreightSpecsSeedService } from "./freight-specs-seed.service";

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
import { MasterLabelService } from "./master-label.service";

import { RegionsController } from "./regions/regions.controller";
import { RegionsService } from "./regions/regions.service";
import { CitiesController } from "./cities/cities.controller";
import { CitiesService } from "./cities/cities.service";
import { ZonesController } from "./zones/zones.controller";
import { ZonesService } from "./zones/zones.service";
import { DivisionsController } from "./divisions/divisions.controller";
import { DivisionsService } from "./divisions/divisions.service";
import { MasterCategoriesController } from "./categories/categories.controller";
import { MasterCategoriesService } from "./categories/categories.service";
import { CommoditiesController } from "./commodities/commodities.controller";
import { CommoditiesService } from "./commodities/commodities.service";
import { PackTypesController } from "./packs/packs.controller";
import { PackTypesService } from "./packs/packs.service";
import { ClausesController } from "./clauses/clauses.controller";
import { ClausesService } from "./clauses/clauses.service";
import { PortClauseMapsController } from "./port-clause-maps/port-clause-maps.controller";
import { PortClauseMapsService } from "./port-clause-maps/port-clause-maps.service";
import { RateBasesController } from "./rate-bases/rate-bases.controller";
import { RateBasesService } from "./rate-bases/rate-bases.service";
import { VoyageMastersController } from "./voyages/voyages.controller";
import { VoyageMastersService } from "./voyages/voyages.service";
import { StorageSlabsController } from "./storage-slabs/storage-slabs.controller";
import { StorageSlabsService } from "./storage-slabs/storage-slabs.service";
import { ActivityTypesController } from "./activities/activities.controller";
import { ActivityTypesService } from "./activities/activities.service";
import { SalesCallActivityTypesController } from "./sales-call-activities/sales-call-activities.controller";
import { SalesCallActivityTypesService } from "./sales-call-activities/sales-call-activities.service";

import { MastersSearchController } from "./search/masters-search.controller";
import { MastersSearchService } from "./search/masters-search.service";
import { ContainerInventoryController } from "./container-inventory/container-inventory.controller";
import { ContainerInventoryService } from "./container-inventory/container-inventory.service";
import { FavoritesController } from "./favorites/favorites.controller";
import { FavoritesService } from "./favorites/favorites.service";
import { TrackingUsersController } from "./tracking-users/tracking-users.controller";
import { TrackingUsersService } from "./tracking-users/tracking-users.service";
import { WhatsappSmsHistoryController } from "./whatsapp-sms-history/whatsapp-sms-history.controller";
import { WhatsappSmsHistoryService } from "./whatsapp-sms-history/whatsapp-sms-history.service";

import { MastersOrganizationController } from "./organization/masters-organization.controller";
import { MastersNotificationsController } from "./notifications/masters-notifications.controller";
import { OrganizationGroupsController } from "./organization-groups/organization-groups.controller";
import { OrganizationGroupsService } from "./organization-groups/organization-groups.service";
import { CustomReportMastersController } from "./custom-reports/custom-reports.controller";
import { CustomReportMastersService } from "./custom-reports/custom-reports.service";

const CONTROLLERS = [
  CountriesController,
  CurrenciesController,
  ExchangeRatesController,
  PortsController,
  AirportsController,
  ContainerTypesController,
  AirPalletTypesController,
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
  RegionsController,
  CitiesController,
  ZonesController,
  DivisionsController,
  MasterCategoriesController,
  CommoditiesController,
  PackTypesController,
  ClausesController,
  PortClauseMapsController,
  RateBasesController,
  VoyageMastersController,
  StorageSlabsController,
  ActivityTypesController,
  SalesCallActivityTypesController,
  MastersSearchController,
  ContainerInventoryController,
  FavoritesController,
  TrackingUsersController,
  WhatsappSmsHistoryController,
  MastersOrganizationController,
  MastersNotificationsController,
  OrganizationGroupsController,
  CustomReportMastersController,
];

const SERVICES = [
  CountriesService,
  CurrenciesService,
  ExchangeRatesService,
  PortsService,
  AirportsService,
  ContainerTypesService,
  AirPalletTypesService,
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
  FreightSpecsSeedService,
  MasterLabelService,
  RegionsService,
  CitiesService,
  ZonesService,
  DivisionsService,
  MasterCategoriesService,
  CommoditiesService,
  PackTypesService,
  ClausesService,
  PortClauseMapsService,
  RateBasesService,
  VoyageMastersService,
  StorageSlabsService,
  ActivityTypesService,
  SalesCallActivityTypesService,
  MastersSearchService,
  ContainerInventoryService,
  FavoritesService,
  TrackingUsersService,
  WhatsappSmsHistoryService,
  OrganizationGroupsService,
  CustomReportMastersService,
];

@Module({
  imports: [PrismaModule, OrganizationModule, NotificationsModule],
  controllers: CONTROLLERS,
  providers: SERVICES,
  exports: SERVICES,
})
export class MastersModule {}
