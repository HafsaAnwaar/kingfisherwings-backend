import { BadRequestException } from "@nestjs/common";
import { CargoCategory, ServiceScope } from "@prisma/client";

export type BookingPartyInput = {
  party_kind: string;
  full_name?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  entity_kind?: string | null;
};

export const FREIGHT_PARTY_KINDS = ["SHIPPER", "CONSIGNEE", "NOTIFY"] as const;

/** Customs clearance: shipper, consignee/importer, and CHA/agent. */
export const CC_PARTY_KINDS = ["SHIPPER", "CONSIGNEE", "AGENT"] as const;

export function assertServiceScopeAndDoors(input: {
  service_scope?: ServiceScope | null;
  origin_door_address?: string | null;
  dest_door_address?: string | null;
  requireScope?: boolean;
}) {
  const missing: string[] = [];
  if (input.requireScope !== false && !input.service_scope) {
    missing.push("service_scope");
  }
  const scope = input.service_scope;
  if (scope === "DOOR_TO_DOOR" || scope === "DOOR_TO_PORT") {
    if (!input.origin_door_address?.trim()) missing.push("origin_door_address");
  }
  if (scope === "DOOR_TO_DOOR" || scope === "PORT_TO_DOOR") {
    if (!input.dest_door_address?.trim()) missing.push("dest_door_address");
  }
  if (missing.length) {
    throw new BadRequestException(
      `Booking form incomplete: ${missing.join(", ")}`,
    );
  }
}

export function assertRequiredParties(
  parties: BookingPartyInput[] | undefined,
  kinds: readonly string[] = FREIGHT_PARTY_KINDS,
) {
  const missing: string[] = [];
  const list = parties ?? [];
  const found = new Set(list.map((p) => p.party_kind));
  for (const k of kinds) {
    if (!found.has(k)) missing.push(`parties.${k}`);
  }
  for (const p of list) {
    if (!kinds.includes(p.party_kind as (typeof kinds)[number])) continue;
    if (!p.full_name?.trim() || !p.address?.trim()) {
      missing.push(`${p.party_kind}.full_name_or_address`);
    }
    if (!p.city?.trim()) missing.push(`${p.party_kind}.city`);
    if (!p.country?.trim()) missing.push(`${p.party_kind}.country`);
    if (!p.entity_kind) missing.push(`${p.party_kind}.entity_kind`);
  }
  if (missing.length) {
    throw new BadRequestException(
      `Booking form incomplete: ${missing.join(", ")}`,
    );
  }
}

export function missingCargoDocs(form: {
  cargo_category?: CargoCategory | null;
  is_dg?: boolean | null;
  attach_carnet?: boolean | null;
  attach_vehicle_title?: boolean | null;
  attach_msds?: boolean | null;
  attach_dangerous_goods_declaration?: boolean | null;
  attach_health_veterinary?: boolean | null;
  attach_fda_moh?: boolean | null;
  attach_commercial_invoice?: boolean | null;
}): string[] {
  const missing: string[] = [];
  if (!form.attach_commercial_invoice) missing.push("commercial_invoice");
  const cat = form.cargo_category;
  if (cat === "VEHICLES") {
    if (!form.attach_carnet) missing.push("carnet");
    if (!form.attach_vehicle_title) missing.push("vehicle_title");
  }
  if (cat === "CHEMICALS_DG" || form.is_dg) {
    if (!form.attach_msds) missing.push("msds");
    if (!form.attach_dangerous_goods_declaration) missing.push("dgd");
  }
  if (cat === "FOOD_PERISHABLE" || cat === "LIVESTOCK") {
    if (!form.attach_health_veterinary) missing.push("health_veterinary");
  }
  if (cat === "FOOD_PERISHABLE" || cat === "PHARMA") {
    if (!form.attach_fda_moh) missing.push("fda_moh");
  }
  return missing;
}

export function assertCargoDocs(form: Parameters<typeof missingCargoDocs>[0]) {
  const missing = missingCargoDocs(form);
  if (missing.length) {
    throw new BadRequestException(
      `Required cargo documents missing: ${missing.join(", ")}`,
    );
  }
}

export function requireFields(
  label: string,
  checks: Array<[boolean, string]>,
) {
  const missing = checks.filter(([ok]) => !ok).map(([, name]) => name);
  if (missing.length) {
    throw new BadRequestException(
      `${label} incomplete: ${missing.join(", ")}`,
    );
  }
}

export type ContainerSizeLine = {
  container_type_id?: string;
  iso_size?: string;
  count: number;
};

export type AirPalletLine = {
  pallet_type: string;
  count: number;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
  weight_kg?: number;
};

export function assertContainerLines(lines: ContainerSizeLine[] | undefined) {
  if (!lines?.length) {
    throw new BadRequestException(
      "Booking form incomplete: containers (at least one size line)",
    );
  }
  for (const [i, line] of lines.entries()) {
    if (!line.iso_size?.trim() && !line.container_type_id) {
      throw new BadRequestException(
        `containers[${i}]: iso_size or container_type_id required`,
      );
    }
    if (!line.count || line.count < 1) {
      throw new BadRequestException(`containers[${i}]: count must be >= 1`);
    }
  }
}

export function assertAirPalletLines(
  palletCount: number | null | undefined,
  lines: AirPalletLine[] | undefined,
) {
  if (palletCount != null && palletCount > 0) {
    if (!lines?.length) {
      throw new BadRequestException(
        "Booking form incomplete: pallets (lines required when pallet_count > 0)",
      );
    }
  }
  for (const [i, line] of (lines ?? []).entries()) {
    if (!line.pallet_type?.trim()) {
      throw new BadRequestException(`pallets[${i}]: pallet_type required`);
    }
    if (!line.count || line.count < 1) {
      throw new BadRequestException(`pallets[${i}]: count must be >= 1`);
    }
  }
}

export type CcCargoLineInput = {
  description?: string | null;
  hs_code?: string | null;
  country_of_origin?: string | null;
  quantity?: number | null;
  unit?: string | null;
  value_amount?: number | null;
  currency_code?: string | null;
};

export function assertCcCargoLines(lines: CcCargoLineInput[] | undefined) {
  if (!lines?.length) {
    throw new BadRequestException(
      "Customs clearance booking form incomplete: cargo_lines (at least one line)",
    );
  }
  for (const [i, line] of lines.entries()) {
    if (!line.description?.trim()) {
      throw new BadRequestException(`cargo_lines[${i}]: description required`);
    }
    if (!line.hs_code?.trim()) {
      throw new BadRequestException(`cargo_lines[${i}]: hs_code required`);
    }
  }
}
