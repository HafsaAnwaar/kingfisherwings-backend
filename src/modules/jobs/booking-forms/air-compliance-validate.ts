import { BadRequestException } from "@nestjs/common";
import { ServiceScope } from "@prisma/client";
import {
  assertAirPalletLines,
  assertRequiredParties,
  assertServiceScopeAndDoors,
  requireFields,
} from "./booking-form-shared";
import { UpsertAirComplianceBookingFormDto } from "./dto/air-compliance-booking-form.dto";
import { missingMandatoryBookingDocs } from "../../../common/constants/mandatory-booking-docs";

export function validateAirComplianceFormSubmit(
  dto: UpsertAirComplianceBookingFormDto,
  stored?: {
    attach_commercial_invoice?: boolean | null;
    attach_packing_list?: boolean | null;
    attach_bill_of_lading?: boolean | null;
    attach_licence?: boolean | null;
    attach_uat_tax_certificate?: boolean | null;
    doc_commercial_invoice_key?: string | null;
    doc_packing_list_key?: string | null;
    doc_bill_of_lading_key?: string | null;
    doc_licence_key?: string | null;
    doc_uat_tax_certificate_key?: string | null;
  },
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

  const merged = {
    attach_commercial_invoice:
      stored?.attach_commercial_invoice ?? dto.attach_commercial_invoice,
    attach_packing_list: stored?.attach_packing_list ?? dto.attach_packing_list,
    attach_bill_of_lading:
      stored?.attach_bill_of_lading ?? dto.attach_bill_of_lading,
    attach_licence: stored?.attach_licence ?? dto.attach_licence,
    attach_uat_tax_certificate:
      stored?.attach_uat_tax_certificate ?? dto.attach_uat_tax_certificate,
    doc_commercial_invoice_key: stored?.doc_commercial_invoice_key,
    doc_packing_list_key: stored?.doc_packing_list_key,
    doc_bill_of_lading_key: stored?.doc_bill_of_lading_key,
    doc_licence_key: stored?.doc_licence_key,
    doc_uat_tax_certificate_key: stored?.doc_uat_tax_certificate_key,
  };
  const docsMissing = missingMandatoryBookingDocs(merged);
  if (docsMissing.length) {
    throw new BadRequestException(
      `Air compliance booking form incomplete: upload required documents (${docsMissing.join(", ")})`,
    );
  }
}
