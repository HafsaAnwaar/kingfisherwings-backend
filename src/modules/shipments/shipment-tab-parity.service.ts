import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from "@nestjs/common";
import {
  JobContainerKind,
  JobPartyRole,
  PartyType,
  Prisma,
} from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { JobOrganizationService } from "../jobs/job-organization.service";
import { JobDimensionService } from "../jobs/job-dimension.service";
import { JobContainerTabService } from "../jobs/job-container-tab.service";
import { JobCostingService } from "../jobs/job-costing.service";
import { JobTabPanelsService } from "../jobs/job-tab-panels.service";
import {
  AddJobOrganizationDto,
  JOB_ORGANIZATION_TYPES,
} from "../jobs/dto/job-organization-tab.dto";
import { UpsertJobDimensionLineDto } from "../jobs/dto/job-dimension.dto";
import {
  PatchJobDepartmentDto,
  UpsertJobCustomsRefDto,
  UpsertJobExchangeRateDto,
  UpsertJobRoutingLegDto,
} from "../jobs/dto/job-tab-panels.dto";
import { CompositeJobChargeDto } from "../jobs/dto/job-costing.dto";
import {
  computeTotalWeightKg,
  computeVolumeCbm,
  computeVolumetricWeightKg,
  DEFAULT_VOLUMETRIC_DIVISOR_CM,
} from "../jobs/utils/job-dimension-calc.util";
import { PartiesService } from "../parties/parties.service";
import { MasterLabelService } from "../masters/master-label.service";

/**
 * Shared detail tabs (except job-only history/booking_form/shipments):
 * — if shipment.job_id set → proxy to Job services (same data)
 * — else → shipment-local tables with the same response shapes
 */
@Injectable()
export class ShipmentTabParityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly parties: PartiesService,
    @Inject(forwardRef(() => JobOrganizationService))
    private readonly jobOrgs: JobOrganizationService,
    @Inject(forwardRef(() => JobDimensionService))
    private readonly jobDims: JobDimensionService,
    @Inject(forwardRef(() => JobContainerTabService))
    private readonly jobContainers: JobContainerTabService,
    @Inject(forwardRef(() => JobCostingService))
    private readonly jobCosting: JobCostingService,
    @Inject(forwardRef(() => JobTabPanelsService))
    private readonly jobPanels: JobTabPanelsService,
    private readonly labels: MasterLabelService,
  ) {}

  private async owner(tenantId: string, shipmentId: string) {
    const shipment = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.shipment.findFirst({
        where: { id: shipmentId, tenant_id: tenantId, deleted_at: null },
      }),
    );
    if (!shipment) throw new NotFoundException("Shipment not found.");
    return shipment;
  }

  // ─── Organization ───────────────────────────────────────────

  async getOrganization(tenantId: string, shipmentId: string) {
    const s = await this.owner(tenantId, shipmentId);
    if (s.job_id) return this.jobOrgs.getTab(tenantId, s.job_id);
    await this.ensureOrgSeed(tenantId, s);
    const orgs = await this.listShipmentOrgs(tenantId, shipmentId);
    const customer =
      orgs.find((o) => o.is_primary_customer) ??
      orgs.find((o) => o.org_type === JobPartyRole.CLIENT) ??
      null;
    return {
      success: true,
      data: {
        empty: orgs.length === 0,
        organizations: orgs,
        party_references: [],
        customer_name:
          customer?.party_display?.name ?? customer?.party?.name ?? null,
        customer_party: customer?.party_display ?? customer?.party ?? null,
        organization_types: JOB_ORGANIZATION_TYPES,
        party_types: Object.values(PartyType),
        shipment_fks: {
          customer_id: s.customer_id,
          shipper_id: s.shipper_id,
          consignee_id: s.consignee_id,
          notify_party_id: s.notify_party_id,
        },
        actions: {
          add_organization: true,
          copy_from_parent: false,
          refresh_party_snapshot: orgs.length > 0,
        },
        source: "shipment",
      },
    };
  }

  async addOrganization(
    tenantId: string,
    shipmentId: string,
    dto: AddJobOrganizationDto,
    actorId?: string,
  ) {
    const s = await this.owner(tenantId, shipmentId);
    if (s.job_id) {
      return this.jobOrgs.add(tenantId, s.job_id, dto, actorId);
    }
    let partyId = dto.party_id;
    if (!partyId && dto.create_party) {
      const created = await this.parties.create(
        tenantId,
        dto.create_party as never,
        actorId,
      );
      partyId = created.id;
    }
    if (!partyId) throw new BadRequestException("party_id or create_party required.");

    const party = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.party.findFirst({
        where: { id: partyId!, tenant_id: tenantId, deleted_at: null },
      }),
    );
    if (!party) throw new NotFoundException("Party not found.");

    const snapshot = {
      party_id: party.id,
      code: party.code,
      name: party.name,
      short_name: party.short_name,
      party_type: party.party_type,
      address: party.address,
      city: party.city,
      country_code: party.country_code,
      phone: party.phone,
      email: party.email,
      vat_number: party.vat_number,
      cr_number: party.cr_number,
      currency_code: party.currency_code,
      frozen_at: new Date().toISOString(),
    };

    await this.prisma.runWithTenant(tenantId, async (tx) => {
      await tx.shipmentOrganization.upsert({
        where: {
          tenant_id_shipment_id_org_type: {
            tenant_id: tenantId,
            shipment_id: shipmentId,
            org_type: dto.org_type,
          },
        },
        create: {
          tenant_id: tenantId,
          shipment_id: shipmentId,
          org_type: dto.org_type,
          party_id: partyId!,
          is_primary_customer:
            dto.org_type === JobPartyRole.CLIENT ||
            dto.org_type === JobPartyRole.BILLING_PARTY,
          party_snapshot: snapshot,
          created_by: actorId,
          updated_by: actorId,
        },
        update: {
          party_id: partyId!,
          party_snapshot: snapshot,
          deleted_at: null,
          updated_by: actorId,
        },
      });
      await this.syncShipmentFk(tx, shipmentId, dto.org_type, partyId!);
    });
    return this.getOrganization(tenantId, shipmentId);
  }

  // ─── Dimensions ─────────────────────────────────────────────

  async getDimensions(tenantId: string, shipmentId: string) {
    const s = await this.owner(tenantId, shipmentId);
    if (s.job_id) return this.jobDims.getTab(tenantId, s.job_id);
    const lines = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.shipmentDimensionLine.findMany({
        where: { tenant_id: tenantId, shipment_id: shipmentId, deleted_at: null },
        orderBy: { line_no: "asc" },
      }),
    );
    const totals = {
      pieces: lines.reduce((a, l) => a + (l.no_of_pcs ?? 0), 0),
      gross_weight: lines.reduce((a, l) => a + Number(l.g_weight ?? 0), 0),
      volume_cbm: lines.reduce((a, l) => a + Number(l.volume ?? 0), 0),
      total_weight: lines.reduce((a, l) => a + Number(l.total_weight ?? 0), 0),
    };
    return {
      success: true,
      data: {
        lines,
        totals,
        volumetric_divisor_cm: DEFAULT_VOLUMETRIC_DIVISOR_CM,
        header_fallback: {
          pieces: s.pieces,
          gross_weight: s.gross_weight,
          volume_cbm: s.volume_cbm,
          commodity: s.commodity,
          hs_code: s.hs_code,
        },
        actions: {
          upload: false,
          add: true,
          bulk: false,
          export: false,
          sync_to_cargo: false,
        },
        source: "shipment",
      },
    };
  }

  async addDimension(
    tenantId: string,
    shipmentId: string,
    dto: UpsertJobDimensionLineDto,
    actorId?: string,
  ) {
    const s = await this.owner(tenantId, shipmentId);
    if (s.job_id) return this.jobDims.add(tenantId, s.job_id, dto, actorId);
    const divisor = DEFAULT_VOLUMETRIC_DIVISOR_CM;
    const volume =
      dto.volume ??
      computeVolumeCbm({
        length: dto.length,
        width: dto.width,
        height: dto.height,
        no_of_pcs: dto.no_of_pcs,
        length_unit: dto.length_unit,
      });
    const vWeight =
      dto.v_weight ??
      computeVolumetricWeightKg({
        length: dto.length,
        width: dto.width,
        height: dto.height,
        no_of_pcs: dto.no_of_pcs,
        length_unit: dto.length_unit,
        divisor,
      });
    const totalWeight =
      dto.total_weight ??
      computeTotalWeightKg({
        g_weight: dto.g_weight,
        g_weight_unit: dto.g_weight_unit,
        no_of_pcs: dto.no_of_pcs,
      });

    const row = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const max = await tx.shipmentDimensionLine.aggregate({
        where: { tenant_id: tenantId, shipment_id: shipmentId, deleted_at: null },
        _max: { line_no: true },
      });
      return tx.shipmentDimensionLine.create({
        data: {
          tenant_id: tenantId,
          shipment_id: shipmentId,
          line_no: dto.line_no ?? (max._max.line_no ?? 0) + 1,
          length_unit: dto.length_unit,
          length: dto.length,
          width: dto.width,
          height: dto.height,
          no_of_pcs: dto.no_of_pcs ?? 1,
          package_type: dto.package_type,
          g_weight: dto.g_weight,
          g_weight_unit: dto.g_weight_unit,
          v_weight: vWeight,
          v_weight_unit: dto.v_weight_unit,
          n_weight: dto.n_weight,
          n_weight_unit: dto.n_weight_unit,
          total_weight: totalWeight,
          total_weight_unit: dto.total_weight_unit,
          volume,
          volume_unit: dto.volume_unit,
          hs_code: dto.hs_code,
          commodity: dto.commodity,
          commodity_description: dto.commodity_description,
          remarks: dto.remarks,
          created_by: actorId,
          updated_by: actorId,
        },
      });
    });
    return { success: true, data: row };
  }

  // ─── Containers ─────────────────────────────────────────────

  async getContainers(
    tenantId: string,
    shipmentId: string,
    kind: JobContainerKind,
  ) {
    const s = await this.owner(tenantId, shipmentId);
    if (s.job_id) return this.jobContainers.getTab(tenantId, s.job_id, kind);
    const rows =
      kind === JobContainerKind.PLANNED
        ? await this.prisma.runWithTenant(tenantId, (tx) =>
            tx.shipmentContainerPlan.findMany({
              where: {
                tenant_id: tenantId,
                shipment_id: shipmentId,
                deleted_at: null,
              },
              orderBy: { sort_order: "asc" },
            }),
          )
        : await this.prisma.runWithTenant(tenantId, (tx) =>
            tx.shipmentContainerActual.findMany({
              where: {
                tenant_id: tenantId,
                shipment_id: shipmentId,
                deleted_at: null,
              },
              orderBy: { sort_order: "asc" },
            }),
          );
    return {
      success: true,
      data: {
        containers: rows,
        actions: {
          view: true,
          add: true,
          update: true,
          multiple_update: true,
          upload: false,
          export: false,
          update_job_details: false,
          storage_charges: false,
          sync_from_sub_jobs: false,
        },
        container_kind: kind,
        source: "shipment",
      },
    };
  }

  // ─── Costing ────────────────────────────────────────────────

  async getCosting(tenantId: string, shipmentId: string) {
    const s = await this.owner(tenantId, shipmentId);
    if (s.job_id) return this.jobCosting.getTab(tenantId, s.job_id, "STAFF");
    const charges = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.shipmentCharge.findMany({
        where: { tenant_id: tenantId, shipment_id: shipmentId, deleted_at: null },
        orderBy: [{ line_no: "asc" }, { sort_order: "asc" }],
      }),
    );
    const lines = charges.map((c) => ({
      id: c.id,
      line_no: c.line_no ?? c.sort_order,
      description: c.description,
      charge: {
        charge_code_id: c.charge_code_id,
        quantity: c.quantity,
        is_provisional: c.is_provisional,
      },
      sale:
        c.sale_amount != null || !c.is_cost
          ? {
              bill_to: c.sale_party_id ?? c.party_id,
              amount: c.sale_amount ?? (!c.is_cost ? c.amount : null),
              tax_amount: c.sale_tax_amount ?? (!c.is_cost ? c.tax_amount : null),
              currency: c.sale_currency ?? c.currency_code,
              ex_rate: c.sale_ex_rate ?? c.exchange_rate,
            }
          : null,
      cost:
        c.cost_amount != null || c.is_cost
          ? {
              vendor: c.cost_party_id ?? c.party_id,
              amount: c.cost_amount ?? (c.is_cost ? c.amount : null),
              tax_amount: c.cost_tax_amount,
              currency: c.cost_currency ?? c.currency_code,
              ex_rate: c.cost_ex_rate ?? c.exchange_rate,
            }
          : null,
      gp: c.gp_amount,
    }));
    return {
      success: true,
      data: {
        revenue_total: s.revenue_total,
        cost_total: s.cost_total,
        gp_amount: s.gp_amount,
        gp_percent: s.gp_percent,
        lines,
        vouchers: [],
        actions: {
          profit_share: false,
          sale: true,
          cost: true,
          charges: true,
          get_charges: true,
          get_job_charges: false,
          add: true,
          generate_prorate: false,
          vouchers_list: false,
          generate_voucher: false,
          generate_sale_invoice: false,
          generate_purchase_invoice: false,
          job_profit_sheet: false,
          job_profit_sheet_custom_duty: false,
          costing_history: false,
        },
        path_hints: {
          composite_add: `/shipments/${shipmentId}/charges/composite`,
          get_charges: `/shipments/${shipmentId}/get-charges`,
        },
        source: "shipment",
      },
    };
  }

  async addComposite(
    tenantId: string,
    shipmentId: string,
    dto: CompositeJobChargeDto,
    actorId?: string,
  ) {
    const s = await this.owner(tenantId, shipmentId);
    if (s.job_id) {
      return this.jobCosting.addComposite(tenantId, s.job_id, dto, actorId);
    }
    if (!dto.sale && !dto.cost) {
      throw new BadRequestException("Provide sale and/or cost section.");
    }
    const hasSale = !!dto.sale && (dto.sale.amount != null || dto.sale.fcy_amount != null);
    const hasCost = !!dto.cost && (dto.cost.amount != null || dto.cost.fcy_amount != null);
    const saleAmt = Number(dto.sale?.amount ?? dto.sale?.fcy_amount ?? 0);
    const costAmt = Number(dto.cost?.amount ?? dto.cost?.fcy_amount ?? 0);
    const qty = dto.charge.quantity ?? 1;
    const isCostOnly = hasCost && !hasSale;
    const amount = isCostOnly ? costAmt : saleAmt;
    const currency =
      (isCostOnly ? dto.cost?.currency : dto.sale?.currency) ?? "AED";
    const ex = Number(
      (isCostOnly ? dto.cost?.ex_rate : dto.sale?.ex_rate) ?? 1,
    );

    const row = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const max = await tx.shipmentCharge.aggregate({
        where: { tenant_id: tenantId, shipment_id: shipmentId, deleted_at: null },
        _max: { line_no: true },
      });
      const created = await tx.shipmentCharge.create({
        data: {
          tenant_id: tenantId,
          shipment_id: shipmentId,
          charge_code_id: dto.charge.charge_code_id,
          description: dto.charge.description,
          quantity: qty,
          unit_price: amount / (qty || 1),
          currency_code: currency,
          exchange_rate: ex,
          amount,
          amount_base_currency: amount * ex,
          tax_amount: Number(dto.sale?.tax_amount ?? 0),
          is_cost: isCostOnly,
          is_billable: hasSale,
          party_id: hasSale ? dto.sale?.bill_to : dto.cost?.vendor,
          line_no: dto.charge.line_no ?? (max._max.line_no ?? 0) + 1,
          sale_party_id: dto.sale?.bill_to,
          sale_amount: hasSale ? saleAmt : null,
          sale_tax_amount: dto.sale?.tax_amount,
          sale_currency: dto.sale?.currency,
          sale_ex_rate: dto.sale?.ex_rate ?? (hasSale ? ex : null),
          cost_party_id: dto.cost?.vendor,
          cost_amount: hasCost ? costAmt : null,
          cost_tax_amount: dto.cost?.tax_amount,
          cost_currency: dto.cost?.currency,
          cost_ex_rate: dto.cost?.ex_rate ?? (hasCost ? ex : null),
          gp_amount: saleAmt * Number(dto.sale?.ex_rate ?? 1) - costAmt * Number(dto.cost?.ex_rate ?? 1),
          is_provisional: dto.is_provisional ?? false,
          created_by: actorId,
          updated_by: actorId,
        },
      });
      await this.recalcShipmentTotals(tx, tenantId, shipmentId);
      return created;
    });
    return { success: true, data: row, can_save_and_close: true, can_save_and_stay: true };
  }

  // ─── Department / FX / Routing / Customs ────────────────────

  async getDepartment(tenantId: string, shipmentId: string) {
    const s = await this.owner(tenantId, shipmentId);
    if (s.job_id) return this.jobPanels.getDepartmentTab(tenantId, s.job_id);
    const named = await this.labels.enrichOne(tenantId, {
      branch_id: s.branch_id,
      company_id: s.company_id,
      department_id: s.department_id,
      salesperson_id: s.salesperson_id,
    });
    return {
      success: true,
      data: {
        ...named,
        actions: { can_patch: true },
        path_hints: { patch: `/shipments/${shipmentId}/department` },
        source: "shipment",
      },
    };
  }

  async patchDepartment(
    tenantId: string,
    shipmentId: string,
    dto: PatchJobDepartmentDto,
    actorId?: string,
  ) {
    const s = await this.owner(tenantId, shipmentId);
    if (s.job_id) {
      return this.jobPanels.patchDepartment(tenantId, s.job_id, dto, actorId);
    }
    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.shipment.update({
        where: { id: shipmentId },
        data: {
          ...(dto.branch_id !== undefined ? { branch_id: dto.branch_id } : {}),
          ...(dto.company_id !== undefined ? { company_id: dto.company_id } : {}),
          ...(dto.department_id !== undefined
            ? { department_id: dto.department_id }
            : {}),
          ...(dto.salesperson_id !== undefined
            ? { salesperson_id: dto.salesperson_id }
            : {}),
          updated_by: actorId,
        },
      }),
    );
    return this.getDepartment(tenantId, shipmentId);
  }

  async getExRate(tenantId: string, shipmentId: string) {
    const s = await this.owner(tenantId, shipmentId);
    if (s.job_id) return this.jobPanels.getExRateTab(tenantId, s.job_id);
    const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.shipmentExchangeRate.findMany({
        where: { tenant_id: tenantId, shipment_id: shipmentId, deleted_at: null },
        orderBy: { currency_code: "asc" },
      }),
    );
    return {
      success: true,
      data: {
        rates: rows.map((r) => ({ ...r, persisted: true })),
        actions: { upsert: true, apply_to_charges: true, delete: true },
        path_hints: { upsert: `/shipments/${shipmentId}/exchange-rates` },
        source: "shipment",
      },
    };
  }

  async upsertExchangeRate(
    tenantId: string,
    shipmentId: string,
    dto: UpsertJobExchangeRateDto,
    actorId?: string,
  ) {
    const s = await this.owner(tenantId, shipmentId);
    if (s.job_id) {
      return this.jobPanels.upsertExchangeRate(tenantId, s.job_id, dto, actorId);
    }
    const currency = dto.currency_code.toUpperCase();
    const row = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.shipmentExchangeRate.findFirst({
        where: {
          tenant_id: tenantId,
          shipment_id: shipmentId,
          currency_code: currency,
          deleted_at: null,
        },
      });
      const data = {
        exchange_rate: dto.exchange_rate,
        effective_date: dto.effective_date
          ? new Date(dto.effective_date)
          : null,
        source: dto.source ?? "manual",
      };
      const saved = existing
        ? await tx.shipmentExchangeRate.update({
            where: { id: existing.id },
            data,
          })
        : await tx.shipmentExchangeRate.create({
            data: {
              tenant_id: tenantId,
              shipment_id: shipmentId,
              currency_code: currency,
              ...data,
            },
          });
      if (dto.apply_to_charges) {
        await tx.shipmentCharge.updateMany({
          where: {
            tenant_id: tenantId,
            shipment_id: shipmentId,
            deleted_at: null,
            OR: [
              { currency_code: currency },
              { sale_currency: currency },
              { cost_currency: currency },
            ],
          },
          data: {
            exchange_rate: dto.exchange_rate,
            sale_ex_rate: dto.exchange_rate,
            cost_ex_rate: dto.exchange_rate,
            updated_by: actorId,
          },
        });
      }
      return saved;
    });
    return { success: true, data: row };
  }

  async getRouting(tenantId: string, shipmentId: string) {
    const s = await this.owner(tenantId, shipmentId);
    if (s.job_id) return this.jobPanels.getRoutingTab(tenantId, s.job_id);
    let legs = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.shipmentRoutingLeg.findMany({
        where: { tenant_id: tenantId, shipment_id: shipmentId, deleted_at: null },
        orderBy: { leg_sequence: "asc" },
      }),
    );
    if (!legs.length && (s.origin_port_id || s.dest_port_id)) {
      const seeded = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.shipmentRoutingLeg.create({
          data: {
            tenant_id: tenantId,
            shipment_id: shipmentId,
            leg_sequence: 1,
            origin_port_id: s.origin_port_id,
            dest_port_id: s.dest_port_id,
            etd: s.etd,
            eta: s.eta,
            vessel_name: s.vessel_name,
            voyage_number: s.voyage_number,
          },
        }),
      );
      legs = [seeded];
    }
    const namedLegs = await this.labels.enrichRows(tenantId, legs);
    return {
      success: true,
      data: {
        legs: namedLegs,
        actions: { add: true, update: true, delete: true },
        path_hints: { add: `/shipments/${shipmentId}/routing-legs` },
        source: "shipment",
      },
    };
  }

  async createRoutingLeg(
    tenantId: string,
    shipmentId: string,
    dto: UpsertJobRoutingLegDto,
    actorId?: string,
  ) {
    const s = await this.owner(tenantId, shipmentId);
    if (s.job_id) {
      return this.jobPanels.createRoutingLeg(tenantId, s.job_id, dto, actorId);
    }
    const row = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const max = await tx.shipmentRoutingLeg.aggregate({
        where: { tenant_id: tenantId, shipment_id: shipmentId, deleted_at: null },
        _max: { leg_sequence: true },
      });
      return tx.shipmentRoutingLeg.create({
        data: {
          tenant_id: tenantId,
          shipment_id: shipmentId,
          leg_sequence: dto.leg_sequence ?? (max._max.leg_sequence ?? 0) + 1,
          transport_mode: dto.transport_mode,
          port_id: dto.port_id,
          origin_port_id: dto.origin_port_id,
          dest_port_id: dto.dest_port_id,
          etd: dto.etd ? new Date(dto.etd) : undefined,
          eta: dto.eta ? new Date(dto.eta) : undefined,
          carrier_id: dto.carrier_id,
          vessel_name: dto.vessel_name,
          voyage_number: dto.voyage_number,
        },
      });
    });
    return { success: true, data: row };
  }

  async getCustoms(tenantId: string, shipmentId: string) {
    const s = await this.owner(tenantId, shipmentId);
    if (s.job_id) return this.jobPanels.getCustomsTab(tenantId, s.job_id);
    const refs = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.shipmentCustomsRef.findMany({
        where: { tenant_id: tenantId, shipment_id: shipmentId, deleted_at: null },
        orderBy: { created_at: "desc" },
      }),
    );
    return {
      success: true,
      data: {
        refs,
        sea_fcl: {
          hbl_number: s.hbl_number,
          mbl_number: s.mbl_number,
        },
        actions: { add: true, update: true, delete: true },
        path_hints: { add: `/shipments/${shipmentId}/customs-refs` },
        source: "shipment",
      },
    };
  }

  async createCustomsRef(
    tenantId: string,
    shipmentId: string,
    dto: UpsertJobCustomsRefDto,
    actorId?: string,
  ) {
    const s = await this.owner(tenantId, shipmentId);
    if (s.job_id) {
      return this.jobPanels.createCustomsRef(tenantId, s.job_id, dto, actorId);
    }
    const row = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.shipmentCustomsRef.create({
        data: {
          tenant_id: tenantId,
          shipment_id: shipmentId,
          sb_number: dto.sb_number,
          boe_number: dto.boe_number,
          customs_house: dto.customs_house,
          customs_status: dto.customs_status,
          filed_at: dto.filed_at ? new Date(dto.filed_at) : undefined,
          cleared_at: dto.cleared_at ? new Date(dto.cleared_at) : undefined,
          remarks: dto.remarks,
        },
      }),
    );
    return { success: true, data: row };
  }

  // ─── helpers ────────────────────────────────────────────────

  private async ensureOrgSeed(
    tenantId: string,
    s: { id: string; customer_id: string; shipper_id: string | null; consignee_id: string | null; notify_party_id: string | null },
  ) {
    const count = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.shipmentOrganization.count({
        where: { tenant_id: tenantId, shipment_id: s.id, deleted_at: null },
      }),
    );
    if (count > 0) return;
    const seeds: { org_type: JobPartyRole; party_id: string; primary: boolean }[] = [
      { org_type: JobPartyRole.CLIENT, party_id: s.customer_id, primary: true },
    ];
    if (s.shipper_id)
      seeds.push({
        org_type: JobPartyRole.SHIPPER,
        party_id: s.shipper_id,
        primary: false,
      });
    if (s.consignee_id)
      seeds.push({
        org_type: JobPartyRole.CONSIGNEE,
        party_id: s.consignee_id,
        primary: false,
      });
    if (s.notify_party_id)
      seeds.push({
        org_type: JobPartyRole.NOTIFY,
        party_id: s.notify_party_id,
        primary: false,
      });
    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.shipmentOrganization.createMany({
        data: seeds.map((x) => ({
          tenant_id: tenantId,
          shipment_id: s.id,
          org_type: x.org_type,
          party_id: x.party_id,
          is_primary_customer: x.primary,
        })),
        skipDuplicates: true,
      }),
    );
  }

  private async listShipmentOrgs(tenantId: string, shipmentId: string) {
    const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.shipmentOrganization.findMany({
        where: { tenant_id: tenantId, shipment_id: shipmentId, deleted_at: null },
        include: {
          party: {
            select: {
              id: true,
              code: true,
              name: true,
              short_name: true,
              party_type: true,
              address: true,
              city: true,
              country_code: true,
              phone: true,
              email: true,
              vat_number: true,
              cr_number: true,
              currency_code: true,
              is_active: true,
            },
          },
        },
        orderBy: { org_type: "asc" },
      }),
    );
    return rows.map((r) => ({
      ...r,
      party_display: (r.party_snapshot as Record<string, unknown>) ?? r.party,
    }));
  }

  private async syncShipmentFk(
    tx: Prisma.TransactionClient,
    shipmentId: string,
    orgType: JobPartyRole,
    partyId: string,
  ) {
    const data: Prisma.ShipmentUncheckedUpdateInput = {};
    if (orgType === JobPartyRole.CLIENT || orgType === JobPartyRole.BILLING_PARTY) {
      data.customer_id = partyId;
    }
    if (orgType === JobPartyRole.SHIPPER) data.shipper_id = partyId;
    if (orgType === JobPartyRole.CONSIGNEE) data.consignee_id = partyId;
    if (orgType === JobPartyRole.NOTIFY) data.notify_party_id = partyId;
    if (orgType === JobPartyRole.AGENT) data.delivery_agent_id = partyId;
    if (orgType === JobPartyRole.OVERSEAS_AGENT) {
      data.carrier_agent_id = partyId;
    }
    if (Object.keys(data).length) {
      await tx.shipment.update({ where: { id: shipmentId }, data });
    }
  }

  async updateRoutingLeg(
    tenantId: string,
    shipmentId: string,
    legId: string,
    dto: UpsertJobRoutingLegDto,
    actorId?: string,
  ) {
    const s = await this.owner(tenantId, shipmentId);
    if (s.job_id) {
      return this.jobPanels.updateRoutingLeg(
        tenantId,
        s.job_id,
        legId,
        dto,
        actorId,
      );
    }
    const row = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const leg = await tx.shipmentRoutingLeg.findFirst({
        where: {
          id: legId,
          shipment_id: shipmentId,
          tenant_id: tenantId,
          deleted_at: null,
        },
      });
      if (!leg) throw new NotFoundException("Routing leg not found.");
      return tx.shipmentRoutingLeg.update({
        where: { id: legId },
        data: {
          ...(dto.leg_sequence !== undefined
            ? { leg_sequence: dto.leg_sequence }
            : {}),
          ...(dto.transport_mode !== undefined
            ? { transport_mode: dto.transport_mode }
            : {}),
          ...(dto.port_id !== undefined ? { port_id: dto.port_id } : {}),
          ...(dto.origin_port_id !== undefined
            ? { origin_port_id: dto.origin_port_id }
            : {}),
          ...(dto.dest_port_id !== undefined
            ? { dest_port_id: dto.dest_port_id }
            : {}),
          ...(dto.etd !== undefined
            ? { etd: dto.etd ? new Date(dto.etd) : null }
            : {}),
          ...(dto.eta !== undefined
            ? { eta: dto.eta ? new Date(dto.eta) : null }
            : {}),
          ...(dto.carrier_id !== undefined ? { carrier_id: dto.carrier_id } : {}),
          ...(dto.vessel_name !== undefined
            ? { vessel_name: dto.vessel_name }
            : {}),
          ...(dto.voyage_number !== undefined
            ? { voyage_number: dto.voyage_number }
            : {}),
        },
      });
    });
    return { success: true, data: row };
  }

  private async recalcShipmentTotals(
    tx: Prisma.TransactionClient,
    tenantId: string,
    shipmentId: string,
  ) {
    const charges = await tx.shipmentCharge.findMany({
      where: { tenant_id: tenantId, shipment_id: shipmentId, deleted_at: null },
    });
    let revenue = 0;
    let cost = 0;
    for (const c of charges) {
      if (c.sale_amount != null) {
        revenue += Number(c.sale_amount) * Number(c.sale_ex_rate ?? 1);
      } else if (!c.is_cost) {
        revenue += Number(c.amount_base_currency);
      }
      if (c.cost_amount != null) {
        cost += Number(c.cost_amount) * Number(c.cost_ex_rate ?? 1);
      } else if (c.is_cost) {
        cost += Number(c.amount_base_currency);
      }
    }
    const gp = revenue - cost;
    await tx.shipment.update({
      where: { id: shipmentId },
      data: {
        revenue_total: revenue,
        cost_total: cost,
        gp_amount: gp,
        gp_percent: revenue > 0 ? (gp / revenue) * 100 : 0,
      },
    });
  }
}
