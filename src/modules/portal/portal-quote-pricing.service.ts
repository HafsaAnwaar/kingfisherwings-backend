import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  JobType,
  QuotationSource,
  ServicePricingBasis,
  TenantServiceCatalogItem,
} from "@prisma/client";
import {
  cbmFromCm,
  chargeableWeightKg,
  sumPackageCbm,
  totalGrossWeightKg,
  totalPieces,
} from "../../common/utils/cargo-dimensions.util";
import { PrismaService } from "../../prisma/prisma.service";
import { QuotationsService } from "../quotations/quotations.service";
import { ServiceCatalogService } from "../quotations/service-catalog/service-catalog.service";
import { PortalQuotationEstimateDto } from "./dto/portal-quotation.dto";

export interface PricedLinePreview {
  service_code: string;
  description: string;
  charge_code_id?: string;
  unit?: string;
  quantity: number;
  unit_price: number;
  currency_code: string;
  amount: number;
}

export interface PackagePreview {
  length_cm: number;
  width_cm: number;
  height_cm: number;
  gross_weight_kg: number;
  pieces: number;
  cbm: number;
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

@Injectable()
export class PortalQuotePricingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly catalog: ServiceCatalogService,
    private readonly quotations: QuotationsService,
  ) {}

  async buildEstimate(
    tenantId: string,
    partyId: string,
    dto: PortalQuotationEstimateDto,
  ): Promise<QuoteEstimateResult> {
    const packages = this.normalizePackages(dto.packages);
    const volumeCbm = sumPackageCbm(packages);
    const grossWeight = totalGrossWeightKg(packages);
    const chargeableWeight = chargeableWeightKg(grossWeight, volumeCbm);
    const pieces = totalPieces(packages);

    const catalogItems = await this.catalog.findByCodes(
      tenantId,
      dto.service_codes,
      dto.job_type,
    );

    if (catalogItems.length !== dto.service_codes.length) {
      const found = new Set(catalogItems.map((i) => i.code));
      const missing = dto.service_codes.filter(
        (c) => !found.has(c.toUpperCase()),
      );
      throw new NotFoundException(
        `Unknown or inactive service codes: ${missing.join(", ")}`,
      );
    }

    const lines = catalogItems.map((item, index) =>
      this.priceCatalogItem(item, {
        volumeCbm,
        grossWeight,
        chargeableWeight,
        pieces,
        containerCount: dto.container_count ?? 1,
        currencyCode: dto.currency_code,
        sortOrder: index,
      }),
    );

    const revenueTotal = lines.reduce((sum, line) => sum + line.amount, 0);

    return {
      packages,
      lines,
      revenue_total: revenueTotal,
      currency_code: dto.currency_code,
      gross_weight: grossWeight,
      chargeable_weight: chargeableWeight,
      volume_cbm: volumeCbm,
      pieces,
    };
  }

  async persistQuote(
    tenantId: string,
    partyId: string,
    dto: PortalQuotationEstimateDto,
    portalUserId?: string,
  ) {
    const estimate = await this.buildEstimate(tenantId, partyId, dto);

    const quotation = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const created = await this.quotations.create(
        tenantId,
        {
          job_type: dto.job_type,
          customer_id: partyId,
          origin_port_id: dto.origin_port_id,
          dest_port_id: dto.dest_port_id,
          commodity: dto.commodity,
          gross_weight: estimate.gross_weight,
          chargeable_weight: estimate.chargeable_weight,
          volume_cbm: estimate.volume_cbm,
          pieces: estimate.pieces,
          container_type_id: dto.container_type_id,
          container_count: dto.container_count,
          special_requirements: dto.special_requirements,
          valid_until: dto.valid_until,
          currency_code: dto.currency_code,
          remarks: `Submitted via customer portal.`,
        },
        portalUserId,
      );

      await tx.quotation.update({
        where: { id: created.id },
        data: { source: QuotationSource.CUSTOMER_PORTAL },
      });

      for (const [index, pkg] of estimate.packages.entries()) {
        await tx.quotationCargoPackage.create({
          data: {
            tenant_id: tenantId,
            quotation_id: created.id,
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

      return created;
    });

    for (const line of estimate.lines) {
      if (!line.charge_code_id) {
        const fallback = await this.resolveFallbackChargeCode(
          tenantId,
          dto.job_type,
        );
        line.charge_code_id = fallback;
      }
      await this.quotations.addLine(
        tenantId,
        quotation.id,
        {
          charge_code_id: line.charge_code_id!,
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

    if (estimate.lines.length === 0) {
      try {
        await this.quotations.applyTariff(tenantId, quotation.id, portalUserId);
      } catch {
        // Best-effort tariff fallback.
      }
    }

    const refreshed = await this.quotations.findOne(tenantId, quotation.id);
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
        packages: estimate.packages,
        lines: revenueLines.map((line) => ({
          description: line.description,
          quantity: line.quantity,
          unit_price: line.unit_price,
          amount: line.amount,
          currency_code: line.currency_code,
        })),
      },
    };
  }

  private normalizePackages(
    packages: PortalQuotationEstimateDto["packages"],
  ): PackagePreview[] {
    if (!packages?.length) {
      throw new BadRequestException("At least one cargo package is required.");
    }

    return packages.map((pkg) => {
      const length = Number(pkg.length_cm);
      const width = Number(pkg.width_cm);
      const height = Number(pkg.height_cm);
      const gross = Number(pkg.gross_weight_kg);
      const pieces = Number(pkg.pieces ?? 1);

      if (length <= 0 || width <= 0 || height <= 0) {
        throw new BadRequestException(
          "Package length, width, and height must be positive.",
        );
      }
      if (gross < 0 || pieces <= 0) {
        throw new BadRequestException(
          "Package weight must be non-negative and pieces must be positive.",
        );
      }

      return {
        length_cm: length,
        width_cm: width,
        height_cm: height,
        gross_weight_kg: gross,
        pieces,
        cbm: cbmFromCm(length, width, height, pieces),
      };
    });
  }

  private priceCatalogItem(
    item: TenantServiceCatalogItem,
    ctx: {
      volumeCbm: number;
      grossWeight: number;
      chargeableWeight: number;
      pieces: number;
      containerCount: number;
      currencyCode: string;
      sortOrder: number;
    },
  ): PricedLinePreview {
    const unitPrice = Number(item.unit_price);
    const minCharge = Number(item.min_charge);
    let quantity = 1;

    switch (item.pricing_basis) {
      case ServicePricingBasis.PER_KG:
        quantity = ctx.chargeableWeight;
        break;
      case ServicePricingBasis.PER_CBM:
        quantity = ctx.volumeCbm;
        break;
      case ServicePricingBasis.PER_PIECE:
        quantity = ctx.pieces;
        break;
      case ServicePricingBasis.PER_CONTAINER:
        quantity = ctx.containerCount;
        break;
      case ServicePricingBasis.FLAT:
      default:
        quantity = 1;
    }

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
    };
  }

  private async resolveFallbackChargeCode(
    tenantId: string,
    jobType: JobType,
  ): Promise<string> {
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
