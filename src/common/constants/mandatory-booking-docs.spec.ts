import {
  bookingDocsStatus,
  missingMandatoryBookingDocs,
  complianceDocAttachPatch,
  modeDocAttachPatch,
  MANDATORY_BOOKING_DOC_KINDS,
} from "./mandatory-booking-docs";

describe("mandatory-booking-docs", () => {
  it("requires all five kinds when empty", () => {
    expect(missingMandatoryBookingDocs({})).toEqual([
      ...MANDATORY_BOOKING_DOC_KINDS,
    ]);
  });

  it("passes when compliance-style keys are present", () => {
    const form = {
      attach_commercial_invoice: true,
      attach_packing_list: true,
      attach_bill_of_lading: true,
      attach_licence: true,
      attach_uat_tax_certificate: true,
      doc_commercial_invoice_key: "a",
      doc_packing_list_key: "b",
      doc_bill_of_lading_key: "c",
      doc_licence_key: "d",
      doc_uat_tax_certificate_key: "e",
    };
    expect(missingMandatoryBookingDocs(form)).toEqual([]);
    expect(bookingDocsStatus(form).uploaded).toHaveLength(5);
  });

  it("accepts mode-form bl_awb_copy for bill_of_lading", () => {
    expect(
      missingMandatoryBookingDocs({
        attach_commercial_invoice: true,
        attach_packing_list: true,
        attach_bl_awb_copy: true,
        attach_licence: true,
        attach_uat_tax_certificate: true,
        doc_commercial_invoice_key: "a",
        doc_packing_list_key: "b",
        doc_bl_awb_copy_key: "c",
        doc_licence_key: "d",
        doc_uat_tax_certificate_key: "e",
      }),
    ).toEqual([]);
  });

  it("builds attach patches", () => {
    expect(complianceDocAttachPatch("packing_list", "k1")).toEqual({
      doc_packing_list_key: "k1",
      attach_packing_list: true,
    });
    expect(modeDocAttachPatch("bill_of_lading", "k2")).toEqual({
      doc_bl_awb_copy_key: "k2",
      attach_bl_awb_copy: true,
    });
  });
});
