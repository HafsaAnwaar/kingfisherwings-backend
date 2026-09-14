/**
 * One-shot scaffold for remaining Masters tiles (Waves 1–3 Nest files).
 * Run: node scripts/scaffold-remaining-masters.cjs
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const masters = path.join(root, "src", "modules", "masters");

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function write(rel, content) {
  const full = path.join(root, rel);
  ensureDir(path.dirname(full));
  fs.writeFileSync(full, content.replace(/\r\n/g, "\n"), "utf8");
  console.log("wrote", rel);
}

function dtoFile(classBase, fieldsBlock, extraImports = "") {
  return `import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsDateString,
  Length,
  MaxLength,
  Min,
} from "class-validator";
${extraImports}
export class Create${classBase}Dto {
${fieldsBlock}
}

export class Update${classBase}Dto extends PartialType(Create${classBase}Dto) {}
`;
}

function serviceFile(className, modelName, searchFields, uniqueLabel) {
  return `import { Injectable } from "@nestjs/common";
import { ${className} } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { BaseMasterService } from "../base-master.service";

@Injectable()
export class ${className}sService extends BaseMasterService<${className}> {
  protected readonly modelName = "${modelName}";
  protected readonly searchFields = ${JSON.stringify(searchFields)};
  protected readonly uniqueKeyLabel = "${uniqueLabel}";

  constructor(prisma: PrismaService) {
    super(prisma);
  }
}
`;
}

// Special naming for some services (PackType -> PackTypes, not PackTypesService from PackType + s)
function serviceFileNamed(serviceName, prismaType, modelName, searchFields, uniqueLabel) {
  return `import { Injectable } from "@nestjs/common";
import { ${prismaType} } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { BaseMasterService } from "../base-master.service";

@Injectable()
export class ${serviceName} extends BaseMasterService<${prismaType}> {
  protected readonly modelName = "${modelName}";
  protected readonly searchFields = ${JSON.stringify(searchFields)};
  protected readonly uniqueKeyLabel = "${uniqueLabel}";

  constructor(prisma: PrismaService) {
    super(prisma);
  }
}
`;
}

function controllerFile({
  tag,
  route,
  serviceClass,
  serviceImport,
  createDto,
  updateDto,
  dtoImport,
  listSummary,
}) {
  return `import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { ${serviceClass} } from "./${serviceImport}";
import { ${createDto}, ${updateDto} } from "../dto/${dtoImport}";
import { MasterQueryDto } from "../dto/master-query.dto";

import { RolesGuard } from "../../users/guards/roles.guard";
import { PermissionsGuard } from "../../users/guards/permissions.guard";
import { RequirePermissions } from "../../users/decorators/permissions.decorator";
import { CurrentUser } from "../../users/decorators/current-user.decorator";
import { MASTERS_PERMISSIONS } from "../constants/masters-permission.constants";

@ApiTags("${tag}")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("${route}")
export class ${serviceClass.replace("Service", "Controller")} {
  constructor(private readonly service: ${serviceClass}) {}

  @Get()
  @RequirePermissions(MASTERS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "${listSummary}" })
  findAll(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: MasterQueryDto,
  ) {
    return this.service.findAll(tenantId, query);
  }

  @Get(":id")
  @RequirePermissions(MASTERS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Get a record by id" })
  findOne(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.findOne(tenantId, id);
  }

  @Post()
  @RequirePermissions(MASTERS_PERMISSIONS.CREATE)
  @ApiOperation({ summary: "Create a record" })
  create(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Body() dto: ${createDto},
  ) {
    return this.service.create(tenantId, { ...dto }, actorId);
  }

  @Patch(":id")
  @RequirePermissions(MASTERS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Update a record" })
  update(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ${updateDto},
  ) {
    return this.service.update(tenantId, id, { ...dto }, actorId);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(MASTERS_PERMISSIONS.DELETE)
  @ApiOperation({ summary: "Soft-delete a record" })
  async remove(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    await this.service.softDelete(tenantId, id, actorId);
  }
}
`;
}

const wave1 = [
  {
    folder: "regions",
    dto: "region",
    classBase: "Region",
    prismaType: "Region",
    modelName: "region",
    service: "RegionsService",
    tag: "Masters — Regions",
    route: "masters/regions",
    search: ["code", "name"],
    unique: "code",
    fields: `  @ApiProperty({ example: "GCC" })
  @IsString()
  @Length(1, 30)
  code!: string;

  @ApiProperty({ example: "Gulf Cooperation Council" })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiPropertyOptional({ example: "AE" })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  country_code?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;`,
  },
  {
    folder: "cities",
    dto: "city",
    classBase: "City",
    prismaType: "City",
    modelName: "city",
    service: "CitiesService",
    tag: "Masters — Cities",
    route: "masters/cities",
    search: ["code", "name"],
    unique: "code",
    fields: `  @ApiProperty({ example: "DXB" })
  @IsString()
  @Length(1, 30)
  code!: string;

  @ApiProperty({ example: "Dubai" })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiPropertyOptional({ example: "AE" })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  country_code?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  region_id?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;`,
  },
  {
    folder: "zones",
    dto: "zone",
    classBase: "Zone",
    prismaType: "Zone",
    modelName: "zone",
    service: "ZonesService",
    tag: "Masters — Zones",
    route: "masters/zones",
    search: ["code", "name"],
    unique: "code",
    fields: `  @ApiProperty({ example: "DXB-JAFZA" })
  @IsString()
  @Length(1, 30)
  code!: string;

  @ApiProperty({ example: "Jebel Ali Free Zone" })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  region_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  city_id?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;`,
  },
  {
    folder: "divisions",
    dto: "division",
    classBase: "Division",
    prismaType: "Division",
    modelName: "division",
    service: "DivisionsService",
    tag: "Masters — Divisions",
    route: "masters/divisions",
    search: ["code", "name"],
    unique: "code",
    fields: `  @ApiProperty({ example: "SEA" })
  @IsString()
  @Length(1, 30)
  code!: string;

  @ApiProperty({ example: "Sea Freight Division" })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  company_id?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;`,
  },
  {
    folder: "categories",
    dto: "master-category",
    classBase: "MasterCategory",
    prismaType: "MasterCategory",
    modelName: "masterCategory",
    service: "MasterCategoriesService",
    controller: "MasterCategoriesController",
    tag: "Masters — Categories",
    route: "masters/categories",
    search: ["code", "name"],
    unique: "code",
    extraImports: `import { MasterCategoryType } from "@prisma/client";\n`,
    fields: `  @ApiProperty({ example: "SHIPPER" })
  @IsString()
  @Length(1, 30)
  code!: string;

  @ApiProperty({ example: "Shipper" })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiProperty({ enum: ["PARTY", "CARGO", "OTHER"], example: "PARTY" })
  @IsEnum(MasterCategoryType)
  category_type!: MasterCategoryType;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;`,
  },
  {
    folder: "commodities",
    dto: "commodity",
    classBase: "Commodity",
    prismaType: "Commodity",
    modelName: "commodity",
    service: "CommoditiesService",
    tag: "Masters — Commodities",
    route: "masters/commodities",
    search: ["code", "name", "hs_code"],
    unique: "code",
    fields: `  @ApiProperty({ example: "ELEC" })
  @IsString()
  @Length(1, 30)
  code!: string;

  @ApiProperty({ example: "Electronics" })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiPropertyOptional({ example: "8517.12" })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  hs_code?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;`,
  },
  {
    folder: "packs",
    dto: "pack-type",
    classBase: "PackType",
    prismaType: "PackType",
    modelName: "packType",
    service: "PackTypesService",
    tag: "Masters — Packs",
    route: "masters/packs",
    search: ["code", "name"],
    unique: "code",
    fields: `  @ApiProperty({ example: "CTN" })
  @IsString()
  @Length(1, 30)
  code!: string;

  @ApiProperty({ example: "Carton" })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiPropertyOptional({ example: 40 })
  @IsOptional()
  @IsNumber()
  length_cm?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsNumber()
  width_cm?: number;

  @ApiPropertyOptional({ example: 25 })
  @IsOptional()
  @IsNumber()
  height_cm?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;`,
  },
  {
    folder: "clauses",
    dto: "clause",
    classBase: "Clause",
    prismaType: "Clause",
    modelName: "clause",
    service: "ClausesService",
    tag: "Masters — Clauses",
    route: "masters/clauses",
    search: ["code", "title"],
    unique: "code",
    fields: `  @ApiProperty({ example: "DEM-DET" })
  @IsString()
  @Length(1, 30)
  code!: string;

  @ApiProperty({ example: "Demurrage / Detention" })
  @IsString()
  @Length(2, 200)
  title!: string;

  @ApiProperty({ example: "Free time and detention terms apply as per carrier tariff." })
  @IsString()
  @MaxLength(10000)
  body!: string;

  @ApiPropertyOptional({ example: "BL" })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  clause_type?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;`,
  },
  {
    folder: "port-clause-maps",
    dto: "port-clause-map",
    classBase: "PortClauseMap",
    prismaType: "PortClauseMap",
    modelName: "portClauseMap",
    service: "PortClauseMapsService",
    tag: "Masters — Port Clause Maps",
    route: "masters/port-clause-maps",
    search: [],
    unique: "port and clause",
    fields: `  @ApiProperty({ format: "uuid" })
  @IsUUID()
  port_id!: string;

  @ApiProperty({ format: "uuid" })
  @IsUUID()
  clause_id!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;`,
  },
  {
    folder: "rate-bases",
    dto: "rate-basis",
    classBase: "RateBasis",
    prismaType: "RateBasis",
    modelName: "rateBasis",
    service: "RateBasesService",
    tag: "Masters — Rate Bases",
    route: "masters/rate-bases",
    search: ["code", "name"],
    unique: "code",
    fields: `  @ApiProperty({ example: "PER_KG" })
  @IsString()
  @Length(1, 30)
  code!: string;

  @ApiProperty({ example: "Per Kilogram" })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;`,
  },
  {
    folder: "voyages",
    dto: "voyage-master",
    classBase: "VoyageMaster",
    prismaType: "VoyageMaster",
    modelName: "voyageMaster",
    service: "VoyageMastersService",
    tag: "Masters — Voyages",
    route: "masters/voyages",
    search: ["voyage_code"],
    unique: "voyage_code",
    fields: `  @ApiProperty({ example: "VSL-2026-001" })
  @IsString()
  @Length(1, 50)
  voyage_code!: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  vessel_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  shipping_line_id?: string;

  @ApiPropertyOptional({ example: "2026-04-01T00:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  etd?: string;

  @ApiPropertyOptional({ example: "2026-04-15T00:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  eta?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;`,
  },
  {
    folder: "storage-slabs",
    dto: "storage-slab",
    classBase: "StorageSlab",
    prismaType: "StorageSlab",
    modelName: "storageSlab",
    service: "StorageSlabsService",
    tag: "Masters — Storage Slabs",
    route: "masters/storage-slabs",
    search: ["code", "name"],
    unique: "code",
    fields: `  @ApiProperty({ example: "SLAB-1-7" })
  @IsString()
  @Length(1, 30)
  code!: string;

  @ApiProperty({ example: "Days 1-7" })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(0)
  from_days!: number;

  @ApiProperty({ example: 7 })
  @IsInt()
  @Min(0)
  to_days!: number;

  @ApiProperty({ example: 25.5 })
  @IsNumber()
  rate!: number;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  rate_basis_id?: string;

  @ApiPropertyOptional({ example: "AED" })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency_code?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;`,
  },
  {
    folder: "activities",
    dto: "activity-type",
    classBase: "ActivityType",
    prismaType: "ActivityType",
    modelName: "activityType",
    service: "ActivityTypesService",
    tag: "Masters — Activities",
    route: "masters/activities",
    search: ["code", "name"],
    unique: "code",
    fields: `  @ApiProperty({ example: "FOLLOW_UP" })
  @IsString()
  @Length(1, 30)
  code!: string;

  @ApiProperty({ example: "Follow Up" })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiPropertyOptional({ example: "CRM", description: "Module flag e.g. CRM, OPS" })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  module?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;`,
  },
  {
    folder: "sales-call-activities",
    dto: "sales-call-activity-type",
    classBase: "SalesCallActivityType",
    prismaType: "SalesCallActivityType",
    modelName: "salesCallActivityType",
    service: "SalesCallActivityTypesService",
    tag: "Masters — Sales Call Activities",
    route: "masters/sales-call-activities",
    search: ["code", "name"],
    unique: "code",
    fields: `  @ApiProperty({ example: "COLD_CALL" })
  @IsString()
  @Length(1, 30)
  code!: string;

  @ApiProperty({ example: "Cold Call" })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;`,
  },
];

for (const e of wave1) {
  const dtoPath = `src/modules/masters/dto/${e.dto}.dto.ts`;
  write(dtoPath, dtoFile(e.classBase, e.fields, e.extraImports || ""));

  const svcName = e.service;
  write(
    `src/modules/masters/${e.folder}/${e.folder}.service.ts`,
    serviceFileNamed(svcName, e.prismaType, e.modelName, e.search, e.unique),
  );

  const ctrlClass = e.controller || svcName.replace("Service", "Controller");
  const ctrlBody = controllerFile({
    tag: e.tag,
    route: e.route,
    serviceClass: svcName,
    serviceImport: `${e.folder}.service`,
    createDto: `Create${e.classBase}Dto`,
    updateDto: `Update${e.classBase}Dto`,
    dtoImport: `${e.dto}.dto`,
    listSummary: `list ${e.folder.replace(/-/g, " ")}`,
  }).replace(
    `export class ${svcName.replace("Service", "Controller")}`,
    `export class ${ctrlClass}`,
  );
  write(`src/modules/masters/${e.folder}/${e.folder}.controller.ts`, ctrlBody);
}

// Wave 3 CRUD: organization-groups + custom-reports
write(
  "src/modules/masters/dto/organization-group.dto.ts",
  dtoFile(
    "OrganizationGroup",
    `  @ApiProperty({ example: "GULF" })
  @IsString()
  @Length(1, 30)
  code!: string;

  @ApiProperty({ example: "Gulf Companies" })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiPropertyOptional({ type: [String], format: "uuid" })
  @IsOptional()
  @IsUUID("4", { each: true })
  company_ids?: string[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;`,
  ),
);

write(
  "src/modules/masters/dto/custom-report-master.dto.ts",
  dtoFile(
    "CustomReportMaster",
    `  @ApiProperty({ example: "AR_AGING_CUST" })
  @IsString()
  @Length(1, 50)
  code!: string;

  @ApiProperty({ example: "Customer AR Aging" })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiProperty({ example: "ar_aging", description: "Links to report template code" })
  @IsString()
  @Length(1, 100)
  report_template_code!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;`,
  ),
);

console.log("Wave 1 + Wave 3 DTO scaffolds done");
