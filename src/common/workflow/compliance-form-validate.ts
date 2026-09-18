import { BadRequestException } from "@nestjs/common";
import { NvoccBookingPartyKind } from "@prisma/client";
import { UpsertNvoccBookingFormDto } from "../../modules/nvocc/dto/nvocc-booking-form.dto";

const REQUIRED_PARTIES: NvoccBookingPartyKind[] = [
  "SHIPPER",
  "CONSIGNEE",
  "NOTIFY",
];

/** Shared Kingfisher 8-step compliance form submit validation (NVOCC + Air). */
export function validateComplianceFormSubmit(dto: UpsertNvoccBookingFormDto) {
  const missing: string[] = [];
  if (dto.teu_count == null) missing.push("teu_count");
  if (!dto.pol?.trim()) missing.push("pol");
  if (!dto.pod?.trim()) missing.push("pod");
  if (dto.gross_weight_kg == null) missing.push("gross_weight_kg");
  if (dto.net_weight_kg == null) missing.push("net_weight_kg");
  if (!dto.commodity?.trim()) missing.push("commodity");
  if (!dto.hs_code?.trim()) missing.push("hs_code");
  if (!dto.final_use?.trim()) missing.push("final_use");
  if (!dto.activity_sector) missing.push("activity_sector");
  if (!dto.booking_agent_line?.trim()) missing.push("booking_agent_line");
  if (!dto.agent_requester_name?.trim()) missing.push("agent_requester_name");

  const kinds = new Set(dto.parties?.map((p) => p.party_kind) ?? []);
  for (const k of REQUIRED_PARTIES) {
    if (!kinds.has(k)) missing.push(`parties.${k}`);
  }
  for (const p of dto.parties ?? []) {
    if (!p.full_name?.trim() || !p.address?.trim()) {
      missing.push(`${p.party_kind}.full_name_or_address`);
    }
    if (!p.city?.trim()) missing.push(`${p.party_kind}.city`);
    if (!p.country?.trim()) missing.push(`${p.party_kind}.country`);
    if (!p.entity_kind) missing.push(`${p.party_kind}.entity_kind`);
  }

  if (missing.length) {
    throw new BadRequestException(
      `Compliance booking form incomplete: ${missing.join(", ")}`,
    );
  }
}
