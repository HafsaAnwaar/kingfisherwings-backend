import { QuotationStatus } from "@prisma/client";
import { quotationActionFlags } from "./quotation-action-flags";

describe("quotationActionFlags", () => {
  it("gives customer accept/reject/negotiate on SENT, not admin", () => {
    expect(quotationActionFlags("SENT" as QuotationStatus)).toEqual({
      can_accept: true,
      can_reject: true,
      can_negotiate: true,
      can_admin_accept: false,
      can_admin_reject: false,
      can_verify: true,
      can_generate_shipment: false,
      can_generate_job: false,
      can_convert_to_job: false,
    });
  });

  it("unlocks admin accept/reject only while NEGOTIATING", () => {
    expect(quotationActionFlags("NEGOTIATING" as QuotationStatus)).toEqual({
      can_accept: true,
      can_reject: true,
      can_negotiate: true,
      can_admin_accept: true,
      can_admin_reject: true,
      can_verify: true,
      can_generate_shipment: false,
      can_generate_job: false,
      can_convert_to_job: false,
    });
  });

  it("hides customer and admin outcomes on APPROVED; allows generate + convert", () => {
    expect(quotationActionFlags("APPROVED" as QuotationStatus)).toEqual({
      can_accept: false,
      can_reject: false,
      can_negotiate: false,
      can_admin_accept: false,
      can_admin_reject: false,
      can_verify: false,
      can_generate_shipment: true,
      can_generate_job: true,
      can_convert_to_job: true,
    });
  });

  it("allows can_verify on VERIFIED path precursor; generate locked until APPROVED", () => {
    expect(quotationActionFlags("VERIFIED" as QuotationStatus)).toMatchObject({
      can_verify: false,
      can_generate_shipment: false,
      can_generate_job: false,
      can_convert_to_job: false,
    });
  });
});
