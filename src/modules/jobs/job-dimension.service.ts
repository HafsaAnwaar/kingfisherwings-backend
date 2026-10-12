import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  DimensionLengthUnit,
  DimensionPackageType,
  DimensionVolumeUnit,
  DimensionWeightUnit,
  Prisma,
} from "@prisma/client";
import { parse as parseCsv } from "csv-parse/sync";
import * as ExcelJS from "exceljs";
import { PrismaService } from "../../prisma/prisma.service";
import {
  BulkJobDimensionsDto,
  ConfirmDimensionUploadDto,
  PasteDimensionUploadDto,
  SyncDimensionsToCargoDto,
  UpdateJobDimensionLineDto,
  UpsertJobDimensionLineDto,
} from "./dto/job-dimension.dto";
import {
  computeTotalWeightKg,
  computeVolumeCbm,
  computeVolumetricWeightKg,
  DEFAULT_VOLUMETRIC_DIVISOR_CM,
} from "./utils/job-dimension-calc.util";

const SAMPLE_HEADERS = [
  "line_no",
  "length_unit",
  "length",
  "width",
  "height",
  "no_of_pcs",
  "package_type",
  "g_weight",
  "g_weight_unit",
  "v_weight",
  "v_weight_unit",
  "n_weight",
  "n_weight_unit",
  "total_weight",
  "total_weight_unit",
  "volume",
  "volume_unit",
  "hs_code",
  "dimension_type",
  "cod",
  "total_inner_city",
  "quantity",
  "currency_code",
  "goods_value",
  "total_value",
  "container_no",
  "commodity",
  "commodity_description",
  "remarks",
  "edi_format",
] as const;

@Injectable()
export class JobDimensionService {
  constructor(private readonly prisma: PrismaService) {}

  async getTab(tenantId: string, jobId: string) {
    await this.assertJob(tenantId, jobId);
    const lines = await this.listLines(tenantId, jobId);
    const totals = this.computeTotals(lines);
    const divisor = await this.getVolumetricDivisor(tenantId);
    return {
      success: true,
      data: {
        lines,
        totals,
        volumetric_divisor_cm: divisor,
        actions: {
          upload: true,
          multiple_update: true,
          add: true,
          export: true,
          sync_to_cargo: true,
        },
      },
    };
  }

  async list(tenantId: string, jobId: string) {
    await this.assertJob(tenantId, jobId);
    return { success: true, data: await this.listLines(tenantId, jobId) };
  }

  async add(
    tenantId: string,
    jobId: string,
    dto: UpsertJobDimensionLineDto,
    actorId?: string,
  ) {
    await this.assertJob(tenantId, jobId);
    const { sync_to_cargo, ...lineDto } = dto;
    const prepared = await this.prepareLine(tenantId, jobId, lineDto);
    const row = await this.prisma.runWithTenant(tenantId, async (tx) => {
      let created = await tx.jobDimensionLine.create({
        data: {
          tenant_id: tenantId,
          job_id: jobId,
          ...prepared,
          created_by: actorId,
          updated_by: actorId,
        },
      });
      await this.syncJobHeader(tx, tenantId, jobId, actorId);
      if (sync_to_cargo) {
        created = await this.syncLineToCargo(tx, tenantId, jobId, created, actorId);
      }
      await tx.auditLog.create({
        data: {
          tenant_id: tenantId,
          user_id: actorId ?? null,
          action: "JOB_DIMENSION_ADDED",
          entity: "JOB",
          entity_id: jobId,
          metadata: { line_id: created.id, line_no: created.line_no },
        },
      });
      return created;
    });
    return { success: true, data: row };
  }

  async update(
    tenantId: string,
    jobId: string,
    lineId: string,
    dto: UpdateJobDimensionLineDto,
    actorId?: string,
  ) {
    await this.assertJob(tenantId, jobId);
    const existing = await this.getLineOrThrow(tenantId, jobId, lineId);
    const { sync_to_cargo, ...rest } = dto;
    const prepared = await this.prepareLine(tenantId, jobId, {
      ...this.rowToDto(existing),
      ...rest,
      line_no: rest.line_no ?? existing.line_no,
    });
    const row = await this.prisma.runWithTenant(tenantId, async (tx) => {
      let updated = await tx.jobDimensionLine.update({
        where: { id: lineId },
        data: { ...prepared, updated_by: actorId },
      });
      await this.syncJobHeader(tx, tenantId, jobId, actorId);
      if (sync_to_cargo) {
        updated = await this.syncLineToCargo(
          tx,
          tenantId,
          jobId,
          updated,
          actorId,
        );
      }
      return updated;
    });
    return { success: true, data: row };
  }

  async remove(
    tenantId: string,
    jobId: string,
    lineId: string,
    actorId?: string,
  ) {
    await this.assertJob(tenantId, jobId);
    const existing = await this.getLineOrThrow(tenantId, jobId, lineId);
    await this.prisma.runWithTenant(tenantId, async (tx) => {
      await tx.jobDimensionLine.update({
        where: { id: lineId },
        data: { deleted_at: new Date(), updated_by: actorId },
      });
      if (existing.synced_cargo_id) {
        await tx.jobCargo.updateMany({
          where: {
            id: existing.synced_cargo_id,
            tenant_id: tenantId,
            job_id: jobId,
            deleted_at: null,
          },
          data: { deleted_at: new Date(), updated_by: actorId },
        });
      }
      await this.syncJobHeader(tx, tenantId, jobId, actorId);
    });
    return { success: true };
  }

  async bulk(
    tenantId: string,
    jobId: string,
    dto: BulkJobDimensionsDto,
    actorId?: string,
  ) {
    await this.assertJob(tenantId, jobId);
    const results = await this.prisma.runWithTenant(tenantId, async (tx) => {
      if (dto.replace_all) {
        const prior = await tx.jobDimensionLine.findMany({
          where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
          select: { id: true, synced_cargo_id: true },
        });
        await tx.jobDimensionLine.updateMany({
          where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
          data: { deleted_at: new Date(), updated_by: actorId },
        });
        const cargoIds = prior
          .map((p) => p.synced_cargo_id)
          .filter((id): id is string => !!id);
        if (cargoIds.length) {
          await tx.jobCargo.updateMany({
            where: {
              tenant_id: tenantId,
              job_id: jobId,
              id: { in: cargoIds },
              deleted_at: null,
            },
            data: { deleted_at: new Date(), updated_by: actorId },
          });
        }
      }
      const out = [];
      for (const item of dto.lines) {
        if (item.delete) {
          if (!item.id) continue;
          const doomed = await tx.jobDimensionLine.findFirst({
            where: {
              id: item.id,
              tenant_id: tenantId,
              job_id: jobId,
              deleted_at: null,
            },
            select: { synced_cargo_id: true },
          });
          await tx.jobDimensionLine.updateMany({
            where: {
              id: item.id,
              tenant_id: tenantId,
              job_id: jobId,
              deleted_at: null,
            },
            data: { deleted_at: new Date(), updated_by: actorId },
          });
          if (doomed?.synced_cargo_id) {
            await tx.jobCargo.updateMany({
              where: {
                id: doomed.synced_cargo_id,
                tenant_id: tenantId,
                deleted_at: null,
              },
              data: { deleted_at: new Date(), updated_by: actorId },
            });
          }
          continue;
        }
        const { id, delete: _d, sync_to_cargo: _s, ...rest } = item;
        const prepared = await this.prepareLine(tenantId, jobId, rest, tx);
        let saved = id
          ? await tx.jobDimensionLine.update({
              where: { id },
              data: { ...prepared, updated_by: actorId },
            })
          : await tx.jobDimensionLine.create({
              data: {
                tenant_id: tenantId,
                job_id: jobId,
                ...prepared,
                created_by: actorId,
                updated_by: actorId,
              },
            });
        if (dto.sync_to_cargo || item.sync_to_cargo) {
          saved = await this.syncLineToCargo(
            tx,
            tenantId,
            jobId,
            saved,
            actorId,
          );
        }
        out.push(saved);
      }
      await this.syncJobHeader(tx, tenantId, jobId, actorId);
      await tx.auditLog.create({
        data: {
          tenant_id: tenantId,
          user_id: actorId ?? null,
          action: "JOB_DIMENSION_BULK",
          entity: "JOB",
          entity_id: jobId,
          metadata: {
            count: out.length,
            replace_all: !!dto.replace_all,
            sync_to_cargo: !!dto.sync_to_cargo,
          },
        },
      });
      return out;
    });
    return { success: true, data: results };
  }

  async syncToCargo(
    tenantId: string,
    jobId: string,
    dto: SyncDimensionsToCargoDto,
    actorId?: string,
  ) {
    await this.assertJob(tenantId, jobId);
    const result = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const lines = await tx.jobDimensionLine.findMany({
        where: {
          tenant_id: tenantId,
          job_id: jobId,
          deleted_at: null,
          ...(dto.line_ids?.length ? { id: { in: dto.line_ids } } : {}),
        },
        orderBy: { line_no: "asc" },
      });
      const synced = [];
      for (const line of lines) {
        synced.push(
          await this.syncLineToCargo(tx, tenantId, jobId, line, actorId),
        );
      }
      let pruned = 0;
      if (dto.prune_orphans) {
        const activeCargoIds = synced
          .map((l) => l.synced_cargo_id)
          .filter((id): id is string => !!id);
        const orphans = await tx.jobDimensionLine.findMany({
          where: {
            tenant_id: tenantId,
            job_id: jobId,
            deleted_at: { not: null },
            synced_cargo_id: { not: null },
          },
          select: { synced_cargo_id: true },
        });
        const orphanCargoIds = orphans
          .map((o) => o.synced_cargo_id!)
          .filter((id) => !activeCargoIds.includes(id));
        if (orphanCargoIds.length) {
          const res = await tx.jobCargo.updateMany({
            where: {
              tenant_id: tenantId,
              job_id: jobId,
              id: { in: orphanCargoIds },
              deleted_at: null,
            },
            data: { deleted_at: new Date(), updated_by: actorId },
          });
          pruned = res.count;
        }
      }
      await tx.auditLog.create({
        data: {
          tenant_id: tenantId,
          user_id: actorId ?? null,
          action: "JOB_DIMENSION_SYNC_CARGO",
          entity: "JOB",
          entity_id: jobId,
          metadata: { synced: synced.length, pruned },
        },
      });
      return { lines: synced, pruned };
    });
    return { success: true, data: result };
  }

  async downloadSample(): Promise<{
    filename: string;
    contentType: string;
    buffer: Buffer;
  }> {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Dimensions");
    ws.addRow([...SAMPLE_HEADERS]);
    ws.addRow([
      1,
      "CM",
      100,
      50,
      40,
      2,
      "CARTONS",
      10,
      "KG",
      "",
      "KG",
      9,
      "KG",
      "",
      "KG",
      "",
      "CBM",
      "1234.56",
      "CARTON",
      "",
      "",
      1,
      "AED",
      1000,
      1000,
      "",
      "Electronics",
      "Phones",
      "Sample",
      "100|50|40|2|10|KG",
    ]);
    const buffer = Buffer.from(await wb.xlsx.writeBuffer());
    return {
      filename: "dimension-upload-sample.xlsx",
      contentType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      buffer,
    };
  }

  async exportCsv(tenantId: string, jobId: string) {
    const lines = await this.listLines(tenantId, jobId);
    const header = SAMPLE_HEADERS.filter((h) => h !== "edi_format").join(",");
    const rows = lines.map((l) =>
      [
        l.line_no,
        l.length_unit,
        l.length,
        l.width,
        l.height,
        l.no_of_pcs,
        l.package_type,
        l.g_weight,
        l.g_weight_unit,
        l.v_weight,
        l.v_weight_unit,
        l.n_weight,
        l.n_weight_unit,
        l.total_weight,
        l.total_weight_unit,
        l.volume,
        l.volume_unit,
        l.hs_code,
        l.dimension_type,
        l.cod,
        l.total_inner_city,
        l.quantity,
        l.currency_code,
        l.goods_value,
        l.total_value,
        l.container_no,
        csvEscape(l.commodity),
        csvEscape(l.commodity_description),
        csvEscape(l.remarks),
      ].join(","),
    );
    return {
      filename: `job-${jobId}-dimensions.csv`,
      contentType: "text/csv; charset=utf-8",
      buffer: Buffer.from([header, ...rows].join("\n"), "utf8"),
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
    return this.processUploadContent(
      tenantId,
      jobId,
      text,
      confirm,
      replaceAll,
      actorId,
    );
  }

  async uploadPaste(
    tenantId: string,
    jobId: string,
    dto: PasteDimensionUploadDto,
    actorId?: string,
  ) {
    await this.assertJob(tenantId, jobId);
    return this.processUploadContent(
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
    dto: ConfirmDimensionUploadDto,
    actorId?: string,
  ) {
    return this.bulk(
      tenantId,
      jobId,
      {
        lines: dto.lines,
        replace_all: dto.replace_all,
      },
      actorId,
    );
  }

  private async processUploadContent(
    tenantId: string,
    jobId: string,
    content: string,
    confirm: boolean,
    replaceAll: boolean,
    actorId?: string,
  ) {
    const { lines, errors } = this.parseUploadContent(content);
    if (!confirm) {
      return {
        success: true,
        data: { preview: lines, errors, confirm_required: true },
      };
    }
    if (!lines.length) {
      throw new BadRequestException(
        errors.length
          ? `Upload failed: ${errors.join("; ")}`
          : "No valid dimension rows found.",
      );
    }
    const saved = await this.bulk(
      tenantId,
      jobId,
      { lines, replace_all: replaceAll },
      actorId,
    );
    return {
      success: true,
      data: { lines: saved.data, errors, confirm_required: false },
    };
  }

  parseUploadContent(content: string): {
    lines: UpsertJobDimensionLineDto[];
    errors: string[];
  } {
    const trimmed = content.trim();
    const errors: string[] = [];
    const lines: UpsertJobDimensionLineDto[] = [];

    // EDI paste: pipe or tab separated lines without header
    const firstLine = trimmed.split(/\r?\n/)[0] ?? "";
    const looksLikeEdi =
      !firstLine.toLowerCase().includes("line_no") &&
      (firstLine.includes("|") || /^[\d.]+\s+[\d.]+/.test(firstLine));

    if (looksLikeEdi) {
      trimmed.split(/\r?\n/).forEach((raw, idx) => {
        const row = raw.trim();
        if (!row) return;
        const parts = row.includes("|")
          ? row.split("|").map((p) => p.trim())
          : row.split(/\t|,/).map((p) => p.trim());
        // Fresa EDI: L|W|H|PCS|GWT|UNIT...
        try {
          const dto: UpsertJobDimensionLineDto = {
            line_no: idx + 1,
            length: num(parts[0]),
            width: num(parts[1]),
            height: num(parts[2]),
            no_of_pcs: int(parts[3]) ?? 1,
            g_weight: num(parts[4]),
            g_weight_unit: enumOr(
              parts[5],
              DimensionWeightUnit,
              DimensionWeightUnit.KG,
            ),
            length_unit: DimensionLengthUnit.CM,
            commodity: parts[6] || undefined,
            hs_code: parts[7] || undefined,
            container_no: parts[8] || undefined,
            remarks: parts[9] || undefined,
          };
          lines.push(dto);
        } catch (e) {
          errors.push(`Row ${idx + 1}: ${(e as Error).message}`);
        }
      });
      return { lines, errors };
    }

    let records: Record<string, string>[];
    try {
      records = parseCsv(trimmed, {
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

    records.forEach((rec, idx) => {
      try {
        const normalized = normalizeKeys(rec);
        if (normalized.edi_format && !normalized.length) {
          const parts = String(normalized.edi_format).split("|");
          lines.push({
            line_no: int(normalized.line_no) ?? idx + 1,
            length: num(parts[0]),
            width: num(parts[1]),
            height: num(parts[2]),
            no_of_pcs: int(parts[3]) ?? 1,
            g_weight: num(parts[4]),
            g_weight_unit: enumOr(
              parts[5],
              DimensionWeightUnit,
              DimensionWeightUnit.KG,
            ),
            length_unit: DimensionLengthUnit.CM,
            commodity: normalized.commodity || parts[6] || undefined,
            commodity_description: normalized.commodity_description || undefined,
            hs_code: normalized.hs_code || undefined,
            container_no: normalized.container_no || undefined,
            remarks: normalized.remarks || undefined,
          });
          return;
        }
        lines.push({
          line_no: int(normalized.line_no) ?? idx + 1,
          length_unit: enumOr(
            normalized.length_unit,
            DimensionLengthUnit,
            DimensionLengthUnit.CM,
          ),
          length: num(normalized.length),
          width: num(normalized.width),
          height: num(normalized.height),
          no_of_pcs: int(normalized.no_of_pcs) ?? 1,
          package_type: enumOr(
            normalized.package_type,
            DimensionPackageType,
            DimensionPackageType.PACKAGES,
          ),
          g_weight: num(normalized.g_weight),
          g_weight_unit: enumOr(
            normalized.g_weight_unit,
            DimensionWeightUnit,
            DimensionWeightUnit.KG,
          ),
          v_weight: num(normalized.v_weight),
          v_weight_unit: enumOr(
            normalized.v_weight_unit,
            DimensionWeightUnit,
            DimensionWeightUnit.KG,
          ),
          n_weight: num(normalized.n_weight),
          n_weight_unit: enumOr(
            normalized.n_weight_unit,
            DimensionWeightUnit,
            DimensionWeightUnit.KG,
          ),
          total_weight: num(normalized.total_weight),
          total_weight_unit: enumOr(
            normalized.total_weight_unit,
            DimensionWeightUnit,
            DimensionWeightUnit.KG,
          ),
          volume: num(normalized.volume),
          volume_unit: enumOr(
            normalized.volume_unit,
            DimensionVolumeUnit,
            DimensionVolumeUnit.CBM,
          ),
          hs_code: normalized.hs_code || undefined,
          dimension_type: normalized.dimension_type || undefined,
          cod: normalized.cod || undefined,
          total_inner_city: num(normalized.total_inner_city),
          quantity: num(normalized.quantity),
          currency_code: normalized.currency_code || undefined,
          goods_value: num(normalized.goods_value),
          total_value: num(normalized.total_value),
          container_no: normalized.container_no || undefined,
          commodity: normalized.commodity || undefined,
          commodity_description: normalized.commodity_description || undefined,
          remarks: normalized.remarks || undefined,
        });
      } catch (e) {
        errors.push(`Row ${idx + 1}: ${(e as Error).message}`);
      }
    });

    return { lines, errors };
  }

  private async fileToText(file: Express.Multer.File): Promise<string> {
    const name = (file.originalname || "").toLowerCase();
    if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(file.buffer as any);
      const ws = wb.worksheets[0];
      if (!ws) throw new BadRequestException("Excel file has no sheet.");
      const rows: string[][] = [];
      ws.eachRow((row) => {
        const vals = Array.isArray(row.values) ? row.values.slice(1) : [];
        rows.push(vals.map((v) => (v == null ? "" : String(v))));
      });
      if (!rows.length) return "";
      return rows.map((r) => r.map(csvEscape).join(",")).join("\n");
    }
    return file.buffer.toString("utf8");
  }

  private async syncLineToCargo(
    tx: Prisma.TransactionClient,
    tenantId: string,
    jobId: string,
    line: {
      id: string;
      container_id: string | null;
      commodity: string | null;
      commodity_description: string | null;
      hs_code: string | null;
      remarks: string | null;
      no_of_pcs: number;
      g_weight: Prisma.Decimal | number | null;
      total_weight: Prisma.Decimal | number | null;
      volume: Prisma.Decimal | number | null;
      synced_cargo_id: string | null;
    },
    actorId?: string,
  ) {
    const gross =
      line.total_weight != null
        ? Number(line.total_weight)
        : line.g_weight != null
          ? Number(line.g_weight) * (line.no_of_pcs ?? 1)
          : null;
    const cargoData = {
      container_id: line.container_id,
      commodity: line.commodity,
      hs_code: line.hs_code,
      description: line.commodity_description ?? line.remarks,
      packages: line.no_of_pcs,
      gross_weight: gross,
      measurement: line.volume != null ? Number(line.volume) : null,
      updated_by: actorId,
    };

    let cargoId = line.synced_cargo_id;
    if (cargoId) {
      const existing = await tx.jobCargo.findFirst({
        where: {
          id: cargoId,
          tenant_id: tenantId,
          job_id: jobId,
        },
      });
      if (existing && !existing.deleted_at) {
        await tx.jobCargo.update({
          where: { id: cargoId },
          data: cargoData,
        });
      } else if (existing?.deleted_at) {
        await tx.jobCargo.update({
          where: { id: cargoId },
          data: {
            ...cargoData,
            deleted_at: null,
            created_by: existing.created_by ?? actorId,
          },
        });
      } else {
        cargoId = null;
      }
    }

    if (!cargoId) {
      const created = await tx.jobCargo.create({
        data: {
          tenant_id: tenantId,
          job_id: jobId,
          ...cargoData,
          created_by: actorId,
        },
      });
      cargoId = created.id;
    }

    return tx.jobDimensionLine.update({
      where: { id: line.id },
      data: { synced_cargo_id: cargoId, updated_by: actorId },
    });
  }

  private async getVolumetricDivisor(tenantId: string): Promise<number> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { volumetric_divisor_cm: true },
    });
    return tenant?.volumetric_divisor_cm ?? DEFAULT_VOLUMETRIC_DIVISOR_CM;
  }

  private async prepareLine(
    tenantId: string,
    jobId: string,
    dto: UpsertJobDimensionLineDto,
    tx?: Prisma.TransactionClient,
  ) {
    let lineNo = dto.line_no;
    if (!lineNo) {
      const max = await (tx
        ? tx.jobDimensionLine.aggregate({
            where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
            _max: { line_no: true },
          })
        : this.prisma.runWithTenant(tenantId, (t) =>
            t.jobDimensionLine.aggregate({
              where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
              _max: { line_no: true },
            }),
          ));
      lineNo = (max._max.line_no ?? 0) + 1;
    }

    let containerId = dto.container_id ?? null;
    if (!containerId && dto.container_no) {
      const match = await (tx
        ? tx.jobContainer.findFirst({
            where: {
              tenant_id: tenantId,
              job_id: jobId,
              deleted_at: null,
              container_number: {
                equals: dto.container_no,
                mode: "insensitive",
              },
            },
            select: { id: true },
          })
        : this.prisma.runWithTenant(tenantId, (t) =>
            t.jobContainer.findFirst({
              where: {
                tenant_id: tenantId,
                job_id: jobId,
                deleted_at: null,
                container_number: {
                  equals: dto.container_no!,
                  mode: "insensitive",
                },
              },
              select: { id: true },
            }),
          ));
      containerId = match?.id ?? null;
    }

    const divisor = await this.getVolumetricDivisor(tenantId);
    const length_unit = dto.length_unit ?? DimensionLengthUnit.CM;
    const volume =
      dto.volume ??
      computeVolumeCbm({
        length: dto.length,
        width: dto.width,
        height: dto.height,
        no_of_pcs: dto.no_of_pcs,
        length_unit,
      });
    const v_weight =
      dto.v_weight ??
      computeVolumetricWeightKg({
        length: dto.length,
        width: dto.width,
        height: dto.height,
        no_of_pcs: dto.no_of_pcs,
        length_unit,
        divisor,
      });
    const total_weight =
      dto.total_weight ??
      computeTotalWeightKg({
        g_weight: dto.g_weight,
        g_weight_unit: dto.g_weight_unit,
        no_of_pcs: dto.no_of_pcs,
      });

    return {
      line_no: lineNo,
      length_unit,
      length: dto.length ?? null,
      width: dto.width ?? null,
      height: dto.height ?? null,
      no_of_pcs: dto.no_of_pcs ?? 1,
      package_type: dto.package_type ?? DimensionPackageType.PACKAGES,
      g_weight: dto.g_weight ?? null,
      g_weight_unit: dto.g_weight_unit ?? DimensionWeightUnit.KG,
      v_weight: v_weight ?? null,
      v_weight_unit: dto.v_weight_unit ?? DimensionWeightUnit.KG,
      n_weight: dto.n_weight ?? null,
      n_weight_unit: dto.n_weight_unit ?? DimensionWeightUnit.KG,
      total_weight: total_weight ?? null,
      total_weight_unit: dto.total_weight_unit ?? DimensionWeightUnit.KG,
      volume: volume ?? null,
      volume_unit: dto.volume_unit ?? DimensionVolumeUnit.CBM,
      hs_code: dto.hs_code ?? null,
      dimension_type: dto.dimension_type ?? null,
      cod: dto.cod ?? null,
      total_inner_city: dto.total_inner_city ?? null,
      quantity: dto.quantity ?? null,
      currency_code: dto.currency_code ?? null,
      goods_value: dto.goods_value ?? null,
      total_value: dto.total_value ?? null,
      container_no: dto.container_no ?? null,
      container_id: containerId,
      commodity: dto.commodity ?? null,
      commodity_description: dto.commodity_description ?? null,
      remarks: dto.remarks ?? null,
    };
  }

  private async syncJobHeader(
    tx: Prisma.TransactionClient,
    tenantId: string,
    jobId: string,
    actorId?: string,
  ) {
    const lines = await tx.jobDimensionLine.findMany({
      where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
    });
    const pieces = lines.reduce((s, l) => s + (l.no_of_pcs ?? 0), 0);
    const gross = lines.reduce(
      (s, l) =>
        s +
        (computeTotalWeightKg({
          g_weight: l.g_weight != null ? Number(l.g_weight) : null,
          g_weight_unit: l.g_weight_unit,
          no_of_pcs: l.no_of_pcs,
          total_weight: l.total_weight != null ? Number(l.total_weight) : null,
          total_weight_unit: l.total_weight_unit,
        }) ?? 0),
      0,
    );
    const volume = lines.reduce(
      (s, l) => s + (l.volume != null ? Number(l.volume) : 0),
      0,
    );
    const vWt = lines.reduce(
      (s, l) => s + (l.v_weight != null ? Number(l.v_weight) : 0),
      0,
    );
    const first = lines.sort((a, b) => a.line_no - b.line_no)[0];
    await tx.job.update({
      where: { id: jobId },
      data: {
        pieces: pieces || null,
        gross_weight: gross || null,
        volume_cbm: volume || null,
        chargeable_weight: Math.max(gross, vWt) || null,
        commodity:
          first?.commodity_description ?? first?.commodity ?? undefined,
        hs_code: first?.hs_code ?? undefined,
        updated_by: actorId,
      },
    });
  }

  private computeTotals(
    lines: Awaited<ReturnType<typeof this.listLines>>,
  ) {
    return {
      line_count: lines.length,
      no_of_pcs: lines.reduce((s, l) => s + (l.no_of_pcs ?? 0), 0),
      g_weight: lines.reduce(
        (s, l) => s + (l.g_weight != null ? Number(l.g_weight) : 0),
        0,
      ),
      v_weight: lines.reduce(
        (s, l) => s + (l.v_weight != null ? Number(l.v_weight) : 0),
        0,
      ),
      n_weight: lines.reduce(
        (s, l) => s + (l.n_weight != null ? Number(l.n_weight) : 0),
        0,
      ),
      total_weight: lines.reduce(
        (s, l) => s + (l.total_weight != null ? Number(l.total_weight) : 0),
        0,
      ),
      volume: lines.reduce(
        (s, l) => s + (l.volume != null ? Number(l.volume) : 0),
        0,
      ),
    };
  }

  private async listLines(tenantId: string, jobId: string) {
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobDimensionLine.findMany({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
        orderBy: { line_no: "asc" },
      }),
    );
  }

  private rowToDto(
    row: Awaited<ReturnType<typeof this.getLineOrThrow>>,
  ): UpsertJobDimensionLineDto {
    return {
      line_no: row.line_no,
      length_unit: row.length_unit,
      length: row.length != null ? Number(row.length) : undefined,
      width: row.width != null ? Number(row.width) : undefined,
      height: row.height != null ? Number(row.height) : undefined,
      no_of_pcs: row.no_of_pcs,
      package_type: row.package_type,
      g_weight: row.g_weight != null ? Number(row.g_weight) : undefined,
      g_weight_unit: row.g_weight_unit,
      v_weight: row.v_weight != null ? Number(row.v_weight) : undefined,
      v_weight_unit: row.v_weight_unit,
      n_weight: row.n_weight != null ? Number(row.n_weight) : undefined,
      n_weight_unit: row.n_weight_unit,
      total_weight:
        row.total_weight != null ? Number(row.total_weight) : undefined,
      total_weight_unit: row.total_weight_unit,
      volume: row.volume != null ? Number(row.volume) : undefined,
      volume_unit: row.volume_unit,
      hs_code: row.hs_code ?? undefined,
      dimension_type: row.dimension_type ?? undefined,
      cod: row.cod ?? undefined,
      total_inner_city:
        row.total_inner_city != null ? Number(row.total_inner_city) : undefined,
      quantity: row.quantity != null ? Number(row.quantity) : undefined,
      currency_code: row.currency_code ?? undefined,
      goods_value:
        row.goods_value != null ? Number(row.goods_value) : undefined,
      total_value:
        row.total_value != null ? Number(row.total_value) : undefined,
      container_no: row.container_no ?? undefined,
      container_id: row.container_id ?? undefined,
      commodity: row.commodity ?? undefined,
      commodity_description: row.commodity_description ?? undefined,
      remarks: row.remarks ?? undefined,
    };
  }

  private async getLineOrThrow(
    tenantId: string,
    jobId: string,
    lineId: string,
  ) {
    const row = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobDimensionLine.findFirst({
        where: {
          id: lineId,
          tenant_id: tenantId,
          job_id: jobId,
          deleted_at: null,
        },
      }),
    );
    if (!row) throw new NotFoundException("Dimension line not found.");
    return row;
  }

  private async assertJob(tenantId: string, jobId: string) {
    const job = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findFirst({
        where: { id: jobId, tenant_id: tenantId, deleted_at: null },
        select: { id: true },
      }),
    );
    if (!job) throw new NotFoundException("Job not found.");
  }
}

function num(v: unknown): number | undefined {
  if (v == null || v === "") return undefined;
  const n = Number(v);
  if (Number.isNaN(n)) return undefined;
  return n;
}

function int(v: unknown): number | undefined {
  const n = num(v);
  return n == null ? undefined : Math.trunc(n);
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

function normalizeKeys(rec: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(rec)) {
    out[k.trim().toLowerCase().replace(/\s+/g, "_")] = v;
  }
  return out;
}

function csvEscape(v: unknown): string {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
