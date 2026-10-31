import { BadRequestException } from "@nestjs/common";
import { CargoCategory, ServiceScope } from "@prisma/client";
import { missingMandatoryBookingDocs } from "../../../common/constants/mandatory-booking-docs";

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

/**
 * Door addresses are required for DOOR_* scopes. City/country (or pickup/delivery
 * place) may satisfy the same requirement when the door field itself is empty —
 * land/courier forms often only collect origin_city_country / dest_city_country.
 */
export function assertServiceScopeAndDoors(input: {
  service_scope?: ServiceScope | null;
  origin_door_address?: string | null;
  dest_door_address?: string | null;
  origin_location_fallback?: string | null;
  dest_location_fallback?: string | null;
  requireScope?: boolean;
}) {
  const missing: string[] = [];
  if (input.requireScope !== false && !input.service_scope) {
    missing.push("service_scope");
  }
  const scope = input.service_scope;
  const origin =
    input.origin_door_address?.trim() ||
    input.origin_location_fallback?.trim() ||
    "";
  const dest =
    input.dest_door_address?.trim() ||
    input.dest_location_fallback?.trim() ||
    "";
  if (scope === "DOOR_TO_DOOR" || scope === "DOOR_TO_PORT") {
    if (!origin) missing.push("origin_door_address");
  }
  if (scope === "DOOR_TO_DOOR" || scope === "PORT_TO_DOOR") {
    if (!dest) missing.push("dest_door_address");
  }
  if (missing.length) {
    throw new BadRequestException(
      `Booking form incomplete: ${missing.join(", ")}`,
    );
  }
}

/** Prefer non-empty strings so empty DTO fields do not wipe saved values. */
export function mergeBookingFormPayload(
  base: Record<string, unknown>,
  patch: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;
    if (
      typeof value === "string" &&
      !value.trim() &&
      typeof base[key] === "string" &&
      (base[key] as string).trim()
    ) {
      continue;
    }
    out[key] = value;
  }
  return out;
}

export function locationFallbacksFromPayload(dto: Record<string, unknown>): {
  origin_location_fallback: string | null;
  dest_location_fallback: string | null;
} {
  const origin =
    (dto.origin_city_country as string | undefined)?.trim() ||
    (dto.place_of_pickup as string | undefined)?.trim() ||
    (dto.pickup_address as string | undefined)?.trim() ||
    null;
  const dest =
    (dto.dest_city_country as string | undefined)?.trim() ||
    (dto.place_of_delivery as string | undefined)?.trim() ||
    (dto.delivery_address as string | undefined)?.trim() ||
    null;
  return {
    origin_location_fallback: origin,
    dest_location_fallback: dest,
  };
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
  attach_packing_list?: boolean | null;
  attach_bl_awb_copy?: boolean | null;
  attach_licence?: boolean | null;
  attach_uat_tax_certificate?: boolean | null;
  doc_commercial_invoice_key?: string | null;
  doc_packing_list_key?: string | null;
  doc_bl_awb_copy_key?: string | null;
  doc_licence_key?: string | null;
  doc_uat_tax_certificate_key?: string | null;
}): string[] {
  const missing = missingMandatoryBookingDocs(form);
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

export type WhStockLineInput = {
  sku_code?: string | null;
  description?: string | null;
  quantity?: number | null;
  unit?: string | null;
  cbm?: number | null;
};

export function assertWhStockLines(lines: WhStockLineInput[] | undefined) {
  if (!lines?.length) {
    throw new BadRequestException(
      "Warehouse booking form incomplete: stock_lines (at least one line)",
    );
  }
  for (const [i, line] of lines.entries()) {
    if (!line.description?.trim() && !line.sku_code?.trim()) {
      throw new BadRequestException(
        `stock_lines[${i}]: description or sku_code required`,
      );
    }
    if (line.quantity == null || line.quantity <= 0) {
      throw new BadRequestException(
        `stock_lines[${i}]: quantity must be > 0`,
      );
    }
  }
}

/** Free-form booking extras stored on Job/Shipment.booking_custom_fields. */
export type BookingCustomField = {
  key: string;
  label: string;
  value: unknown;
  type?: string;
};

/** GET envelope / meta keys that must never be written into mode-form Prisma rows. */
const BOOKING_FORM_ENVELOPE_KEYS = new Set([
  "form",
  "documents",
  "job_documents_upload",
  "job_id",
  "job_type",
  "kind",
  "submitted",
  "mode",
  "provisional",
  "provisional_job_id",
  "quotation_id",
  "shipment_id",
  "success",
  "data",
  "warnings",
  "custom_fields",
  "fields",
  "booking_custom_fields",
  "parties",
  "mark_complete",
  "consent_accepted",
  "containers",
  "cargo_lines",
  "stock_lines",
  "id",
  "tenant_id",
  "created_at",
  "updated_at",
  "created_by",
  "deleted_at",
]);

/**
 * Scalar columns safe to write on any mode booking-form row.
 * Mode-specific extras are added in toUpdateData (containers_json, etc.).
 */
export const BOOKING_FORM_WRITABLE_COLUMNS = new Set([
  "date_of_request",
  "client_booking_no",
  "voyage_ref",
  "service_scope",
  "origin_door_address",
  "dest_door_address",
  "pol",
  "pod",
  "shipper_owned_container",
  "teu_count",
  "containers_json",
  "cfs_warehouse",
  "etd",
  "eta",
  "incoterms",
  "freight_terms",
  "commodity",
  "hs_code",
  "cargo_category",
  "is_dg",
  "dg_class",
  "gross_weight_kg",
  "net_weight_kg",
  "volume_cbm",
  "pieces",
  "insurance_details",
  "request_details",
  "tracking_number",
  "direction",
  "border_or_port",
  "entry_type",
  "freight_job_id",
  "expected_inbound_at",
  "expected_outbound_at",
  "cargo_lines_json",
  "stock_lines_json",
  "attach_commercial_invoice",
  "attach_packing_list",
  "attach_bl_awb_copy",
  "attach_carnet",
  "attach_vehicle_title",
  "attach_msds",
  "attach_dangerous_goods_declaration",
  "attach_health_veterinary",
  "attach_fda_moh",
  "attach_licence",
  "attach_uat_tax_certificate",
  "doc_commercial_invoice_key",
  "doc_packing_list_key",
  "doc_bl_awb_copy_key",
  "doc_licence_key",
  "doc_uat_tax_certificate_key",
  "consent_accepted_at",
  "is_complete",
  "completed_at",
  "completed_by",
  "updated_by",
]);

/** Keep only known booking-form DB columns (prevents Prisma 500 on unknown keys). */
export function pickWritableBookingFormData(
  raw: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!BOOKING_FORM_WRITABLE_COLUMNS.has(key)) continue;
    if (value === undefined) continue;
    out[key] = value;
  }
  return out;
}

/**
 * Accept either a flat form DTO or a round-tripped GET payload
 * `{ form: {...}, custom_fields, job_id, … }` and return writable form fields.
 */
export function unwrapBookingFormWritePayload(
  dto: Record<string, unknown>,
): Record<string, unknown> {
  const nested =
    dto.form && typeof dto.form === "object" && !Array.isArray(dto.form)
      ? (dto.form as Record<string, unknown>)
      : null;

  const merged: Record<string, unknown> = {
    ...(nested ?? {}),
    ...dto,
  };

  // Prefer top-level custom_fields over nested form.custom_fields.
  if (dto.custom_fields !== undefined) {
    merged.custom_fields = dto.custom_fields;
  } else if (dto.fields !== undefined) {
    merged.custom_fields = dto.fields;
  } else if (nested?.custom_fields !== undefined) {
    merged.custom_fields = nested.custom_fields;
  }

  for (const key of BOOKING_FORM_ENVELOPE_KEYS) {
    if (
      key === "custom_fields" ||
      key === "fields" ||
      key === "booking_custom_fields"
    ) {
      continue;
    }
    delete merged[key];
  }
  delete merged.documents;
  return merged;
}

/**
 * Accept Array<{key,label,value,type?}> or Record&lt;key, value | {label?,value?,type?}&gt;.
 * Returns null when input is undefined (caller should leave existing value unchanged).
 */
export function normalizeBookingCustomFields(
  input: unknown,
): BookingCustomField[] | null {
  if (input === undefined) return null;
  if (input === null) return [];

  if (Array.isArray(input)) {
    return input.map((raw, i) => {
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
        throw new BadRequestException(
          `custom_fields[${i}] must be an object with key/label/value`,
        );
      }
      const row = raw as Record<string, unknown>;
      const key = String(row.key ?? "").trim();
      if (!key) {
        throw new BadRequestException(`custom_fields[${i}].key is required`);
      }
      const label = String(row.label ?? key).trim() || key;
      const out: BookingCustomField = {
        key,
        label,
        value: row.value ?? null,
      };
      if (row.type != null && String(row.type).trim()) {
        out.type = String(row.type).trim();
      }
      return out;
    });
  }

  if (typeof input === "object") {
    return Object.entries(input as Record<string, unknown>).map(
      ([keyRaw, raw]) => {
        const key = String(keyRaw).trim();
        if (!key) {
          throw new BadRequestException("custom_fields keys must be non-empty");
        }
        if (raw != null && typeof raw === "object" && !Array.isArray(raw)) {
          const row = raw as Record<string, unknown>;
          const shaped =
            "value" in row || "label" in row || "type" in row;
          if (shaped) {
            const out: BookingCustomField = {
              key,
              label: String(row.label ?? key).trim() || key,
              value: row.value ?? null,
            };
            if (row.type != null && String(row.type).trim()) {
              out.type = String(row.type).trim();
            }
            return out;
          }
          return { key, label: key, value: raw };
        }
        return { key, label: key, value: raw ?? null };
      },
    );
  }

  throw new BadRequestException(
    "custom_fields must be an array of {key,label,value,type?} or a record",
  );
}

/** Coerce stored Json to the API shape (always an array). */
export function readBookingCustomFields(stored: unknown): BookingCustomField[] {
  const normalized = normalizeBookingCustomFields(stored ?? []);
  return normalized ?? [];
}
