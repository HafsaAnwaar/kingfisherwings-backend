import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { DocumentationEdiService } from "../documentation/documentation-edi.service";
import {
  ediTypeLabel,
  eligibleEdiTypes,
} from "../jobs/utils/edi-eligibility.util";
import { GenerateShipmentEdiDto } from "./dto/shipment-edi.dto";

/**
 * Fresa Generate EDI on Shipment/Job — same steps as job facade:
 * pick type → generate → download. Payload is built from the linked job
 * (documentation EDI is job-referenced).
 */
@Injectable()
export class ShipmentEdiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly edi: DocumentationEdiService,
  ) {}

  async listTypes(tenantId: string, shipmentId: string) {
    const ctx = await this.resolveContext(tenantId, shipmentId);
    const types = eligibleEdiTypes(ctx.jobType, ctx.isHouse);
    return {
      success: true,
      data: {
        shipment_id: shipmentId,
        job_id: ctx.jobId,
        job_type: ctx.jobType,
        is_house: ctx.isHouse,
        edi_types: types.map((edi_type) => ({
          edi_type,
          label: ediTypeLabel(edi_type),
        })),
      },
    };
  }

  eligibleTypesForShipment(
    jobType: Parameters<typeof eligibleEdiTypes>[0],
    isHouse: boolean,
  ) {
    return eligibleEdiTypes(jobType, isHouse);
  }

  async generate(
    tenantId: string,
    shipmentId: string,
    dto: GenerateShipmentEdiDto,
    actorId?: string,
  ) {
    const ctx = await this.resolveContext(tenantId, shipmentId, true);
    const allowed = eligibleEdiTypes(ctx.jobType, ctx.isHouse);
    if (!allowed.includes(dto.edi_type)) {
      throw new BadRequestException(
        `EDI type ${dto.edi_type} is not eligible for this shipment (${ctx.jobType}).`,
      );
    }
    const submission = await this.edi.generate(
      tenantId,
      dto.edi_type,
      ctx.jobId!,
      actorId,
      "JOB",
      { company_codes: dto.company_codes },
    );
    return {
      success: true,
      data: {
        ...submission,
        shipment_id: shipmentId,
        job_id: ctx.jobId,
        download: `/shipments/${shipmentId}/edi/submissions/${submission.id}/download`,
        mime_type: "application/pdf",
        filename: `${dto.edi_type.toLowerCase()}-${shipmentId.slice(0, 8)}.pdf`,
      },
    };
  }

  async listSubmissions(tenantId: string, shipmentId: string) {
    const ctx = await this.resolveContext(tenantId, shipmentId, true);
    const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.documentationEdiSubmission.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          OR: [
            {
              reference_type: "JOB",
              reference_id: ctx.jobId!,
            },
            {
              reference_type: "SHIPMENT",
              reference_id: shipmentId,
            },
          ],
        },
        orderBy: { created_at: "desc" },
        take: 100,
      }),
    );
    return {
      success: true,
      data: rows.map((row) => ({
        ...row,
        download: `/shipments/${shipmentId}/edi/submissions/${row.id}/download`,
        mime_type: "application/pdf",
      })),
    };
  }

  async download(
    tenantId: string,
    shipmentId: string,
    submissionId: string,
    res: import("express").Response,
  ) {
    const ctx = await this.resolveContext(tenantId, shipmentId, true);
    const submission = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.documentationEdiSubmission.findFirst({
        where: {
          id: submissionId,
          tenant_id: tenantId,
          deleted_at: null,
          OR: [
            { reference_type: "JOB", reference_id: ctx.jobId! },
            { reference_type: "SHIPMENT", reference_id: shipmentId },
          ],
        },
      }),
    );
    if (!submission) {
      throw new NotFoundException(
        "EDI submission not found for this shipment.",
      );
    }
    return this.edi.streamFile(tenantId, submissionId, res);
  }

  private async resolveContext(
    tenantId: string,
    shipmentId: string,
    requireJob = false,
  ) {
    const shipment = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.shipment.findFirst({
        where: { id: shipmentId, tenant_id: tenantId, deleted_at: null },
        select: {
          id: true,
          job_type: true,
          job_id: true,
          job: {
            select: { id: true, job_type: true, parent_job_id: true },
          },
        },
      }),
    );
    if (!shipment) throw new NotFoundException("Shipment not found.");

    if (requireJob && !shipment.job_id) {
      throw new BadRequestException(
        "Generate or attach a job before generating EDI on this shipment.",
      );
    }

    const jobType = shipment.job?.job_type ?? shipment.job_type;
    const isHouse = !!shipment.job?.parent_job_id;

    return {
      jobId: shipment.job_id,
      jobType,
      isHouse,
    };
  }
}
