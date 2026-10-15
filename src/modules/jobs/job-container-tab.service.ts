import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  ContainerStatus,
  JobContainerKind,
  Prisma,
} from "@prisma/client";
import { parse as parseCsv } from "csv-parse/sync";
import * as ExcelJS from "exceljs";
import { PrismaService } from "../../prisma/prisma.service";
import {
  BulkJobContainersDto,
  ConfirmContainerUploadDto,
  CreateJobContainerDto,
  PasteContainerUploadDto,
  PushContainersToSubJobsDto,
  SyncContainersFromSubJobsDto,
  UpdateJobContainerDto,
  UpdateJobDetailsFromContainerTabDto,
} from "./dto/job-container.dto";

const SAMPLE_HEADERS = [
  "line_no",
  "container_kind",
  "container_type_code",
  "container_number",
  "seal_number",
  "actual_seal",
  "hs_code",
  "packages",
  "gross_weight",
  "net_weight",
  "volume_weight",
  "cbm",
  "chargeable_units",
  "status",
  "is_soc",
] as const;

@Injectable()
export class JobContainerTabService {
  constructor(private readonly prisma: PrismaService) {}

  async getTab(
    tenantId: string,
    jobId: string,
    kind?: JobContainerKind,
  ) {
    await this.assertJob(tenantId, jobId);
    const containers = await this.listMapped(tenantId, jobId, kind);
    const freeDays = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.containerFreeDays.findMany({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
        select: { container_id: true, demurrage_accrued: true, detention_accrued: true },
      }),
    );
    const storageByContainer = new Map(
      freeDays.map((f) => [
        f.container_id,
        {
          demurrage_accrued: f.demurrage_accrued,
          detention_accrued: f.detention_accrued,
          has_storage_charges: true,
        },
      ]),
    );

    return {
      success: true,
      data: {
        containers: containers.map((c) => ({
          ...c,
          storage_charges: storageByContainer.get(c.id) ?? {
            has_storage_charges: false,
          },
        })),
        actions: {
          view: true,
          update_job_details: true,
          storage_charges: true,
          upload: true,
          multiple_update: true,
          add: true,
          sync_from_sub_jobs: true,
          push_to_sub_jobs: true,
          export: true,
        },
        path_hints: {
          sync_from_sub_jobs: `/jobs/${jobId}/containers/sync-from-sub-jobs`,
          push_to_sub_jobs: `/jobs/${jobId}/containers/push-to-sub-jobs`,
        },
      },
    };
  }

  async list(tenantId: string, jobId: string, kind?: JobContainerKind) {
    await this.assertJob(tenantId, jobId);
    return {
      success: true,
      data: await this.listMapped(tenantId, jobId, kind),
    };
  }

  async getOne(tenantId: string, jobId: string, containerId: string) {
    const row = await this.getOrThrow(tenantId, jobId, containerId);
    return { success: true, data: await this.enrichOne(tenantId, row) };
  }

  async add(
    tenantId: string,
    jobId: string,
    dto: CreateJobContainerDto,
    actorId?: string,
  ) {
    const job = await this.assertJob(tenantId, jobId);
    if (!dto.container_type_id) {
      throw new BadRequestException("container_type_id is required.");
    }
    const type = await this.assertContainerType(
      tenantId,
      dto.container_type_id,
    );
    const seaFcl = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.seaFclJobDetail.findFirst({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
        select: { id: true },
      }),
    );

    const warnings: string[] = [];
    if (dto.container_number) {
      const dup = await this.findDuplicateNumber(
        tenantId,
        dto.container_number,
        jobId,
      );
      if (dup) {
        warnings.push(
          `Container number ${dto.container_number} already used on job ${dup.job_number}.`,
        );
      }
    }

    const lineNo =
      dto.line_no ??
      (await this.nextLineNo(tenantId, jobId, dto.container_kind));

    const row = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const created = await tx.jobContainer.create({
        data: {
          tenant_id: tenantId,
          job_id: jobId,
          sea_fcl_detail_id: seaFcl?.id ?? null,
          container_type_id: dto.container_type_id!,
          container_kind: dto.container_kind ?? JobContainerKind.ACTUAL,
          line_no: lineNo,
          container_number: dto.container_number,
          seal_number: dto.seal_number,
          actual_seal: dto.actual_seal ?? dto.seal_number,
          hs_code: dto.hs_code,
          packages: dto.packages,
          tare_weight: dto.tare_weight,
          max_payload:
            dto.max_payload ??
            (type.max_payload != null ? Number(type.max_payload) : undefined),
          cubic_capacity:
            dto.cubic_capacity ??
            (type.volume_cbm != null ? Number(type.volume_cbm) : undefined),
          gross_weight: dto.gross_weight,
          net_weight: dto.net_weight,
          volume_weight: dto.volume_weight,
          vgm_weight: dto.vgm_weight,
          cbm: dto.cbm,
          chargeable_units: dto.chargeable_units,
          shipment_id: dto.shipment_id,
          status: (dto.status as ContainerStatus) ?? ContainerStatus.EMPTY,
          gate_in_at: dto.gate_in_at ? new Date(dto.gate_in_at) : undefined,
          is_soc: dto.is_soc ?? false,
          created_by: actorId,
          updated_by: actorId,
        },
      });
      await tx.auditLog.create({
        data: {
          tenant_id: tenantId,
          user_id: actorId ?? null,
          action: "JOB_CONTAINER_ADDED",
          entity: "JOB",
          entity_id: jobId,
          metadata: {
            container_id: created.id,
            container_number: created.container_number,
          },
        },
      });
      return created;
    });

    void job;
    return {
      success: true,
      data: await this.enrichOne(tenantId, row),
      warnings,
    };
  }

  async update(
    tenantId: string,
    jobId: string,
    containerId: string,
    dto: UpdateJobContainerDto,
    actorId?: string,
  ) {
    await this.getOrThrow(tenantId, jobId, containerId);
    if (dto.container_type_id) {
      await this.assertContainerType(tenantId, dto.container_type_id);
    }
    const warnings: string[] = [];
    if (dto.container_number) {
      const dup = await this.findDuplicateNumber(
        tenantId,
        dto.container_number,
        jobId,
        containerId,
      );
      if (dup) {
        warnings.push(
          `Container number ${dto.container_number} already used on job ${dup.job_number}.`,
        );
      }
    }

    const row = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const { gate_in_at, status, ...rest } = dto;
      return tx.jobContainer.update({
        where: { id: containerId },
        data: {
          ...rest,
          ...(status ? { status: status as ContainerStatus } : {}),
          ...(gate_in_at ? { gate_in_at: new Date(gate_in_at) } : {}),
          ...(dto.seal_number && !dto.actual_seal
            ? { actual_seal: dto.seal_number }
            : {}),
          updated_by: actorId,
        },
      });
    });
    return {
      success: true,
      data: await this.enrichOne(tenantId, row),
      warnings,
    };
  }

  async remove(
    tenantId: string,
    jobId: string,
    containerId: string,
    actorId?: string,
  ) {
    await this.getOrThrow(tenantId, jobId, containerId);
    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobContainer.update({
        where: { id: containerId },
        data: { deleted_at: new Date(), updated_by: actorId },
      }),
    );
    return { success: true };
  }

  async bulk(
    tenantId: string,
    jobId: string,
    dto: BulkJobContainersDto,
    actorId?: string,
  ) {
    await this.assertJob(tenantId, jobId);
    const results = [];
    if (dto.replace_all) {
      await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.jobContainer.updateMany({
          where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
          data: { deleted_at: new Date(), updated_by: actorId },
        }),
      );
    }
    for (const item of dto.containers) {
      if (item.delete && item.id) {
        await this.remove(tenantId, jobId, item.id, actorId);
        continue;
      }
      const { id, delete: _d, ...rest } = item;
      if (id) {
        results.push(
          (await this.update(tenantId, jobId, id, rest, actorId)).data,
        );
      } else {
        results.push((await this.add(tenantId, jobId, rest, actorId)).data);
      }
    }
    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.auditLog.create({
        data: {
          tenant_id: tenantId,
          user_id: actorId ?? null,
          action: "JOB_CONTAINER_BULK",
          entity: "JOB",
          entity_id: jobId,
          metadata: { count: results.length },
        },
      }),
    );
    return { success: true, data: results };
  }

  async updateJobDetails(
    tenantId: string,
    jobId: string,
    dto: UpdateJobDetailsFromContainerTabDto,
    actorId?: string,
  ) {
    await this.assertJob(tenantId, jobId);
    const updated = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.update({
        where: { id: jobId },
        data: {
          ...(dto.commodity !== undefined ? { commodity: dto.commodity } : {}),
          ...(dto.hs_code !== undefined ? { hs_code: dto.hs_code } : {}),
          ...(dto.pieces !== undefined ? { pieces: dto.pieces } : {}),
          ...(dto.gross_weight !== undefined
            ? { gross_weight: dto.gross_weight }
            : {}),
          ...(dto.volume_cbm !== undefined
            ? { volume_cbm: dto.volume_cbm }
            : {}),
          ...(dto.etd ? { etd: new Date(dto.etd) } : {}),
          ...(dto.eta ? { eta: new Date(dto.eta) } : {}),
          updated_by: actorId,
        },
      }),
    );
    return { success: true, data: updated };
  }

  async syncFromSubJobs(
    tenantId: string,
    jobId: string,
    dto: SyncContainersFromSubJobsDto,
    actorId?: string,
  ) {
    await this.assertJob(tenantId, jobId);
    const matchingOnly = dto.matching_only !== false;
    const includeHouses = dto.include_houses !== false;
    const isSubJobOnly = dto.is_sub_job_only === true;
    const rollupHeader = dto.rollup_header === true;

    const childWhere: Prisma.JobWhereInput = {
      tenant_id: tenantId,
      parent_job_id: jobId,
      deleted_at: null,
    };
    if (isSubJobOnly) {
      childWhere.is_sub_job = true;
    }

    const subJobs = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findMany({
        where: childWhere,
        select: { id: true, is_sub_job: true },
      }),
    );
    const filtered = includeHouses
      ? subJobs
      : subJobs.filter((j) => j.is_sub_job);
    if (!filtered.length) {
      return {
        success: true,
        data: { updated: 0, message: "No sub-jobs found." },
      };
    }
    const subIds = filtered.map((j) => j.id);
    const subContainers = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobContainer.findMany({
        where: {
          tenant_id: tenantId,
          job_id: { in: subIds },
          deleted_at: null,
        },
      }),
    );
    const master = await this.listMapped(tenantId, jobId);
    let updated = 0;

    for (const sc of subContainers) {
      if (!sc.container_number && matchingOnly) continue;
      const match = master.find(
        (m) =>
          sc.container_number &&
          m.container_number &&
          m.container_number.toLowerCase() ===
            sc.container_number.toLowerCase(),
      );
      if (match) {
        await this.update(
          tenantId,
          jobId,
          match.id,
          {
            seal_number: sc.seal_number ?? undefined,
            actual_seal: sc.actual_seal ?? sc.seal_number ?? undefined,
            packages: sc.packages ?? undefined,
            hs_code: sc.hs_code ?? undefined,
            gross_weight:
              sc.gross_weight != null ? Number(sc.gross_weight) : undefined,
            net_weight:
              sc.net_weight != null ? Number(sc.net_weight) : undefined,
            volume_weight:
              sc.volume_weight != null ? Number(sc.volume_weight) : undefined,
            cbm: sc.cbm != null ? Number(sc.cbm) : undefined,
            chargeable_units:
              sc.chargeable_units != null
                ? Number(sc.chargeable_units)
                : undefined,
            status: sc.status as CreateJobContainerDto["status"],
          },
          actorId,
        );
        updated += 1;
      } else if (!matchingOnly) {
        await this.add(
          tenantId,
          jobId,
          {
            container_type_id: sc.container_type_id,
            container_kind: sc.container_kind,
            container_number: sc.container_number ?? undefined,
            seal_number: sc.seal_number ?? undefined,
            actual_seal: sc.actual_seal ?? undefined,
            packages: sc.packages ?? undefined,
            hs_code: sc.hs_code ?? undefined,
            gross_weight:
              sc.gross_weight != null ? Number(sc.gross_weight) : undefined,
            net_weight:
              sc.net_weight != null ? Number(sc.net_weight) : undefined,
            volume_weight:
              sc.volume_weight != null ? Number(sc.volume_weight) : undefined,
            cbm: sc.cbm != null ? Number(sc.cbm) : undefined,
            chargeable_units:
              sc.chargeable_units != null
                ? Number(sc.chargeable_units)
                : undefined,
            status: sc.status as CreateJobContainerDto["status"],
            is_soc: sc.is_soc,
          },
          actorId,
        );
        updated += 1;
      }
    }

    if (rollupHeader) {
      await this.rollupMasterHeaderFromContainers(tenantId, jobId, actorId);
    }

    return { success: true, data: { updated, rollup_header: rollupHeader } };
  }

  /**
   * Reverse of sync-from-sub-jobs: push master container seal/status onto houses.
   */
  async pushToSubJobs(
    tenantId: string,
    jobId: string,
    dto: PushContainersToSubJobsDto,
    actorId?: string,
  ) {
    const job = await this.assertJob(tenantId, jobId);
    if (job.parent_job_id) {
      throw new BadRequestException(
        "Container push is only allowed from a master (root) job.",
      );
    }

    const matchingOnly = dto.matching_only !== false;
    const includeHouses = dto.include_houses !== false;
    const isSubJobOnly = dto.is_sub_job_only === true;

    const childWhere: Prisma.JobWhereInput = {
      tenant_id: tenantId,
      parent_job_id: jobId,
      deleted_at: null,
    };
    if (isSubJobOnly) {
      childWhere.is_sub_job = true;
    }

    const children = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findMany({
        where: childWhere,
        select: { id: true, is_sub_job: true },
      }),
    );
    const targets = includeHouses
      ? children
      : children.filter((j) => j.is_sub_job);
    if (!targets.length) {
      return {
        success: true,
        data: { updated: 0, targets: 0, message: "No sub-jobs found." },
      };
    }

    const masterContainers = await this.listMapped(tenantId, jobId);
    let updated = 0;

    for (const child of targets) {
      const childContainers = await this.listMapped(tenantId, child.id);
      for (const mc of masterContainers) {
        if (!mc.container_number && matchingOnly) continue;
        const match = childContainers.find(
          (c) =>
            mc.container_number &&
            c.container_number &&
            c.container_number.toLowerCase() ===
              mc.container_number.toLowerCase(),
        );
        if (match) {
          await this.update(
            tenantId,
            child.id,
            match.id,
            {
              seal_number: mc.seal_number ?? undefined,
              actual_seal: mc.actual_seal ?? mc.seal_number ?? undefined,
              status: mc.status as CreateJobContainerDto["status"],
              packages: mc.packages ?? undefined,
              hs_code: mc.hs_code ?? undefined,
              gross_weight:
                mc.gross_weight != null ? Number(mc.gross_weight) : undefined,
              net_weight:
                mc.net_weight != null ? Number(mc.net_weight) : undefined,
              volume_weight:
                mc.volume_weight != null
                  ? Number(mc.volume_weight)
                  : undefined,
              cbm: mc.cbm != null ? Number(mc.cbm) : undefined,
              chargeable_units:
                mc.chargeable_units != null
                  ? Number(mc.chargeable_units)
                  : undefined,
            },
            actorId,
          );
          updated += 1;
        } else if (!matchingOnly && mc.container_type_id) {
          await this.add(
            tenantId,
            child.id,
            {
              container_type_id: mc.container_type_id,
              container_kind: mc.container_kind,
              container_number: mc.container_number ?? undefined,
              seal_number: mc.seal_number ?? undefined,
              actual_seal: mc.actual_seal ?? undefined,
              packages: mc.packages ?? undefined,
              hs_code: mc.hs_code ?? undefined,
              gross_weight:
                mc.gross_weight != null ? Number(mc.gross_weight) : undefined,
              net_weight:
                mc.net_weight != null ? Number(mc.net_weight) : undefined,
              volume_weight:
                mc.volume_weight != null
                  ? Number(mc.volume_weight)
                  : undefined,
              cbm: mc.cbm != null ? Number(mc.cbm) : undefined,
              chargeable_units:
                mc.chargeable_units != null
                  ? Number(mc.chargeable_units)
                  : undefined,
              status: mc.status as CreateJobContainerDto["status"],
              is_soc: mc.is_soc,
            },
            actorId,
          );
          updated += 1;
        }
      }
    }

    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.auditLog.create({
        data: {
          tenant_id: tenantId,
          user_id: actorId ?? null,
          action: "JOB_CONTAINERS_PUSH_TO_SUBJOBS",
          entity: "JOB",
          entity_id: jobId,
          metadata: {
            targets: targets.length,
            updated,
          } as Prisma.InputJsonValue,
        },
      }),
    );

    return {
      success: true,
      data: { updated, targets: targets.length },
    };
  }

  private async rollupMasterHeaderFromContainers(
    tenantId: string,
    jobId: string,
    actorId?: string,
  ) {
    const containers = await this.listMapped(tenantId, jobId);
    let pieces = 0;
    let gross = 0;
    let cbm = 0;
    for (const c of containers) {
      pieces += c.packages ?? 0;
      gross += c.gross_weight != null ? Number(c.gross_weight) : 0;
      cbm += c.cbm != null ? Number(c.cbm) : 0;
    }
    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.update({
        where: { id: jobId },
        data: {
          pieces,
          gross_weight: gross,
          volume_cbm: cbm,
          updated_by: actorId,
        },
      }),
    );
  }

  async downloadSample(): Promise<{
    filename: string;
    contentType: string;
    buffer: Buffer;
  }> {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Containers");
    ws.addRow([...SAMPLE_HEADERS]);
    ws.addRow([
      1,
      "ACTUAL",
      "40HC",
      "MSCU1234567",
      "SEAL001",
      "SEAL001",
      "1234.56",
      10,
      12000,
      11000,
      13000,
      55,
      1,
      "EMPTY",
      false,
    ]);
    const buffer = Buffer.from(await wb.xlsx.writeBuffer());
    return {
      filename: "container-upload-sample.xlsx",
      contentType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      buffer,
    };
  }

  async exportCsv(tenantId: string, jobId: string) {
    const rows = await this.listMapped(tenantId, jobId);
    const header = SAMPLE_HEADERS.join(",");
    const body = rows.map((c) =>
      [
        c.line_no,
        c.container_kind,
        c.container_type_code,
        c.container_number,
        c.seal_number,
        c.actual_seal,
        c.hs_code,
        c.packages,
        c.gross_weight,
        c.net_weight,
        c.volume_weight,
        c.cbm,
        c.chargeable_units,
        c.status,
        c.is_soc,
      ].join(","),
    );
    return {
      filename: `job-${jobId}-containers.csv`,
      contentType: "text/csv; charset=utf-8",
      buffer: Buffer.from([header, ...body].join("\n"), "utf8"),
    };
  }

  async uploadFile(
    tenantId: string,
    jobId: string,
    file: Express.Multer.File,
    confirm: boolean,
    replaceAll: boolean,
    actorId?: string,
  ) {
    await this.assertJob(tenantId, jobId);
    const text = await this.fileToText(file);
    return this.processUpload(tenantId, jobId, text, confirm, replaceAll, actorId);
  }

  async uploadPaste(
    tenantId: string,
    jobId: string,
    dto: PasteContainerUploadDto,
    actorId?: string,
  ) {
    await this.assertJob(tenantId, jobId);
    return this.processUpload(
      tenantId,
      jobId,
      dto.content,
      !!dto.confirm,
      !!dto.replace_all,
      actorId,
    );
  }

  async confirmUpload(
    tenantId: string,
    jobId: string,
    dto: ConfirmContainerUploadDto,
    actorId?: string,
  ) {
    return this.bulk(
      tenantId,
      jobId,
      { containers: dto.containers, replace_all: dto.replace_all },
      actorId,
    );
  }

  private async processUpload(
    tenantId: string,
    jobId: string,
    content: string,
    confirm: boolean,
    replaceAll: boolean,
    actorId?: string,
  ) {
    const { containers, errors } = await this.parseUpload(tenantId, content);
    if (!confirm) {
      return {
        success: true,
        data: { preview: containers, errors, confirm_required: true },
      };
    }
    if (!containers.length) {
      throw new BadRequestException(
        errors.length
          ? `Upload failed: ${errors.join("; ")}`
          : "No valid container rows found.",
      );
    }
    const saved = await this.bulk(
      tenantId,
      jobId,
      { containers, replace_all: replaceAll },
      actorId,
    );
    return {
      success: true,
      data: { containers: saved.data, errors, confirm_required: false },
    };
  }

  private async parseUpload(
    tenantId: string,
    content: string,
  ): Promise<{ containers: CreateJobContainerDto[]; errors: string[] }> {
    const errors: string[] = [];
    const containers: CreateJobContainerDto[] = [];
    let records: Record<string, string>[];
    try {
      records = parseCsv(content.trim(), {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true,
      }) as Record<string, string>[];
    } catch (e) {
      throw new BadRequestException(
        `Unable to parse upload: ${(e as Error).message}`,
      );
    }

    const typeCodes = [
      ...new Set(
        records
          .map((r) => normalizeKeys(r).container_type_code)
          .filter(Boolean),
      ),
    ];
    const types = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.containerType.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          code: { in: typeCodes, mode: "insensitive" },
        },
        select: { id: true, code: true },
      }),
    );
    const typeByCode = new Map(
      types.map((t) => [t.code.toUpperCase(), t.id]),
    );

    records.forEach((rec, idx) => {
      const n = normalizeKeys(rec);
      const typeId =
        n.container_type_id ||
        (n.container_type_code
          ? typeByCode.get(n.container_type_code.toUpperCase())
          : undefined);
      if (!typeId) {
        errors.push(
          `Row ${idx + 1}: unknown container_type_code/id "${n.container_type_code || n.container_type_id || ""}"`,
        );
        return;
      }
      containers.push({
        line_no: n.line_no ? Number(n.line_no) : undefined,
        container_kind: enumOr(
          n.container_kind,
          JobContainerKind,
          JobContainerKind.ACTUAL,
        ),
        container_type_id: typeId,
        container_number: n.container_number || undefined,
        seal_number: n.seal_number || undefined,
        actual_seal: n.actual_seal || n.seal_number || undefined,
        hs_code: n.hs_code || undefined,
        packages: n.packages ? Number(n.packages) : undefined,
        gross_weight: n.gross_weight ? Number(n.gross_weight) : undefined,
        net_weight: n.net_weight ? Number(n.net_weight) : undefined,
        volume_weight: n.volume_weight ? Number(n.volume_weight) : undefined,
        cbm: n.cbm ? Number(n.cbm) : undefined,
        chargeable_units: n.chargeable_units
          ? Number(n.chargeable_units)
          : undefined,
        status: (n.status as CreateJobContainerDto["status"]) || "EMPTY",
        is_soc: String(n.is_soc).toLowerCase() === "true",
      });
    });

    return { containers, errors };
  }

  private async fileToText(file: Express.Multer.File): Promise<string> {
    const name = (file.originalname || "").toLowerCase();
    if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
      const wb = new ExcelJS.Workbook();
      // exceljs Buffer typing differs across Node versions
      await wb.xlsx.load(file.buffer as any);
      const ws = wb.worksheets[0];
      if (!ws) throw new BadRequestException("Excel file has no sheet.");
      const rows: string[][] = [];
      ws.eachRow((row) => {
        const vals = Array.isArray(row.values) ? row.values.slice(1) : [];
        rows.push(vals.map((v) => (v == null ? "" : String(v))));
      });
      return rows.map((r) => r.join(",")).join("\n");
    }
    return file.buffer.toString("utf8");
  }

  private async listMapped(
    tenantId: string,
    jobId: string,
    kind?: JobContainerKind,
  ) {
    const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobContainer.findMany({
        where: {
          tenant_id: tenantId,
          job_id: jobId,
          deleted_at: null,
          ...(kind ? { container_kind: kind } : {}),
        },
        orderBy: [{ line_no: "asc" }, { created_at: "asc" }],
      }),
    );
    return Promise.all(rows.map((r) => this.enrichOne(tenantId, r)));
  }

  private async enrichOne(
    tenantId: string,
    row: {
      id: string;
      container_type_id: string;
      container_number?: string | null;
      seal_number?: string | null;
      actual_seal?: string | null;
      line_no?: number | null;
      container_kind?: JobContainerKind;
      hs_code?: string | null;
      packages?: number | null;
      gross_weight?: unknown;
      net_weight?: unknown;
      volume_weight?: unknown;
      cbm?: unknown;
      chargeable_units?: unknown;
      status?: string;
      is_soc?: boolean;
      [key: string]: unknown;
    },
  ) {
    const type = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.containerType.findFirst({
        where: {
          id: row.container_type_id,
          tenant_id: tenantId,
          deleted_at: null,
        },
        select: { code: true, name: true },
      }),
    );
    return {
      ...row,
      actual_seal: row.actual_seal ?? row.seal_number ?? null,
      container_type_code: type?.code ?? null,
      container_type_name: type?.name ?? null,
    };
  }

  private async nextLineNo(
    tenantId: string,
    jobId: string,
    kind?: JobContainerKind,
  ) {
    const max = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobContainer.aggregate({
        where: {
          tenant_id: tenantId,
          job_id: jobId,
          deleted_at: null,
          ...(kind ? { container_kind: kind } : {}),
        },
        _max: { line_no: true },
      }),
    );
    return (max._max.line_no ?? 0) + 1;
  }

  private async findDuplicateNumber(
    tenantId: string,
    containerNumber: string,
    _excludeJobId: string,
    excludeContainerId?: string,
  ) {
    const row = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobContainer.findFirst({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          container_number: {
            equals: containerNumber,
            mode: "insensitive",
          },
          ...(excludeContainerId ? { id: { not: excludeContainerId } } : {}),
        },
        select: {
          id: true,
          job_id: true,
          job: { select: { job_number: true } },
        },
      }),
    );
    if (!row) return null;
    return { container_id: row.id, job_number: row.job.job_number };
  }

  private async assertContainerType(tenantId: string, id: string) {
    const type = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.containerType.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
      }),
    );
    if (!type) throw new NotFoundException("Container type not found.");
    return type;
  }

  private async getOrThrow(
    tenantId: string,
    jobId: string,
    containerId: string,
  ) {
    const row = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobContainer.findFirst({
        where: {
          id: containerId,
          tenant_id: tenantId,
          job_id: jobId,
          deleted_at: null,
        },
      }),
    );
    if (!row) throw new NotFoundException("Container not found.");
    return row;
  }

  private async assertJob(tenantId: string, jobId: string) {
    const job = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findFirst({
        where: { id: jobId, tenant_id: tenantId, deleted_at: null },
        select: { id: true, job_type: true, parent_job_id: true },
      }),
    );
    if (!job) throw new NotFoundException("Job not found.");
    return job;
  }
}

function normalizeKeys(rec: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(rec)) {
    out[k.trim().toLowerCase().replace(/\s+/g, "_")] = v;
  }
  return out;
}

function enumOr<T extends Record<string, string>>(
  value: unknown,
  en: T,
  fallback: T[keyof T],
): T[keyof T] {
  if (value == null || value === "") return fallback;
  const key = String(value).toUpperCase();
  if (Object.values(en).includes(key as T[keyof T])) {
    return key as T[keyof T];
  }
  return fallback;
}
