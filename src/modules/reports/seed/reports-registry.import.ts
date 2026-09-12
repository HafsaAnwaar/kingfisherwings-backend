import * as fs from "fs";
import * as path from "path";
import { Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import {
  buildGeneratedFresaRegistry,
  normalizeContexts,
  normalizeFamily,
  normalizeFormats,
  RegistryEntry,
} from "./fresa-registry.util";

const logger = new Logger("ReportsRegistryImport");

/**
 * Codes owned by Phase packs — registry import must not downgrade
 * is_active / renderer_key / parameters_schema on these.
 */
export function collectProtectedCodes(packCodes: string[]): Set<string> {
  return new Set(packCodes);
}

export async function importFresaRegistry(
  prisma: PrismaService,
  options: {
    protectedCodes: Set<string>;
    entries?: RegistryEntry[];
    jsonPath?: string;
  },
): Promise<{ upserted: number; source: string }> {
  let entries = options.entries;
  let source = "inline";

  if (!entries) {
    const candidates = [
      options.jsonPath,
      path.join(__dirname, "fresaReportRegistry.json"),
      path.join(
        process.cwd(),
        "src/modules/reports/seed/fresaReportRegistry.json",
      ),
    ].filter(Boolean) as string[];

    let loaded: RegistryEntry[] | null = null;
    let loadedPath = "";
    for (const jsonPath of candidates) {
      if (!fs.existsSync(jsonPath)) continue;
      const parsed = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as unknown;
      const list = Array.isArray(parsed)
        ? parsed
        : ((parsed as { templates?: unknown[]; items?: unknown[] }).templates ??
          (parsed as { items?: unknown[] }).items ??
          []);
      if (Array.isArray(list) && list.length > 0) {
        loaded = list as RegistryEntry[];
        loadedPath = jsonPath;
        break;
      }
    }

    if (loaded) {
      entries = loaded;
      source = loadedPath;
    } else {
      entries = buildGeneratedFresaRegistry();
      source = "generated-stubs";
      logger.log(
        `fresaReportRegistry.json missing or empty — using ${entries.length} generated FRESA stubs as inactive. Optional: drop FE taxonomy JSON into src/modules/reports/seed/fresaReportRegistry.json.`,
      );
    }
  }

  let upserted = 0;
  for (const raw of entries) {
    const code = String(raw.code ?? "").trim();
    if (!code) continue;

    const family = normalizeFamily(raw.family);
    const contexts = normalizeContexts(raw.contexts);
    const formats = normalizeFormats(raw.formats);
    const name = String(raw.name ?? code).trim() || code;
    const description =
      raw.description != null ? String(raw.description) : null;
    const parameters_schema = (raw.parameters_schema ??
      []) as Prisma.InputJsonValue;
    const sort_order = Number(raw.sort_order ?? 0) || 0;
    const protectedRow = options.protectedCodes.has(code);

    const existing = await prisma.reportTemplate.findUnique({
      where: { code },
    });

    if (!existing) {
      await prisma.reportTemplate.create({
        data: {
          code,
          name,
          family,
          contexts,
          formats,
          description,
          is_active: false,
          parameters_schema,
          renderer_key: `pending.${code}`,
          sort_order,
        },
      });
      upserted++;
      continue;
    }

    if (protectedRow) {
      // Keep pack ownership; still refresh name/description/family if empty-ish
      await prisma.reportTemplate.update({
        where: { code },
        data: {
          name: existing.name || name,
          description: existing.description ?? description,
        },
      });
      upserted++;
      continue;
    }

    // Inactive registry rows: refresh metadata but never auto-activate
    await prisma.reportTemplate.update({
      where: { code },
      data: {
        name,
        family,
        contexts,
        formats,
        description,
        is_active: false,
        ...(existing.renderer_key.startsWith("pending.")
          ? {
              parameters_schema,
              renderer_key: `pending.${code}`,
              sort_order,
            }
          : {}),
      },
    });
    upserted++;
  }

  logger.log(`Registry import upserted ${upserted} templates (source=${source})`);
  return { upserted, source };
}
