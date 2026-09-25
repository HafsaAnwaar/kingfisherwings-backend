import { BadRequestException } from "@nestjs/common";
import { NvoccBookingPartyKind, ServiceScope } from "@prisma/client";
import { UpsertNvoccBookingFormDto } from "../../modules/nvocc/dto/nvocc-booking-form.dto";
import {
  assertContainerLines,
  assertRequiredParties,
  assertServiceScopeAndDoors,
} from "../../modules/jobs/booking-forms/booking-form-shared";

const REQUIRED_PARTIES: NvoccBookingPartyKind[] = [
  "SHIPPER",
  "CONSIGNEE",
  "NOTIFY",
];

/** NVOCC compliance booking form submit validation. */
export function validateComplianceFormSubmit(dto: UpsertNvoccBookingFormDto) {
  const missing: string[] = [];
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

  if (missing.length) {
    throw new BadRequestException(
      `Compliance booking form incomplete: ${missing.join(", ")}`,
    );
  }

  assertServiceScopeAndDoors({
    service_scope: dto.service_scope as ServiceScope | undefined,
    origin_door_address: dto.origin_door_address,
    dest_door_address: dto.dest_door_address,
  });

  assertRequiredParties(
    dto.parties as { party_kind: string }[] | undefined,
    REQUIRED_PARTIES,
  );

  if (dto.containers?.length) {
    assertContainerLines(dto.containers);
  } else if (dto.teu_count == null) {
    throw new BadRequestException(
      "Compliance booking form incomplete: containers or teu_count",
    );
  }
}
