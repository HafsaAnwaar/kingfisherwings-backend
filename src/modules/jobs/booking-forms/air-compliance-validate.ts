import { BadRequestException } from "@nestjs/common";
import { ServiceScope } from "@prisma/client";
import {
  assertAirPalletLines,
  assertRequiredParties,
  assertServiceScopeAndDoors,
  requireFields,
} from "./booking-form-shared";
import { UpsertAirComplianceBookingFormDto } from "./dto/air-compliance-booking-form.dto";

export function validateAirComplianceFormSubmit(
  dto: UpsertAirComplianceBookingFormDto,
) {
  requireFields("Air compliance booking form", [
    [!!dto.origin_airport_code?.trim(), "origin_airport_code"],
    [!!dto.dest_airport_code?.trim(), "dest_airport_code"],
    [dto.pieces != null, "pieces"],
    [dto.gross_weight_kg != null, "gross_weight_kg"],
    [dto.chargeable_weight_kg != null, "chargeable_weight_kg"],
    [dto.volume_cbm != null, "volume_cbm"],
    [!!dto.commodity?.trim(), "commodity"],
    [!!dto.hs_code?.trim(), "hs_code"],
    [!!dto.final_use?.trim(), "final_use"],
    [!!dto.activity_sector, "activity_sector"],
    [!!dto.booking_agent_line?.trim(), "booking_agent_line"],
    [!!dto.agent_requester_name?.trim(), "agent_requester_name"],
  ]);

  assertServiceScopeAndDoors({
    service_scope: dto.service_scope as ServiceScope | undefined,
    origin_door_address: dto.origin_door_address,
    dest_door_address: dto.dest_door_address,
  });

  assertRequiredParties(dto.parties as { party_kind: string }[] | undefined);
  assertAirPalletLines(dto.pallet_count, dto.pallets);

  if (!dto.attach_commercial_invoice) {
    throw new BadRequestException(
      "Air compliance booking form incomplete: commercial_invoice",
    );
  }
}
