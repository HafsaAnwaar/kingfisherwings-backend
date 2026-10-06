import { BadRequestException } from "@nestjs/common";
import { NvoccBookingPartyKind, ServiceScope } from "@prisma/client";
import { UpsertNvoccBookingFormDto } from "../../modules/nvocc/dto/nvocc-booking-form.dto";
import {
  assertContainerLines,
  assertRequiredParties,
  assertServiceScopeAndDoors,
} from "../../modules/jobs/booking-forms/booking-form-shared";
import { missingMandatoryBookingDocs } from "../constants/mandatory-booking-docs";

const REQUIRED_PARTIES: NvoccBookingPartyKind[] = [
  "SHIPPER",
  "CONSIGNEE",
  "NOTIFY",
];

/** NVOCC compliance booking form submit validation. */
export function validateComplianceFormSubmit(
  dto: UpsertNvoccBookingFormDto,
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
      `Compliance booking form incomplete: upload required documents (${docsMissing.join(", ")})`,
    );
  }
}
