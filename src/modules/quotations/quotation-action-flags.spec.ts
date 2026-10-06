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
    });
  });

  it("unlocks admin accept/reject only while NEGOTIATING", () => {
    expect(quotationActionFlags("NEGOTIATING" as QuotationStatus)).toEqual({
      can_accept: true,
      can_reject: true,
      can_negotiate: true,
      can_admin_accept: true,
      can_admin_reject: true,
    });
  });

  it("hides customer and admin outcomes on APPROVED", () => {
    expect(quotationActionFlags("APPROVED" as QuotationStatus)).toEqual({
      can_accept: false,
      can_reject: false,
      can_negotiate: false,
      can_admin_accept: false,
      can_admin_reject: false,
    });
  });
});
