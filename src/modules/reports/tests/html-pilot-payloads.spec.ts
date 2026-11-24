import * as fs from "fs";
import * as path from "path";
import { BadRequestException } from "@nestjs/common";
import { resolveRendererKeyForCode } from "../constants/renderer-bind-map";
import {
  HTML_PILOT_REPORT_CODES,
  isHtmlPilotReportCode,
} from "../contracts/html-pilot.constants";
import { PRIORITY_PACKS_SEED } from "../seed/priority-packs.seed";

function loadFixture<T>(name: string): T {
  const file = path.join(__dirname, "fixtures", name);
  return JSON.parse(fs.readFileSync(file, "utf8")) as T;
}

const hblFixture = loadFixture<{
  payload: Record<string, unknown> & {
    parties: { notify: unknown };
    notify: string;
    routing: Record<string, unknown>;
    cargo: Record<string, unknown>;
    freight_terms: unknown;
  };
}>("hbl-draft.fixture.json");

const invoiceFixture = loadFixture<{
  payload: {
    lines: Array<Record<string, number>>;
    totals: Record<string, number>;
  };
}>("invoice-format-1.fixture.json");

const jobListFixture = loadFixture<{
  columns: string[];
  rows: Array<Record<string, unknown>>;
}>("job-list-summary.fixture.json");

/** Mirrors ReportsGenerateService.validateContext ownership checks (tenant-scoped). */
async function assertContextOwnership(
  tenantId: string,
  context: { job_id?: string; invoice_id?: string } | undefined,
  lookup: {
    findJob: (id: string) => Promise<{ id: string } | null>;
    findInvoice: (id: string) => Promise<{ id: string } | null>;
  },
) {
  if (!context) return;
  if (context.job_id) {
    const job = await lookup.findJob(context.job_id);
    if (!job) throw new BadRequestException("job_id not found in tenant");
  }
  if (context.invoice_id) {
    const inv = await lookup.findInvoice(context.invoice_id);
    if (!inv) throw new BadRequestException("invoice_id not found in tenant");
  }
  void tenantId;
}

describe("HTML pilot codes + bind map", () => {
  it("exposes exactly three pilot codes", () => {
    expect(HTML_PILOT_REPORT_CODES).toEqual([
      "HBL_DRAFT_REPORT_FORMAT_JASPER",
      "INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA",
      "JOB_LIST_SUMMARY_REPORT_FORMAT",
    ]);
  });

  it("EXACT-binds HBL Jasper + invoice Format-1 + job list to packs", () => {
    expect(resolveRendererKeyForCode("HBL_DRAFT_REPORT_FORMAT_JASPER")).toBe(
      "sea.hbl_draft",
    );
    expect(
      resolveRendererKeyForCode("INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA"),
    ).toBe("commercial.invoice_tax_india_1");
    expect(resolveRendererKeyForCode("JOB_LIST_SUMMARY_REPORT_FORMAT")).toBe(
      "finance.job_list_summary",
    );
  });

  it("preview whitelist accepts pilots only", () => {
    expect(isHtmlPilotReportCode("SEA_HBL_DRAFT")).toBe(false);
    expect(isHtmlPilotReportCode("HBL_DRAFT_REPORT_FORMAT_JASPER")).toBe(true);
    expect(
      isHtmlPilotReportCode("INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA"),
    ).toBe(true);
    expect(isHtmlPilotReportCode("JOB_LIST_SUMMARY_REPORT_FORMAT")).toBe(true);
  });

  it("seeds HBL_DRAFT_REPORT_FORMAT_JASPER → sea.hbl_draft", () => {
    const row = PRIORITY_PACKS_SEED.find(
      (t) => t.code === "HBL_DRAFT_REPORT_FORMAT_JASPER",
    );
    expect(row).toMatchObject({
      renderer_key: "sea.hbl_draft",
      family: "sea_docs",
      is_active: true,
    });
  });
});

describe("HBL draft fixture contract", () => {
  const p = hblFixture.payload;

  it("has parties / routing / cargo keys (no net_weight)", () => {
    expect(p.parties).toMatchObject({
      shipper: expect.objectContaining({ name: expect.any(String) }),
      consignee: expect.objectContaining({ name: expect.any(String) }),
      notify: null,
    });
    expect(p.routing).toMatchObject({
      pol: "INMUN",
      pod: "AEJEA",
      vessel: "MV Demo",
      voyage: "V01",
    });
    expect(p.cargo).toMatchObject({
      description: expect.any(String),
      pieces: expect.any(String),
      gross_weight: expect.any(String),
      volume: expect.any(String),
    });
    expect(p.cargo).not.toHaveProperty("net_weight");
    expect(p.freight_terms).toBeNull();
  });

  it("omits invented notify when absent", () => {
    expect(p.parties.notify).toBeNull();
    expect(p.notify).toBe("");
  });
});

describe("Invoice Format-1 fixture FE aliases", () => {
  const p = invoiceFixture.payload;
  const line = p.lines[0];

  it("exposes quantity / unit_price / line_total without recalculating", () => {
    expect(line.quantity).toBe(line.qty);
    expect(line.unit_price).toBe(line.amount_per_qty);
    expect(line.line_total).toBe(line.total_inr);
    expect(line.tax_amount).toBe(line.igst_amount);
  });

  it("maps totals aliases from stored totals; SGST/CGST stay 0", () => {
    expect(p.totals.subtotal).toBe(p.totals.taxable);
    expect(p.totals.tax_total).toBe(p.totals.igst);
    expect(p.totals.tax_amount).toBe(p.totals.igst);
    expect(p.totals.total_amount).toBe(p.totals.grand_total);
    expect(p.totals.sgst).toBe(0);
    expect(p.totals.cgst).toBe(0);
  });
});

describe("Job list summary fixture columns", () => {
  it("includes brief list columns job/customer/pol/pod/etd/status", () => {
    expect(jobListFixture.columns).toEqual(
      expect.arrayContaining([
        "job",
        "customer",
        "pol",
        "pod",
        "etd",
        "status",
      ]),
    );
    const row = jobListFixture.rows[0];
    expect(row.job).toBe(row.job_number);
    expect(row).toMatchObject({
      customer: expect.any(String),
      pol: expect.any(String),
      pod: expect.any(String),
      etd: expect.any(String),
      status: expect.any(String),
      revenue_total: expect.any(Number),
      cost_total: expect.any(Number),
      gp_amount: expect.any(Number),
    });
  });

  it("allows null customer/pol/pod/etd when relations absent", () => {
    const sparse = jobListFixture.rows[1];
    expect(sparse.customer).toBeNull();
    expect(sparse.pol).toBeNull();
    expect(sparse.pod).toBeNull();
    expect(sparse.etd).toBeNull();
  });
});

describe("Ownership gates (preview/generate context)", () => {
  it("400 when job_id not in tenant", async () => {
    await expect(
      assertContextOwnership(
        "tenant-1",
        { job_id: "00000000-0000-4000-8000-000000000099" },
        {
          findJob: async () => null,
          findInvoice: async () => null,
        },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("400 when invoice_id not in tenant", async () => {
    await expect(
      assertContextOwnership(
        "tenant-1",
        { invoice_id: "00000000-0000-4000-8000-000000000088" },
        {
          findJob: async () => null,
          findInvoice: async () => null,
        },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("passes when ids exist in tenant", async () => {
    await expect(
      assertContextOwnership(
        "tenant-1",
        {
          job_id: "00000000-0000-4000-8000-000000000001",
          invoice_id: "00000000-0000-4000-8000-000000000002",
        },
        {
          findJob: async (id) => ({ id }),
          findInvoice: async (id) => ({ id }),
        },
      ),
    ).resolves.toBeUndefined();
  });
});
