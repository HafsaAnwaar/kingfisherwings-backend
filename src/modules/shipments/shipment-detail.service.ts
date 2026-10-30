import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from "@nestjs/common";
import {
  DocumentType,
  JobContainerKind,
  JobType,
  Prisma,
} from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { ShipmentsService } from "./shipments.service";
import { JobsService } from "../jobs/jobs.service";
import { DocumentationEdiService } from "../documentation/documentation-edi.service";
import { GenerateJobDocumentDto } from "../jobs/dto/generate-job-document.dto";
import {
  ChangeShipmentBlStatusDto,
  MergeShipmentsDto,
  SplitShipmentDto,
} from "./dto/shipment-detail.dto";
import { PatchShowAllDto } from "../jobs/dto/job-detail.dto";
import { CreateSubJobDto } from "../jobs/dto/week4-6-ops.dto";
import { ShipmentTabParityService } from "./shipment-tab-parity.service";
import {
  PatchJobDepartmentDto,
  UpsertJobRoutingLegDto,
} from "../jobs/dto/job-tab-panels.dto";
import { JobLookupsService } from "../jobs/job-lookups.service";
import {
  opsContinuumActions,
  opsContinuumPathHints,
} from "../ops-activity/ops-continuum-path-hints";
import { eligibleEdiTypes } from "../jobs/utils/edi-eligibility.util";
import { EntityTimelineService } from "../ops-activity/entity-timeline.service";
import { MasterLabelService } from "../masters/master-label.service";
import { TrackService } from "../track/track.service";

const DETAIL_TABS = [
  "show_all",
  "info",
  "organization",
  "dimensions",
  "planned_container",
  "actual_container",
  "ex_rate",
  "costing",
  "department",
  "shipping_bill_boe",
  "routing",
  "customs",
  "history",
] as const;

const AIR_JOB_TYPES: JobType[] = ["AIR_EXPORT", "AIR_IMPORT"];

@Injectable()
export class ShipmentDetailService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly shipments: ShipmentsService,
    @Inject(forwardRef(() => JobsService))
    private readonly jobs: JobsService,
    private readonly edi: DocumentationEdiService,
    private readonly tabParity: ShipmentTabParityService,
    private readonly timeline: EntityTimelineService,
    private readonly labels: MasterLabelService,
    private readonly track: TrackService,
    private readonly lookups: JobLookupsService,
  ) {}

  async getDetail(tenantId: string, id: string) {
    const shipment = await this.loadShipment(tenantId, id);
    const links = await this.resolveLinks(tenantId, shipment);
    return {
      success: true,
      data: {
        shipment: await this.headerPayload(
          tenantId,
          shipment,
          links.job?.job_number ?? null,
        ),
        links,
        actions: this.actionFlags(shipment),
        sections: await this.sectionSummaries(tenantId, shipment),
        tabs: DETAIL_TABS,
      },
    };
  }

  async getDetailTab(tenantId: string, id: string, tab: string) {
    const normalized = tab.toLowerCase();
    if (!DETAIL_TABS.includes(normalized as (typeof DETAIL_TABS)[number])) {
      throw new BadRequestException(
        `Unknown tab "${tab}". Allowed: ${DETAIL_TABS.join(", ")}`,
      );
    }
    const shipment = await this.loadShipment(tenantId, id);

    if (normalized === "show_all" || normalized === "info") {
      const links = await this.resolveLinks(tenantId, shipment);
      return {
        success: true,
        data: await this.headerPayload(
          tenantId,
          shipment,
          links.job?.job_number ?? null,
        ),
      };
    }
    if (normalized === "organization") {
      return this.tabParity.getOrganization(tenantId, id);
    }
    if (normalized === "dimensions") {
      return this.tabParity.getDimensions(tenantId, id);
    }
    if (normalized === "costing") {
      return this.tabParity.getCosting(tenantId, id);
    }
    if (normalized === "department") {
      return this.tabParity.getDepartment(tenantId, id);
    }
    if (normalized === "planned_container") {
      return this.tabParity.getContainers(
        tenantId,
        id,
        JobContainerKind.PLANNED,
      );
    }
    if (normalized === "actual_container") {
      return this.tabParity.getContainers(
        tenantId,
        id,
        JobContainerKind.ACTUAL,
      );
    }
    if (normalized === "ex_rate") {
      return this.tabParity.getExRate(tenantId, id);
    }
    if (normalized === "routing") {
      return this.tabParity.getRouting(tenantId, id);
    }
    if (normalized === "customs" || normalized === "shipping_bill_boe") {
      return this.tabParity.getCustoms(tenantId, id);
    }
    if (normalized === "history") {
      return this.history(tenantId, id);
    }
    return { success: true, data: {} };
  }

  async history(tenantId: string, id: string) {
    return this.timeline.getTimeline(tenantId, "SHIPMENT", id);
  }

  async patchShowAll(
    tenantId: string,
    id: string,
    dto: PatchShowAllDto,
    actorId?: string,
  ) {
    const shipment = await this.loadShipment(tenantId, id);
    if (shipment.status === "CANCELLED") {
      throw new BadRequestException("Cannot edit a CANCELLED shipment.");
    }

    const hasField =
      dto.commodity !== undefined ||
      dto.pieces !== undefined ||
      dto.gross_weight !== undefined ||
      dto.volume_cbm !== undefined ||
      dto.etd !== undefined ||
      dto.eta !== undefined ||
      dto.job_date !== undefined ||
      dto.mbl_number !== undefined ||
      dto.hbl_number !== undefined ||
      dto.origin_port_name !== undefined ||
      dto.origin_port_code !== undefined ||
      dto.dest_port_name !== undefined ||
      dto.dest_port_code !== undefined ||
      dto.shipper_name !== undefined ||
      dto.shipper_code !== undefined ||
      dto.consignee_name !== undefined ||
      dto.consignee_code !== undefined ||
      dto.billing_party_name !== undefined ||
      dto.billing_party_code !== undefined ||
      dto.customer_name !== undefined ||
      dto.customer_code !== undefined ||
      dto.carrier_name !== undefined ||
      dto.carrier_code !== undefined ||
      dto.agent_name !== undefined ||
      dto.agent_code !== undefined;
    if (!hasField) {
      throw new BadRequestException(
        "Provide at least one show_all field to update.",
      );
    }

    await this.prisma.runWithTenant(tenantId, async (tx) => {
      const originPortId = await this.lookups.resolvePort(tx, tenantId, {
        name: dto.origin_port_name,
        code: dto.origin_port_code,
      });
      const destPortId = await this.lookups.resolvePort(tx, tenantId, {
        name: dto.dest_port_name,
        code: dto.dest_port_code,
      });
      const shipperId = await this.lookups.resolveParty(tx, tenantId, {
        name: dto.shipper_name,
        code: dto.shipper_code,
        label: "shipper",
      });
      const consigneeId = await this.lookups.resolveParty(tx, tenantId, {
        name: dto.consignee_name,
        code: dto.consignee_code,
        label: "consignee",
      });
      const customerId = await this.lookups.resolveParty(tx, tenantId, {
        name: dto.customer_name ?? dto.billing_party_name,
        code: dto.customer_code ?? dto.billing_party_code,
        label: "customer",
      });
      const carrierId = await this.lookups.resolveParty(tx, tenantId, {
        name: dto.carrier_name,
        code: dto.carrier_code,
        label: "carrier",
      });
      const agentId = await this.lookups.resolveParty(tx, tenantId, {
        name: dto.agent_name,
        code: dto.agent_code,
        label: "agent",
      });

      await tx.shipment.update({
        where: { id },
        data: {
          ...(dto.commodity !== undefined ? { commodity: dto.commodity } : {}),
          ...(dto.pieces !== undefined ? { pieces: dto.pieces } : {}),
          ...(dto.gross_weight !== undefined
            ? { gross_weight: dto.gross_weight }
            : {}),
          ...(dto.volume_cbm !== undefined
            ? { volume_cbm: dto.volume_cbm }
            : {}),
          ...(dto.etd !== undefined
            ? { etd: dto.etd ? new Date(dto.etd) : null }
            : {}),
          ...(dto.eta !== undefined
            ? { eta: dto.eta ? new Date(dto.eta) : null }
            : {}),
          ...(dto.job_date !== undefined
            ? {
                shipment_date: dto.job_date ? new Date(dto.job_date) : null,
              }
            : {}),
          ...(dto.mbl_number !== undefined
            ? { mbl_number: dto.mbl_number }
            : {}),
          ...(dto.hbl_number !== undefined
            ? { hbl_number: dto.hbl_number }
            : {}),
          ...(originPortId !== undefined
            ? { origin_port_id: originPortId }
            : {}),
          ...(destPortId !== undefined ? { dest_port_id: destPortId } : {}),
          ...(shipperId !== undefined ? { shipper_id: shipperId } : {}),
          ...(consigneeId !== undefined ? { consignee_id: consigneeId } : {}),
          ...(customerId !== undefined ? { customer_id: customerId } : {}),
          ...(carrierId !== undefined ? { carrier_id: carrierId } : {}),
          ...(agentId !== undefined ? { delivery_agent_id: agentId } : {}),
          updated_by: actorId,
        },
      });

      await tx.auditLog.create({
        data: {
          tenant_id: tenantId,
          user_id: actorId ?? null,
          action: "SHIPMENT_SHOW_ALL_PATCH",
          entity: "SHIPMENT",
          entity_id: id,
          metadata: { fields: Object.keys(dto) } as Prisma.InputJsonValue,
        },
      });
    });

    const refreshed = await this.loadShipment(tenantId, id);
    const links = await this.resolveLinks(tenantId, refreshed);
    return {
      success: true,
      data: await this.headerPayload(
        tenantId,
        refreshed,
        links.job?.job_number ?? null,
      ),
    };
  }

  createRoutingLeg(
    tenantId: string,
    shipmentId: string,
    dto: UpsertJobRoutingLegDto,
    actorId?: string,
  ) {
    return this.tabParity.createRoutingLeg(tenantId, shipmentId, dto, actorId);
  }

  updateRoutingLeg(
    tenantId: string,
    shipmentId: string,
    legId: string,
    dto: UpsertJobRoutingLegDto,
    actorId?: string,
  ) {
    return this.tabParity.updateRoutingLeg(
      tenantId,
      shipmentId,
      legId,
      dto,
      actorId,
    );
  }

  async changeBlStatus(
    tenantId: string,
    id: string,
    dto: ChangeShipmentBlStatusDto,
    actorId?: string,
  ) {
    const current = await this.shipments.findOne(tenantId, id);
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const updated = await tx.shipment.update({
        where: { id },
        data: {
          bl_status: dto.bl_status,
          ...(dto.hbl_number !== undefined ? { hbl_number: dto.hbl_number } : {}),
          ...(dto.hbl_date !== undefined
            ? { hbl_date: dto.hbl_date ? new Date(dto.hbl_date) : null }
            : {}),
          updated_by: actorId,
        },
      });
      await tx.auditLog.create({
        data: {
          tenant_id: tenantId,
          user_id: actorId ?? null,
          action: "SHIPMENT_BL_STATUS_CHANGE",
          entity: "SHIPMENT",
          entity_id: id,
          old_values: { bl_status: current.bl_status },
          new_values: {
            bl_status: dto.bl_status,
            hbl_number: dto.hbl_number ?? null,
          },
          metadata: {
            from_status: current.bl_status,
            to_status: dto.bl_status,
          },
        },
      });
      return updated;
    });
  }

  async changeDepartment(
    tenantId: string,
    id: string,
    dto: PatchJobDepartmentDto,
    actorId?: string,
  ) {
    return this.tabParity.patchDepartment(tenantId, id, dto, actorId);
  }

  async split(
    tenantId: string,
    id: string,
    dto: SplitShipmentDto,
    actorId?: string,
  ) {
    const source = await this.loadShipment(tenantId, id);
    const chargeFilter = dto.charge_ids?.length
      ? source.charges.filter((c) => dto.charge_ids!.includes(c.id))
      : source.charges.filter((c) => !c.is_cost);

    const copy = await this.shipments.copy(
      tenantId,
      id,
      { copy_sale: false, copy_parties: true },
      actorId,
    );

    if (chargeFilter.length) {
      await this.prisma.runWithTenant(tenantId, async (tx) => {
        await tx.shipmentCharge.createMany({
          data: chargeFilter.map((c, i) => ({
            tenant_id: tenantId,
            shipment_id: copy.id,
            charge_code_id: c.charge_code_id,
            description: c.description,
            quantity: c.quantity,
            unit_price: c.unit_price,
            currency_code: c.currency_code,
            exchange_rate: c.exchange_rate,
            amount: c.amount,
            amount_base_currency: c.amount_base_currency,
            tax_rate_id: c.tax_rate_id,
            tax_amount: c.tax_amount,
            is_cost: c.is_cost,
            party_id: c.party_id,
            sort_order: i,
            created_by: actorId,
            updated_by: actorId,
          })),
        });
        await tx.shipmentSplitLink.create({
          data: {
            tenant_id: tenantId,
            parent_shipment_id: id,
            child_shipment_id: copy.id,
            link_type: "SPLIT",
            created_by: actorId,
          },
        });
      });
    }

    return { success: true, data: { parent_id: id, child: copy } };
  }

  async merge(
    tenantId: string,
    id: string,
    dto: MergeShipmentsDto,
    actorId?: string,
  ) {
    await this.loadShipment(tenantId, id);
    const sources = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.shipment.findMany({
        where: {
          tenant_id: tenantId,
          id: { in: dto.source_shipment_ids },
          deleted_at: null,
        },
        include: {
          charges: { where: { deleted_at: null } },
        },
      }),
    );
    if (sources.length !== dto.source_shipment_ids.length) {
      throw new BadRequestException("One or more source shipments not found.");
    }

    await this.prisma.runWithTenant(tenantId, async (tx) => {
      for (const src of sources) {
        if (src.id === id) continue;
        for (const c of src.charges) {
          await tx.shipmentCharge.create({
            data: {
              tenant_id: tenantId,
              shipment_id: id,
              charge_code_id: c.charge_code_id,
              description: c.description,
              quantity: c.quantity,
              unit_price: c.unit_price,
              currency_code: c.currency_code,
              exchange_rate: c.exchange_rate,
              amount: c.amount,
              amount_base_currency: c.amount_base_currency,
              tax_rate_id: c.tax_rate_id,
              tax_amount: c.tax_amount,
              is_cost: c.is_cost,
              party_id: c.party_id,
              created_by: actorId,
              updated_by: actorId,
            },
          });
        }
        await tx.shipment.update({
          where: { id: src.id },
          data: { status: "CANCELLED", updated_by: actorId },
        });
        await tx.shipmentSplitLink.create({
          data: {
            tenant_id: tenantId,
            parent_shipment_id: id,
            child_shipment_id: src.id,
            link_type: "MERGE",
            created_by: actorId,
          },
        });
      }
    });

    return { success: true, data: await this.loadShipment(tenantId, id) };
  }

  switchBl(
    tenantId: string,
    id: string,
    dto: GenerateJobDocumentDto,
    actorId?: string,
  ) {
    return this.shipments.generateLinkedJobDocument(
      tenantId,
      id,
      "SWITCH_BL" as DocumentType,
      dto,
      actorId,
    );
  }

  async runEdiAction(
    tenantId: string,
    id: string,
    action: string,
    actorId?: string,
  ) {
    const shipment = await this.loadShipment(tenantId, id);
    const jobId = this.requireJobId(shipment);
    const a = action.toLowerCase().replace(/_/g, "-");

    if (a === "bayan-generate") {
      return this.edi.generate(tenantId, "BAYAN_MASTER", jobId, actorId);
    }
    if (a === "bayan-submit") {
      const gen = await this.edi.generate(
        tenantId,
        "BAYAN_MASTER",
        jobId,
        actorId,
      );
      return this.edi.submit(tenantId, gen.id, actorId);
    }
    if (a === "ccn-fwb") {
      return this.edi.generate(tenantId, "CCN_FWB", jobId, actorId);
    }
    if (a === "ccn-submit") {
      const gen = await this.edi.generate(tenantId, "CCN_FWB", jobId, actorId);
      return this.edi.submit(tenantId, gen.id, actorId);
    }
    if (a === "eqo-dubai-generate") {
      return this.edi.generate(tenantId, "EQO_DUBAI", jobId, actorId);
    }
    throw new BadRequestException(`Unknown EDI action "${action}".`);
  }

  async createSubmaster(
    tenantId: string,
    id: string,
    dto: CreateSubJobDto,
    actorId?: string,
  ) {
    const shipment = await this.loadShipment(tenantId, id);
    if (!shipment.job_id) {
      const job = await this.shipments.generateJob(
        tenantId,
        id,
        { mode: "DIRECT" },
        actorId,
      );
      return {
        success: true,
        data: {
          job_id: job.jobId,
          created: "master_from_shipment",
        },
      };
    }
    const sub = await this.jobs.createSubJob(
      tenantId,
      shipment.job_id,
      dto,
      actorId,
    );
    return { success: true, data: sub };
  }

  async kpi(tenantId: string, id: string) {
    const shipment = await this.loadShipment(tenantId, id);
    if (shipment.job_id) {
      const scans = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.jobSeaScan.count({
          where: { tenant_id: tenantId, job_id: shipment.job_id! },
        }),
      );
      return {
        success: true,
        data: {
          source: "job",
          job_id: shipment.job_id,
          sea_scan_count: scans,
        },
      };
    }
    const etdSlip =
      shipment.etd && shipment.etd < new Date() && shipment.status !== "COMPLETED";
    return {
      success: true,
      data: {
        source: "shipment",
        status: shipment.status,
        etd_slip: !!etdSlip,
      },
    };
  }

  async listBillsOfLading(tenantId: string, id: string) {
    const shipment = await this.loadShipment(tenantId, id);
    if (shipment.job_id) {
      return this.jobs.listBillsOfLading(tenantId, shipment.job_id);
    }
    return {
      success: true,
      data: {
        draft: {
          hbl_number: shipment.hbl_number,
          hbl_date: shipment.hbl_date,
          bl_status: shipment.bl_status,
          mbl_number: shipment.mbl_number,
          mbl_date: shipment.mbl_date,
        },
      },
    };
  }

  async awb(tenantId: string, id: string) {
    const shipment = await this.loadShipment(tenantId, id);
    if (!shipment.job_id || !AIR_JOB_TYPES.includes(shipment.job_type)) {
      throw new BadRequestException(
        "AWB requires an air shipment with a linked job.",
      );
    }
    const details = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.airJobDetail.findFirst({
        where: { tenant_id: tenantId, job_id: shipment.job_id! },
      }),
    );
    return { success: true, data: { job_id: shipment.job_id, air: details } };
  }

  async tracking(tenantId: string, id: string) {
    const shipment = await this.loadShipment(tenantId, id);
    if (!shipment.job_id) {
      return {
        success: true,
        data: {
          tracking_token: null,
          public_url: null,
          job_id: null,
          history: [],
          summary: null,
          message: "No linked job yet — track timeline unavailable.",
        },
      };
    }
    const result = await this.track.trackByJobId(tenantId, shipment.job_id, {
      shipmentId: shipment.id,
      includeNotes: true,
    });
    return {
      success: true,
      data: {
        ...result.data,
        shipment_id: shipment.id,
        shipment_number: shipment.shipment_number,
      },
    };
  }

  private requireJobId(shipment: { job_id: string | null }) {
    if (!shipment.job_id) {
      throw new BadRequestException(
        "Link or generate a Job before using this action.",
      );
    }
    return shipment.job_id;
  }

  private async loadShipment(tenantId: string, id: string) {
    const row = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.shipment.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
        include: {
          charges: { where: { deleted_at: null }, orderBy: { sort_order: "asc" } },
          quotation: {
            select: { id: true, quotation_number: true, source_enquiry_id: true },
          },
        },
      }),
    );
    if (!row) throw new NotFoundException("Shipment not found.");
    return row;
  }

  private async headerPayload(
    tenantId: string,
    shipment: Awaited<ReturnType<typeof this.loadShipment>>,
    jobNumber?: string | null,
  ) {
    return this.labels.enrichOne(tenantId, {
      id: shipment.id,
      shipment_number: shipment.shipment_number,
      shipment_date: shipment.shipment_date,
      job_date: shipment.shipment_date,
      status: shipment.status,
      job_type: shipment.job_type,
      company_id: shipment.company_id,
      branch_id: shipment.branch_id,
      department_id: shipment.department_id,
      salesperson_id: shipment.salesperson_id,
      customer_id: shipment.customer_id,
      shipper_id: shipment.shipper_id,
      consignee_id: shipment.consignee_id,
      carrier_id: shipment.carrier_id,
      customer_address: shipment.customer_address,
      freight_terms: shipment.freight_terms,
      freight_payable_at: shipment.freight_payable_at,
      freight_payment_type: shipment.freight_payment_type,
      bl_status: shipment.bl_status,
      por_port_id: shipment.por_port_id,
      origin_port_id: shipment.origin_port_id,
      dest_port_id: shipment.dest_port_id,
      pof_port_id: shipment.pof_port_id,
      place_of_delivery: shipment.place_of_delivery,
      mbl_number: shipment.mbl_number,
      mbl_date: shipment.mbl_date,
      hbl_number: shipment.hbl_number,
      hbl_date: shipment.hbl_date,
      is_cross_trade: shipment.is_cross_trade,
      marks_numbers: shipment.marks_numbers,
      commodity: shipment.commodity,
      pieces: shipment.pieces,
      gross_weight: shipment.gross_weight,
      volume_cbm: shipment.volume_cbm,
      etd: shipment.etd,
      eta: shipment.eta,
      vessel_name: shipment.vessel_name,
      voyage_number: shipment.voyage_number,
      job_id: shipment.job_id,
      job_number: jobNumber ?? null,
      quotation: shipment.quotation
        ? {
            id: shipment.quotation.id,
            quotation_number: shipment.quotation.quotation_number,
          }
        : null,
      enquiry_id: shipment.enquiry_id,
    });
  }

  private actionFlags(shipment: Awaited<ReturnType<typeof this.loadShipment>>) {
    const hasJob = !!shipment.job_id;
    const isAir = AIR_JOB_TYPES.includes(shipment.job_type);
    // House flag needs linked job; without job treat as master for type list.
    const ediTypes = eligibleEdiTypes(shipment.job_type, false);
    return {
      can_copy: true,
      can_generate_job:
        !hasJob &&
        (shipment.status === "CONFIRMED" || shipment.status === "APPROVED"),
      can_confirm_shipment: !hasJob && shipment.status === "BOOKED",
      generate_job_requires_status: ["CONFIRMED", "APPROVED"] as const,
      generate_job_modes: ["DIRECT", "HOUSE"] as const,
      default_generate_mode: "DIRECT" as const,
      can_change_status: shipment.status !== "CANCELLED",
      can_change_bl_status: true,
      can_change_department: true,
      can_split: shipment.status !== "CANCELLED",
      can_merge: shipment.status !== "CANCELLED",
      can_switch_bl: hasJob,
      can_edi: hasJob && ediTypes.length > 0,
      edi_types: hasJob ? ediTypes : [],
      can_create_submaster: true,
      can_kpi: true,
      can_bl_entry: hasJob,
      can_awb: hasJob && isAir,
      can_track: hasJob,
      can_booking_form: true,
      ...opsContinuumActions(),
      path_hints: {
        ops_continuum: opsContinuumPathHints("SHIPMENT", shipment.id),
        favourite_toggle: `/favourites/toggle`,
        edi_types: `/shipments/${shipment.id}/edi/types`,
        edi_generate: `/shipments/${shipment.id}/edi/generate`,
        edi_submissions: `/shipments/${shipment.id}/edi/submissions`,
        edi_legacy_action: `/shipments/${shipment.id}/edi/:action`,
        ...(isAir
          ? {
              awb_draft_preview: `/shipments/${shipment.id}/awb-draft/preview`,
              hawb_draft_preview: `/shipments/${shipment.id}/hawb-draft/preview`,
              hawb_draft_generate: `/shipments/${shipment.id}/hawb-draft/generate`,
              mawb_draft_generate: `/shipments/${shipment.id}/mawb-draft/generate`,
            }
          : {}),
        ...(!hasJob &&
        (shipment.status === "CONFIRMED" || shipment.status === "APPROVED")
          ? { generate_job: `/shipments/${shipment.id}/generate-job` }
          : {}),
      },
    };
  }

  private async sectionSummaries(
    tenantId: string,
    shipment: Awaited<ReturnType<typeof this.loadShipment>>,
  ) {
    const [plans, legs] = await Promise.all([
      this.plannedContainers(tenantId, shipment),
      this.routingLegs(tenantId, shipment),
    ]);
    return {
      costing: { charge_count: shipment.charges.length },
      planned_container: { count: Array.isArray(plans) ? plans.length : 0 },
      routing: { leg_count: Array.isArray(legs) ? legs.length : 0 },
    };
  }

  private async resolveLinks(
    tenantId: string,
    shipment: Awaited<ReturnType<typeof this.loadShipment>>,
  ) {
    let enquiry: { id: string; path_hint: string } | null = null;
    const enquiryId =
      shipment.enquiry_id ?? shipment.quotation?.source_enquiry_id ?? null;
    if (enquiryId) {
      enquiry = {
        id: enquiryId,
        path_hint: `/crm/enquiries/${enquiryId}/detail`,
      };
    }
    const quotation = shipment.quotation
      ? {
          id: shipment.quotation.id,
          quotation_number: shipment.quotation.quotation_number,
          path_hint: `/quotations/${shipment.quotation.id}/detail`,
        }
      : null;
    let job: {
      id: string;
      job_number: string;
      path_hint: string;
    } | null = null;
    if (shipment.job_id) {
      const row = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.job.findFirst({
          where: { id: shipment.job_id!, tenant_id: tenantId },
          select: { id: true, job_number: true },
        }),
      );
      if (row) {
        job = {
          id: row.id,
          job_number: row.job_number,
          path_hint: `/jobs/${row.id}/detail`,
        };
      }
    }
    return { enquiry, quotation, job };
  }

  private async plannedContainers(
    tenantId: string,
    shipment: Awaited<ReturnType<typeof this.loadShipment>>,
  ) {
    const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.shipmentContainerPlan.findMany({
        where: {
          tenant_id: tenantId,
          shipment_id: shipment.id,
          deleted_at: null,
        },
        orderBy: { sort_order: "asc" },
      }),
    );
    if (rows.length) return rows;
    if (!shipment.job_id) return [];
    return this.jobContainersForJob(tenantId, shipment.job_id);
  }

  private async actualContainers(
    tenantId: string,
    shipment: Awaited<ReturnType<typeof this.loadShipment>>,
  ) {
    const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.shipmentContainerActual.findMany({
        where: {
          tenant_id: tenantId,
          shipment_id: shipment.id,
          deleted_at: null,
        },
        orderBy: { sort_order: "asc" },
      }),
    );
    if (rows.length) return rows;
    if (!shipment.job_id) return [];
    return this.jobContainersForJob(tenantId, shipment.job_id);
  }

  private async jobContainersForJob(tenantId: string, jobId: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const detail = await tx.seaFclJobDetail.findFirst({
        where: { tenant_id: tenantId, job_id: jobId },
        select: { id: true },
      });
      if (!detail) return [];
      return tx.jobContainer.findMany({
        where: {
          tenant_id: tenantId,
          sea_fcl_detail_id: detail.id,
          deleted_at: null,
        },
        orderBy: { created_at: "asc" },
      });
    });
  }

  private async routingLegs(
    tenantId: string,
    shipment: Awaited<ReturnType<typeof this.loadShipment>>,
  ) {
    const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.shipmentRoutingLeg.findMany({
        where: {
          tenant_id: tenantId,
          shipment_id: shipment.id,
          deleted_at: null,
        },
        orderBy: { leg_sequence: "asc" },
      }),
    );
    if (rows.length) return rows;
    if (!shipment.job_id) {
      return shipment.origin_port_id || shipment.dest_port_id
        ? [
            {
              leg_sequence: 1,
              port_id: shipment.origin_port_id,
              etd: shipment.etd,
              eta: shipment.eta,
              vessel_name: shipment.vessel_name,
              voyage_number: shipment.voyage_number,
            },
          ]
        : [];
    }
    return [];
  }
}
