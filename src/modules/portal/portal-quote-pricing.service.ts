import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  JobType,
  Prisma,
  QuotationSource,
  ServicePricingBasis,
  TenantServiceCatalogItem,
} from "@prisma/client";
import {
  chargeableWeightKg,
  resolveCargoPackage,
  sumPackageCbm,
  totalGrossWeightKg,
  totalPieces,
} from "../../common/utils/cargo-dimensions.util";
import { PrismaService } from "../../prisma/prisma.service";
import { QuotationsService } from "../quotations/quotations.service";
import { ServiceCatalogService } from "../quotations/service-catalog/service-catalog.service";
import { TariffsService } from "../quotations/tariffs/tariffs.service";
import {
  PortalCostingOptionsDto,
  PortalCustomerLineDto,
  PortalEstimateSnapshotDto,
  PortalQuotationEstimateDto,
  PortalQuotationRequestDto,
} from "./dto/portal-quotation.dto";

export type PricingSource = "CATALOG" | "TARIFF" | "CUSTOMER_PROPOSED";

export interface PricedLinePreview {
  service_code: string;
  description: string;
  charge_code_id?: string;
  unit?: string;
  quantity: number;
  unit_price: number;
  currency_code: string;
  amount: number;
  pricing_source?: PricingSource;
  pricing_basis?: ServicePricingBasis | string;
}

export interface CostingOption {
  code: string;
  description: string;
  unit: string | null;
  sale_rate: number;
  suggested_quantity: number;
  suggested_amount: number;
  source: "CATALOG" | "TARIFF";
  charge_code_id: string | null;
  pricing_basis: string | null;
}

export interface PackagePreview {
  length_m: number;
  width_m: number;
  height_m: number;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  gross_weight_kg: number;
  pieces: number;
  cbm: number;
}

export interface CargoMetrics {
  packages: PackagePreview[];
  volumeCbm: number;
  grossWeight: number;
  chargeableWeight: number;
  pieces: number;
  containerCount: number;
}

export interface QuoteEstimateResult {
  packages: PackagePreview[];
  lines: PricedLinePreview[];
  revenue_total: number;
  currency_code: string;
  gross_weight: number;
  chargeable_weight: number;
  volume_cbm: number;
  pieces: number;
}

export interface CostingOptionsResult {
  currency_code: string;
  options: CostingOption[];
  estimated_total: number;
}

@Injectable()
export class PortalQuotePricingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly catalog: ServiceCatalogService,
    private readonly quotations: QuotationsService,
    private readonly tariffs: TariffsService,
  ) {}

  async buildCostingOptions(
    tenantId: string,
    partyId: string,
    dto: PortalCostingOptionsDto,
  ): Promise<CostingOptionsResult> {
    const metrics = this.resolveCargoMetrics(dto);
    const catalogItems = await this.loadPortalCatalogItems(
      tenantId,
      dto.job_type,
      dto.service_codes,
    );

    const options: CostingOption[] = catalogItems.map((item) => {
      const priced = this.priceCatalogItem(item, {
        ...metrics,
        currencyCode: dto.currency_code,
      });
      return {
        code: item.code,
        description: item.name,
        unit: item.pricing_basis,
        sale_rate: priced.unit_price,
        suggested_quantity: priced.quantity,
        suggested_amount: priced.amount,
        source: "CATALOG" as const,
        charge_code_id: item.charge_code_id ?? null,
        pricing_basis: item.pricing_basis,
      };
    });

    const tariffOption = await this.loadTariffOption(tenantId, partyId, dto);
    if (tariffOption) {
      const already = options.some(
        (o) =>
          o.charge_code_id &&
          tariffOption.charge_code_id &&
          o.charge_code_id === tariffOption.charge_code_id,
      );
      if (!already) {
        options.push(tariffOption);
      }
    }

    const estimatedTotal = options.reduce(
      (sum, o) => sum + o.suggested_amount,
      0,
    );

    return {
      currency_code: dto.currency_code,
      options,
      estimated_total: Math.round(estimatedTotal * 10000) / 10000,
    };
  }

  async buildEstimate(
    tenantId: string,
    partyId: string,
    dto: PortalQuotationEstimateDto,
  ): Promise<QuoteEstimateResult> {
    const metrics = this.resolveCargoMetrics(dto, { requirePackages: false });

    if (dto.customer_lines?.length) {
      const lines = await this.priceCustomerLines(
        tenantId,
        dto.job_type,
        dto.customer_lines,
        metrics,
        dto.currency_code,
      );
      return {
        packages: metrics.packages,
        lines,
        revenue_total: this.sumAmounts(lines),
        currency_code: dto.currency_code,
        gross_weight: metrics.grossWeight,
        chargeable_weight: metrics.chargeableWeight,
        volume_cbm: metrics.volumeCbm,
        pieces: metrics.pieces,
      };
    }

    const catalogItems = await this.loadPortalCatalogItems(
      tenantId,
      dto.job_type,
      dto.service_codes,
    );

    const lines = catalogItems.map((item) =>
      this.priceCatalogItem(item, {
        ...metrics,
        currencyCode: dto.currency_code,
      }),
    );

    return {
      packages: metrics.packages,
      lines,
      revenue_total: this.sumAmounts(lines),
      currency_code: dto.currency_code,
      gross_weight: metrics.grossWeight,
      chargeable_weight: metrics.chargeableWeight,
      volume_cbm: metrics.volumeCbm,
      pieces: metrics.pieces,
    };
  }

  async persistQuote(
    tenantId: string,
    partyId: string,
    dto: PortalQuotationEstimateDto,
    portalUserId?: string,
    estimateSnapshot?: PortalEstimateSnapshotDto | null,
  ) {
    const estimate = await this.buildEstimate(tenantId, partyId, dto);
    const snapshot = this.buildSnapshotPayload(
      dto.currency_code,
      estimate.lines,
      estimate.revenue_total,
      estimateSnapshot,
      "CATALOG",
    );

    const quotation = await this.createQuoteHeader(
      tenantId,
      partyId,
      dto,
      estimate,
      portalUserId,
      snapshot,
    );

    await this.persistPackages(tenantId, quotation.id, estimate.packages);

    for (const line of estimate.lines) {
      await this.addRevenueLine(tenantId, quotation.id, line, portalUserId);
    }

    if (estimate.lines.length === 0) {
      try {
        await this.quotations.applyTariff(tenantId, quotation.id, portalUserId);
      } catch {
        // Best-effort tariff fallback.
      }
    }

    return this.toCreateResponse(tenantId, quotation.id, estimate.packages);
  }

  async persistCustomerLinesQuote(
    tenantId: string,
    partyId: string,
    dto: PortalQuotationRequestDto,
    portalUserId?: string,
  ) {
    if (!dto.customer_lines?.length) {
      throw new BadRequestException("customer_lines is required.");
    }

    const metrics = this.resolveCargoMetrics(dto, { requirePackages: false });
    const lines = await this.priceCustomerLines(
      tenantId,
      dto.job_type,
      dto.customer_lines,
      metrics,
      dto.currency_code,
    );

    const snapshot = this.buildSnapshotPayload(
      dto.currency_code,
      lines,
      this.sumAmounts(lines),
      dto.estimate_snapshot,
      "CUSTOMER_PROPOSED",
    );

    const estimateLike: QuoteEstimateResult = {
      packages: metrics.packages,
      lines,
      revenue_total: this.sumAmounts(lines),
      currency_code: dto.currency_code,
      gross_weight: metrics.grossWeight,
      chargeable_weight: metrics.chargeableWeight,
      volume_cbm: metrics.volumeCbm,
      pieces: metrics.pieces,
    };

    const quotation = await this.createQuoteHeader(
      tenantId,
      partyId,
      dto,
      estimateLike,
      portalUserId,
      snapshot,
    );

    await this.persistPackages(tenantId, quotation.id, metrics.packages);

    for (const line of lines) {
      await this.addRevenueLine(tenantId, quotation.id, line, portalUserId);
    }

    return this.toCreateResponse(tenantId, quotation.id, metrics.packages);
  }

  resolveCargoMetrics(
    dto: {
      packages?: PortalQuotationEstimateDto["packages"];
      gross_weight?: number;
      chargeable_weight?: number;
      volume_cbm?: number;
      pieces?: number;
      container_count?: number;
    },
    opts?: { requirePackages?: boolean },
  ): CargoMetrics {
    const requirePackages = opts?.requirePackages ?? false;
    const packages = dto.packages?.length
      ? this.normalizePackages(dto.packages)
      : [];

    if (requirePackages && !packages.length) {
      throw new BadRequestException("At least one cargo package is required.");
    }

    if (packages.length) {
      const volumeCbm = sumPackageCbm(packages);
      const grossWeight = totalGrossWeightKg(packages);
      return {
        packages,
        volumeCbm,
        grossWeight,
        chargeableWeight: chargeableWeightKg(grossWeight, volumeCbm),
        pieces: totalPieces(packages),
        containerCount: dto.container_count ?? 1,
      };
    }

    const volumeCbm = Number(dto.volume_cbm ?? 0);
    const grossWeight = Number(dto.gross_weight ?? 0);
    return {
      packages: [],
      volumeCbm,
      grossWeight,
      chargeableWeight:
        dto.chargeable_weight != null
          ? Number(dto.chargeable_weight)
          : chargeableWeightKg(grossWeight, volumeCbm),
      pieces: dto.pieces ?? 0,
      containerCount: dto.container_count ?? 1,
    };
  }

  async loadPortalCatalogItems(
    tenantId: string,
    jobType: JobType,
    serviceCodes?: string[],
  ): Promise<TenantServiceCatalogItem[]> {
    const items = await this.catalog.findPortalByCodes(
      tenantId,
      serviceCodes,
      jobType,
    );

    if (serviceCodes?.length) {
      const found = new Set(items.map((i) => i.code));
      const missing = serviceCodes.filter((c) => !found.has(c.toUpperCase()));
      if (missing.length) {
        throw new NotFoundException(
          `Unknown or inactive service codes: ${missing.join(", ")}`,
        );
      }
      // Preserve request order
      const byCode = new Map(items.map((i) => [i.code, i]));
      return serviceCodes
        .map((c) => byCode.get(c.toUpperCase()))
        .filter((i): i is TenantServiceCatalogItem => Boolean(i));
    }

    return items;
  }

  priceCatalogItem(
    item: TenantServiceCatalogItem,
    ctx: {
      volumeCbm: number;
      grossWeight: number;
      chargeableWeight: number;
      pieces: number;
      containerCount: number;
      currencyCode: string;
    },
  ): PricedLinePreview {
    const unitPrice = Number(item.unit_price);
    const minCharge = Number(item.min_charge);
    const quantity = this.quantityForBasis(item.pricing_basis, ctx);
    const rawAmount = quantity * unitPrice;
    const amount = Math.max(rawAmount, minCharge);

    return {
      service_code: item.code,
      description: item.name,
      charge_code_id: item.charge_code_id ?? undefined,
      unit: item.pricing_basis,
      quantity: Math.round(quantity * 1000) / 1000,
      unit_price: unitPrice,
      currency_code: item.currency_code || ctx.currencyCode,
      amount: Math.round(amount * 10000) / 10000,
      pricing_source: "CATALOG",
      pricing_basis: item.pricing_basis,
    };
  }

  private quantityForBasis(
    basis: ServicePricingBasis,
    ctx: {
      volumeCbm: number;
      chargeableWeight: number;
      pieces: number;
      containerCount: number;
    },
  ): number {
    switch (basis) {
      case ServicePricingBasis.PER_KG:
        return ctx.chargeableWeight;
      case ServicePricingBasis.PER_CBM:
        return ctx.volumeCbm;
      case ServicePricingBasis.PER_PIECE:
        return ctx.pieces;
      case ServicePricingBasis.PER_CONTAINER:
        return ctx.containerCount;
      case ServicePricingBasis.FLAT:
      default:
        return 1;
    }
  }

  private async loadTariffOption(
    tenantId: string,
    partyId: string,
    dto: {
      job_type: JobType;
      origin_port_id?: string;
      dest_port_id?: string;
      container_type_id?: string;
      currency_code: string;
      container_count?: number;
    },
  ): Promise<CostingOption | null> {
    const tariff = await this.tariffs.findMatch(tenantId, {
      serviceType: dto.job_type,
      originPortId: dto.origin_port_id,
      destPortId: dto.dest_port_id,
      containerTypeId: dto.container_type_id,
      customerId: partyId,
    });
    if (!tariff) return null;

    const chargeCode = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.chargeCode.findFirst({
        where: {
          id: tariff.charge_code_id,
          tenant_id: tenantId,
          deleted_at: null,
        },
        select: { id: true, code: true, description: true, unit: true },
      }),
    );

    const saleRate = Number(tariff.sale_rate);
    const quantity = dto.container_count && dto.container_count > 0
      ? dto.container_count
      : 1;
    const amount = Math.round(saleRate * quantity * 10000) / 10000;

    return {
      code: chargeCode?.code ?? "TARIFF",
      description: chargeCode?.description ?? "Lane tariff",
      unit: tariff.unit ?? chargeCode?.unit ?? "Shipment",
      sale_rate: saleRate,
      suggested_quantity: quantity,
      suggested_amount: amount,
      source: "TARIFF",
      charge_code_id: tariff.charge_code_id,
      pricing_basis: null,
    };
  }

  private async priceCustomerLines(
    tenantId: string,
    jobType: JobType,
    customerLines: PortalCustomerLineDto[],
    metrics: CargoMetrics,
    currencyCode: string,
  ): Promise<PricedLinePreview[]> {
    const codes = customerLines
      .map((l) => l.code)
      .filter((c): c is string => Boolean(c));
    const catalogByCode = new Map<string, TenantServiceCatalogItem>();
    if (codes.length) {
      const items = await this.loadPortalCatalogItems(tenantId, jobType, codes);
      for (const item of items) catalogByCode.set(item.code, item);
    }

    const chargeCodeIds = customerLines
      .map((l) => l.charge_code_id)
      .filter((id): id is string => Boolean(id));
    const chargeCodes = chargeCodeIds.length
      ? await this.prisma.runWithTenant(tenantId, (tx) =>
          tx.chargeCode.findMany({
            where: {
              tenant_id: tenantId,
              id: { in: chargeCodeIds },
              deleted_at: null,
              is_active: true,
            },
            select: { id: true, code: true, description: true, unit: true },
          }),
        )
      : [];
    const chargeById = new Map(chargeCodes.map((c) => [c.id, c]));

    // Also accept tariff charge_code_id for the lane
    const tariff = await this.tariffs.findMatch(tenantId, {
      serviceType: jobType,
      customerId: undefined,
    });

    const lines: PricedLinePreview[] = [];
    for (const input of customerLines) {
      if (!input.charge_code_id && !input.code) {
        throw new BadRequestException(
          "Each customer_lines entry requires charge_code_id or code.",
        );
      }

      const catalogItem = input.code
        ? catalogByCode.get(input.code.toUpperCase())
        : undefined;

      let chargeCodeId = input.charge_code_id ?? catalogItem?.charge_code_id;
      if (!chargeCodeId && tariff) {
        chargeCodeId = tariff.charge_code_id;
      }
      if (!chargeCodeId) {
        chargeCodeId = await this.resolveFallbackChargeCode(tenantId);
      }

      if (input.charge_code_id && !chargeById.has(input.charge_code_id)) {
        // Allow catalog-linked ids even if not in the batch (inactive edge)
        const exists = await this.prisma.runWithTenant(tenantId, (tx) =>
          tx.chargeCode.findFirst({
            where: {
              id: input.charge_code_id!,
              tenant_id: tenantId,
              deleted_at: null,
            },
            select: { id: true },
          }),
        );
        if (!exists) {
          throw new NotFoundException(
            `Unknown charge_code_id: ${input.charge_code_id}`,
          );
        }
      }

      if (input.code && !catalogItem && input.source !== "TARIFF") {
        throw new NotFoundException(
          `Unknown or inactive service codes: ${input.code}`,
        );
      }

      const quantity =
        input.quantity != null
          ? Number(input.quantity)
          : catalogItem
            ? this.quantityForBasis(catalogItem.pricing_basis, metrics)
            : 1;
      const unitPrice = Number(input.unit_price);
      const amount = Math.round(quantity * unitPrice * 10000) / 10000;
      const charge = chargeCodeId ? chargeById.get(chargeCodeId) : undefined;

      lines.push({
        service_code:
          catalogItem?.code ??
          input.code?.toUpperCase() ??
          charge?.code ??
          "CUSTOM",
        description:
          input.description ??
          catalogItem?.name ??
          charge?.description ??
          "Customer proposed charge",
        charge_code_id: chargeCodeId,
        unit:
          input.unit ??
          catalogItem?.pricing_basis ??
          charge?.unit ??
          undefined,
        quantity: Math.round(quantity * 1000) / 1000,
        unit_price: unitPrice,
        currency_code: currencyCode,
        amount,
        pricing_source: input.source ?? "CUSTOMER_PROPOSED",
        pricing_basis: catalogItem?.pricing_basis,
      });
    }

    return lines;
  }

  private normalizePackages(
    packages: NonNullable<PortalQuotationEstimateDto["packages"]>,
  ): PackagePreview[] {
    return packages.map((pkg) => {
      let normalized;
      try {
        normalized = resolveCargoPackage(pkg);
      } catch (err) {
        throw new BadRequestException(
          err instanceof Error ? err.message : "Invalid cargo dimensions.",
        );
      }
      const gross = Number(pkg.gross_weight_kg);
      if (gross < 0) {
        throw new BadRequestException("Package weight must be non-negative.");
      }

      return {
        length_m: normalized.length_m,
        width_m: normalized.width_m,
        height_m: normalized.height_m,
        length_cm: normalized.length_cm,
        width_cm: normalized.width_cm,
        height_cm: normalized.height_cm,
        gross_weight_kg: gross,
        pieces: normalized.pieces,
        cbm: normalized.cbm,
      };
    });
  }

  private buildSnapshotPayload(
    currencyCode: string,
    lines: PricedLinePreview[],
    estimatedTotal: number,
    clientSnapshot?: PortalEstimateSnapshotDto | null,
    defaultSource: PricingSource = "CATALOG",
  ) {
    return {
      currency_code: clientSnapshot?.currency_code ?? currencyCode,
      estimated_total:
        clientSnapshot?.estimated_total ?? estimatedTotal,
      captured_at: clientSnapshot?.captured_at ?? new Date().toISOString(),
      lines: lines.map((line) => ({
        code: line.service_code,
        description: line.description,
        charge_code_id: line.charge_code_id ?? null,
        quantity: line.quantity,
        unit_price: line.unit_price,
        amount: line.amount,
        source: line.pricing_source ?? defaultSource,
      })),
    };
  }

  private async createQuoteHeader(
    tenantId: string,
    partyId: string,
    dto: PortalQuotationRequestDto,
    estimate: QuoteEstimateResult,
    portalUserId: string | undefined,
    snapshot: Record<string, unknown>,
  ) {
    const created = await this.quotations.create(
      tenantId,
      {
        job_type: dto.job_type,
        customer_id: partyId,
        origin_port_id: dto.origin_port_id,
        dest_port_id: dto.dest_port_id,
        commodity: dto.commodity,
        gross_weight: estimate.gross_weight || dto.gross_weight,
        chargeable_weight:
          estimate.chargeable_weight || dto.chargeable_weight,
        volume_cbm: estimate.volume_cbm || dto.volume_cbm,
        pieces: estimate.pieces || dto.pieces,
        container_type_id: dto.container_type_id,
        container_count: dto.container_count,
        special_requirements: dto.special_requirements,
        valid_until: dto.valid_until,
        currency_code: dto.currency_code,
        remarks: `Submitted via customer portal.`,
      },
      portalUserId,
    );

    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.quotation.update({
        where: { id: created.id },
        data: {
          source: QuotationSource.CUSTOMER_PORTAL,
          portal_estimate_snapshot: snapshot as Prisma.InputJsonValue,
        },
      }),
    );

    return created;
  }

  private async persistPackages(
    tenantId: string,
    quotationId: string,
    packages: PackagePreview[],
  ) {
    if (!packages.length) return;
    await this.prisma.runWithTenant(tenantId, async (tx) => {
      for (const [index, pkg] of packages.entries()) {
        await tx.quotationCargoPackage.create({
          data: {
            tenant_id: tenantId,
            quotation_id: quotationId,
            length_cm: pkg.length_cm,
            width_cm: pkg.width_cm,
            height_cm: pkg.height_cm,
            gross_weight_kg: pkg.gross_weight_kg,
            pieces: pkg.pieces,
            cbm: pkg.cbm,
            sort_order: index,
          },
        });
      }
    });
  }

  private async addRevenueLine(
    tenantId: string,
    quotationId: string,
    line: PricedLinePreview,
    portalUserId?: string,
  ) {
    let chargeCodeId = line.charge_code_id;
    if (!chargeCodeId) {
      chargeCodeId = await this.resolveFallbackChargeCode(tenantId);
    }
    await this.quotations.addLine(
      tenantId,
      quotationId,
      {
        charge_code_id: chargeCodeId,
        description: line.description,
        unit: line.unit,
        quantity: line.quantity,
        unit_price: line.unit_price,
        currency_code: line.currency_code,
        is_cost: false,
      },
      portalUserId,
    );
  }

  private async toCreateResponse(
    tenantId: string,
    quotationId: string,
    packages: PackagePreview[],
  ) {
    const refreshed = await this.quotations.findOne(tenantId, quotationId);
    const revenueLines = refreshed.lines.filter((l) => !l.is_cost);

    return {
      success: true,
      message: "Quote request received. Our sales team will follow up shortly.",
      data: {
        quotation_id: refreshed.id,
        quotation_number: refreshed.quotation_number,
        status: refreshed.status,
        revenue_total: revenueLines.reduce(
          (sum, line) => sum + Number(line.amount),
          0,
        ),
        line_count: revenueLines.length,
        packages,
        lines: revenueLines.map((line) => ({
          description: line.description,
          quantity: line.quantity,
          unit_price: line.unit_price,
          amount: line.amount,
          currency_code: line.currency_code,
          pricing_source: (line as { pricing_source?: string }).pricing_source,
        })),
      },
    };
  }

  private sumAmounts(lines: PricedLinePreview[]): number {
    return (
      Math.round(
        lines.reduce((sum, line) => sum + line.amount, 0) * 10000,
      ) / 10000
    );
  }

  private async resolveFallbackChargeCode(tenantId: string): Promise<string> {
    const code = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.chargeCode.findFirst({
        where: { tenant_id: tenantId, deleted_at: null, is_active: true },
        orderBy: { code: "asc" },
        select: { id: true },
      }),
    );
    if (!code) {
      throw new BadRequestException(
        "No charge code configured for portal pricing.",
      );
    }
    return code.id;
  }
}
