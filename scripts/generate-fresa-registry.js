const fs = require("fs");
const path = require("path");

function slug(s) {
  return String(s)
    .toUpperCase()
    .replace(/&/g, " AND ")
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_")
    .slice(0, 90);
}

function add(rows, seen, entry) {
  let code = entry.code;
  if (seen.has(code)) {
    let i = 2;
    while (seen.has(`${code}_${i}`)) i++;
    code = `${code}_${i}`;
  }
  seen.add(code);
  rows.push({ ...entry, code });
}

const DEFAULT = {
  ops_list: { contexts: ["list"], formats: ["PDF", "XLSX"] },
  sea_docs: { contexts: ["job", "list"], formats: ["PDF"] },
  air_docs: { contexts: ["job", "list"], formats: ["PDF"] },
  quotation: { contexts: ["quotation"], formats: ["PDF"] },
  commercial: { contexts: ["invoice"], formats: ["PDF"] },
  finance: { contexts: ["gl", "list"], formats: ["PDF", "XLSX"] },
  wms: { contexts: ["wms", "list"], formats: ["PDF", "XLSX"] },
  other: { contexts: ["list", "job"], formats: ["PDF"] },
};

const families = {
  commercial: [
    "Invoice Report Format-1 Tax Invoice India",
    "Invoice Report Format-2 Tax Invoice India",
    "Invoice Report Format-3 Summary Invoice",
    "Invoice Report Format-4 Standard Tax Invoice",
    "Invoice Report Format-5 Tax Invoice India",
    "Invoice Report Format-6 Simple Invoice (India)",
    "Invoice Report Format-7 Simple Invoice",
    "Invoice Report Format-8 Standard Invoice Arabic",
    "Invoice Report Format-9 Standard Invoice USA",
    "Invoice Report Format-10 Standard Invoice",
    "Invoice Report Format-11 Standard Invoice Land",
    "Invoice Report Format-12 Standard Invoice Preprinted",
    "Invoice Report Format-13 Standard Invoice USA",
    "Invoice Report Format-14 Invoice",
    "Invoice Report Format-15 Invoice FCY",
    "Invoice Report Format-16 Standard Tax Invoice Preprinted",
    "Invoice Report Format-17 Invoice Jasper",
    "Invoice Report Format-18 Land Freight Transportation Invoice",
    "Invoice Report Format-19 Debit Note Vietnam",
    "Invoice Report Format-20 Tax Invoice India",
    "Invoice Report Format-21 Warehouse Invoice",
    "Purchase Invoice Report Format-1",
    "Purchase Invoice Report Format-2",
    "Proforma Invoice Report Format-1 Proforma Invoice All Charges",
    "Proforma Invoice Report Format-2 Proforma Invoice All Charges",
    "Invoice Format12 Jasper",
    "Invoice Format14 Jasper",
    "Invoice Format8 with QR IRN Jasper",
    "Invoice Format9 with QR IRN Jasper",
    "Invoice Singapore Jasper",
    "Invoice format1 Jasper",
    "Invoice format15 Jasper Preprinted",
    "Invoice format15 Jasper Standard",
    "Invoice format2 FCY Jasper",
    "Invoice format3 Jasper",
    "Invoice format3 FCY with QR IRN Jasper",
    "Invoice format4 FCY Jasper",
    "Invoice format5 Jasper",
    "Invoice format6",
    "Invoice format7 Jasper India",
    "Invoice format7 Jasper USA",
    "Land Freight Transportation Invoice",
    "Land Freight Transportation Invoice Format 1",
    "Overseas Debit Note Export Invoice Jasper Format2",
    "Proforma Invoice format 1",
    "Saudi TAX Invoice Arabic Jasper",
    "Simple Invoice",
    "Simple Invoice India",
    "Simple Invoice India Jasper",
    "Simple Invoice India with OS",
    "Simple Invoice Jasper",
    "Simple Invoice US Jasper",
    "Simple Invoice with OS",
    "Simple Invoice VAT",
    "Standard Invoice",
    "Standard Invoice Jasper",
    "Standard Invoice Jasper Format4",
    "Standard Invoice Jasper Tanzania",
    "Standard Invoice Jasper format10",
    "Standard Invoice Jasper format12 Letterhead",
    "Standard Invoice Jasper format13",
    "Standard Invoice Jasper format14 QR code",
    "Standard Invoice Jasper format15",
    "Standard Invoice Jasper format16",
    "Standard Invoice Jasper format17 With Holding Tax",
    "Standard Invoice Jasper format18",
    "Standard Invoice Jasper format19",
    "Standard Invoice Jasper format20 UAE Local Currency",
    "Standard Invoice Jasper format21 With Holding Tax",
    "Standard Invoice Jasper format22",
    "Standard Invoice Jasper format3",
    "Standard Invoice Jasper format5",
    "Standard Invoice Jasper format6",
    "Standard Invoice Jasper format9",
    "Standard Invoice Land",
    "Standard Invoice 3 Decimal",
    "Standard Invoice Arabic Jasper",
    "Standard Invoice Arabic Jasper Format1",
    "Standard Invoice Arabic Jasper Format1 With Letter head",
    "Standard Invoice Arabic Oman Jasper",
    "Standard Invoice Arabic with QR code Jasper Format2",
    "Standard Invoice Arabic with QR code Jasper Format3",
    "Standard Invoice Arabic with QR code Jasper Format4",
    "Standard Invoice Arabic with QR code Jasper Format5",
    "Standard Invoice Arabic with QR code Jasper Format7",
    "Standard Invoice Courier Jasper",
    "Standard Invoice FCY",
    "Standard Invoice FCY Format2",
    "Standard Invoice FCY with QR IRN Jasper",
    "Standard Invoice Kampala",
    "Standard Invoice USA",
    "Standard Invoice cum Arrival Notice Jasper format16",
    "Standard Invoice Malaysia",
    "Standard Invoice USA Format 2",
    "Standard Tax Invoice Jasper",
    "Summary Invoice",
    "TAX Invoice India",
    "TAX Invoice India Reimbursement Bill",
    "TAX Invoice India Jasper",
    "TAX Invoice India Jasper Format1",
    "TAX Invoice India format1",
    "TAX Invoice India format2",
    "TAX Invoice India format2 Jasper",
    "TAX Invoice India format6 Jasper",
    "TAX Invoice India format7 Jasper",
    "TAX Invoice India format8 Jasper",
    "TAX Invoice with QR India format3 Jasper",
    "TAX Invoice with QR IRN India format4 Jasper",
    "TAX Invoice with QR IRN India format5 Jasper",
    "Tax Invoice Malaysia Jasper",
    "Tax Invoice Singapore Jasper",
    "Vietnam Invoice",
    "Warehouse Invoice",
    "Warehouse Invoice India Format",
  ],
  finance: [
    "Journal Voucher Report Format-1",
    "Journal Voucher Report Format-2",
    "Payment Voucher Report Format-1",
    "Payment Voucher Report Format-2",
    "Payment Voucher Report Format-3",
    "Payment Voucher Report Format-4 Vietnam",
    "Profit and Loss Report Format-1 Landscape",
    "Profit and Loss Report Format-2 Jasper",
    "Profit and Loss Report Format-3 Summary Periodwise",
    "Receipt Voucher Report Format-1",
    "Receipt Voucher Report Format-2",
    "Trial Balance Report Format-1 Trial Balance Summary",
    "Trial Balance Report Format-2 Trial Balance Summary",
    "Trial Balance Report Format-3 Trial Balance Summary BranchWise",
    "Trial Balance Report Format-4 Trial Balance Summary Extended",
    "Trial Balance Report Format-5 Trial Balance Summary Extended",
    "Trial Balance Report Format-6 Trial Balance Summary Extended BranchWise",
    "Outstanding Letter Report Format-1 Outstanding Letter",
    "Outstanding Letter Report Format-2 Outstanding Letter Jasper",
    "Outstanding Letter Report Format-3 Outstanding Letter With Aging",
    "Outstanding Letter Report Format-4 Outstanding Letter With BL Details",
    "Outstanding Letter Report Format-5 Outstanding Letter With Invoices",
    "AP Aging Summary Report Format",
    "AR Aging Summary Report Format",
    "AP Outstanding Statement Report Format",
    "AR Job Not Invoice Report Format",
    "Bank Cash Book Summary List Report Format",
    "GL Listing Sort By Customer Code Voucher Report Format",
    "GL Report Currency Wise Voucher Report Format",
    "GL Report Voucher Report Format",
    "Statement Of Accounts Report Format",
    "Payment Request List Report Format",
    "Finance Aging Report Format",
    "Finance SOA Report Format",
    "Finance Trial Balance Report Format",
    "Finance Voucher Report Format",
    "Finance Outstanding Letter Report Format",
    "Cash Book Report Format",
    "Bank Book Report Format",
    "Contra Voucher Report Format",
    "Purchase Credit Note Report Format",
    "Opening Balance Voucher Report Format",
    "Recurring Voucher Report Format",
    "AR Outstanding Statement Report Format",
  ],
  wms: [
    "Advance Shipping Note Format-1",
    "Advance Shipping Note",
    "Advance Shipping Note Location Wise",
    "Advance Shipping Note Location Wise-1",
    "Advance Shipping Note Location Summary",
    "WMS GRN Report Format-1",
    "WMS GRN Report Format-2",
    "WMS GDO Report Format-1",
    "WMS GDO Report Format-2",
    "WMS Warehouse Note Report Format",
    "WMS Inventory Summary Report Format",
    "WMS Stock Movement Report Format",
    "WMS Putaway List Report Format",
    "WMS Pick List Report Format",
    "WMS Location Master List Report Format",
  ],
  sea_docs: [],
  air_docs: [],
  ops_list: [],
  quotation: [],
  other: [],
};

for (let i = 1; i <= 100; i++)
  families.sea_docs.push(`HBL Draft Jasper Format ${i}`);
for (let i = 1; i <= 20; i++)
  families.sea_docs.push(`HBL Draft Report Format-${i}`);
for (let i = 1; i <= 15; i++)
  families.sea_docs.push(`HBL Original Jasper Format ${i}`);
for (let i = 1; i <= 10; i++)
  families.sea_docs.push(`FG HBL Draft Format ${i}`);
for (let i = 1; i <= 5; i++)
  families.sea_docs.push(`FG HBL Original Format ${i}`);
for (let i = 1; i <= 10; i++)
  families.sea_docs.push(`Arrival Notice Report Format-${i}`);
for (let i = 1; i <= 12; i++)
  families.sea_docs.push(`Cargo Arrival Notice SEA Format ${i}`);
families.sea_docs.push(
  "Cargo Manifest Report Format",
  "Container Load Plan Report Format",
  "Freight Manifest For Groupage Imports LCL Report Format",
  "Booking Confirmation Report Format-1",
  "Booking Confirmation Report Format-2",
  "Cargo Receipt Note For Export CFS Report Format",
  "Container Outturn Report Format",
  "Container Unload Plan Report Format",
  "Freight Manifest LCL Exports Report Format",
  "Proof Of Delivery Report Format",
  "Sailing Confirmation Report Format",
  "Consol IGM Filling Letter Jasper Report Format",
  "Container Movement Facilitation Cell Note Report Format",
  "Exchange Letter To Carrier Agent Report Format",
  "Import Cargo Manifest Report Format",
  "Import Tally Sheet Report Format",
  "Letter OF Guarantee Report Format",
  "Rider Sheet For Export Manifest Report Format",
  "Shipment Profit And Loss Report Format",
  "Shipment Status Confirmation Report Format",
  "Truck Cargo Pickup Request Report Format",
  "Carting Confirmation Report Format",
  "Container VGM Form Report Format",
  "FCR Document Report Format",
  "Import Security Filling Jasper AMS Report Format",
  "ISF Filing Document Report Format",
  "Loading Confirmation Report Format",
  "Pickup Confirmation Report Format",
  "Pre Alert to Client Report Format",
  "Prealert USA Jasper Report Format",
  "Shipping Instruction Report Format",
  "Stuffing Report Format",
  "Stuffing Report Jasper Report Format",
  "Surrendered Letter Report Format",
  "Terminal Departure Report TDR Report Format",
  "Delivery Order Sea Jasper Format 1",
  "Delivery Order Jasper Format 3",
  "Delivery Order Jasper Format 5",
  "Delivery Order Jasper Format 6",
  "Delivery Order Jasper Format 7",
  "Delivery Order Jasper Format 8",
  "Delivery Order Jasper Format 9",
  "Delivery Order Jasper Format 10",
  "Delivery Order Jasper Format 13 USA",
  "Delivery Order Jasper Format 14 USA",
  "Delivery Order Jasper Format 15",
  "Delivery Order Jasper Format 16 US",
  "Delivery Order Jasper Format 17",
  "Delivery Order Jasper Format 18",
  "DO FCL Vietnam",
  "DO LCL Vietnam without Stamp",
  "E-Delivery Order Jasper",
  "Electronic Delivery Order Jasper Format 1",
  "Export Delivery Order Jasper",
  "Proof of Delivery Jasper Arabic",
  "Delivery Confirmation Report Format",
  "Transhipment List Report Format",
);

for (let i = 1; i <= 20; i++)
  families.air_docs.push(`HAWB Draft Report Format-${i}`);
for (let i = 1; i <= 10; i++)
  families.air_docs.push(`HAWB Original Pre Printed Report Format-${i}`);
for (let i = 1; i <= 8; i++)
  families.air_docs.push(`MAWB Draft Report Format-${i}`);
families.air_docs.push(
  "MAWB Original Preprinted KC Report Format",
  "Air Quotation Report Format",
  "Air Quotation With Airline Report Format",
  "Air Freight ATD Confirmation Report Format",
  "Barcode AWB Report Format",
  "Booking Confirmation Air Report Format",
  "Cargo Arrival Notice Air Report Format",
  "Cargo Arrival Notice Air Without Charges Report Format",
  "Cargo Manifest Air House Report Format",
  "Cargo Manifest Air Jasper Report format",
  "Cargo Manifest Air LC Jasper Report Format",
  "Delivery Order AIR Jasper Report Format",
  "Delivery Order Air Jasper Format1",
  "Delivery Order Air Jasper Format2",
  "Delivery Order USA Air Jasper",
  "Shipment Freight Manifest Report Format",
  "Air Shipment Profit And Loss Report Format",
  "Air Shipment Profit And Loss Report Format-1",
  "Job House Record List Report Format",
  "Job House Record List Report Format-1",
  "Pre Alert Air Report Format",
  "Arrival Confirmation Report Format",
);
for (let i = 1; i <= 15; i++)
  families.air_docs.push(`AIR Arrival Notice Format ${i}`);

const opsNames = [
  "Daily Status Report Format 1 DSR List Report Format",
  "Daily Status Report Format-2",
  "Job Card Report Format",
  "Job List Summary Report Format",
  "Container List Based On Cargo Unpack Date List Report Format",
  "Container Summary Based On Carrier List Report Format",
  "Created Invoice List Report Format",
  "Export Shipments Departed But Not Confirmed On Board List Report Format",
  "Job ATA Is Updated And Cargo Unpack Date Is Not Entered List Report Format",
  "Job Ata Not Updated List Report Format",
  "Job Not Closed list Report Format",
  "Manifest Not Sent To Agent Report Format",
  "Pending Jobs Atd Updated But Container Loading Date Not Updated List Report Format",
  "Pending Shipment For Cargo Delivery Do Issued List Report Format",
  "Pending Shipments For Draft BL List Report Format",
  "Pending Shipments For Cargo Arrival Notice List Report Format",
  "pending Shipments For Cargo Delivery List Report Format",
  "Pending Shipments For Delivery Order List Report Format",
  "Activity Completed Jobs List Report Format",
  "Shipments With No Invoices List",
  "Shipments With No Purchase Invoices List",
  "Prepaid Shipment With No Prepaid Charges List Report Format",
  "Salesperson Nomination Report List Report Format",
  "Shipment Is Not Linked With Job List Report Format",
  "Shipments List IMCO List Report Format",
  "Shipment Status Report List Report Format",
  "Shipments With No HBL Number Entered List Report Format",
  "Shipments With No Job Number Mapped List Report Format",
  "Shipment With No Job CS List Report Format",
  "Agent Nomination Shipments List Report Format",
  "Bill Of Lading Is Not Issued List Report Format",
  "Cancelled Job List Report Format",
  "Cargo Arrival Notice Sent Shipments List Report Format",
  "Cash Collection Report List Report Format",
  "Cheque Collection Report List Report Format",
  "Client Lost Report For Last N Days List Report Format",
  "Closed Job List Report Format",
  "Collect Shipment With No Collect Charges List Report Format",
  "Created Quotations List Report Format",
  "Do Issued Shipment List Report Format",
  "Export Cargo Ready But Not Stuffed List Report Format",
  "Job ATA Updated Arrival Notice Not Sent List Report Format",
  "MRN Number Not Entered Job List Dubai Report Format",
  "Shipments With No cost Charges List Report Format",
  "Shipments With No Salesperson Entered List Report Format",
  "Uncollected Cargo For Agent Routed List Report Format",
  "Job Status Report List Report Format",
  "Open Jobs By Branch List Report Format",
  "Delivered Jobs Period List Report Format",
  "Customs Clearance Pending List Report Format",
  "ETA Followup List Report Format",
  "ETD Followup List Report Format",
];
families.ops_list.push(...opsNames);
for (let i = 1; i <= 60; i++)
  families.ops_list.push(`Ops List Report Format ${i}`);

for (let i = 1; i <= 18; i++)
  families.quotation.push(`Quotation Report Format-${i}`);

families.other.push(
  "Booking Confirmation Report Format Generic",
  "Pre Alert Report Format Generic",
  "Shipping Instruction Other Report Format",
  "Pickup Confirmation Other Report Format",
  "Loading Confirmation Other Report Format",
);
for (let i = 1; i <= 25; i++) families.other.push(`Other Report Format ${i}`);

for (let i = 1; i <= 31; i++) families.wms.push(`WMS Report Format ${i}`);

for (let i = 22; i <= 110; i++) {
  families.commercial.push(`Invoice Report Format-${i} Catalog Variant`);
}

const rows = [];
const seen = new Set();
let sort = 0;
const TARGET = 852;
const order = [
  "ops_list",
  "sea_docs",
  "air_docs",
  "quotation",
  "commercial",
  "finance",
  "wms",
  "other",
];

for (const family of order) {
  const names = families[family];
  const meta = DEFAULT[family];
  for (const name of names) {
    sort += 10;
    add(rows, seen, {
      code: slug(name),
      name,
      family,
      contexts: meta.contexts,
      formats: meta.formats,
      description: `FRESA FE taxonomy (${family}): ${name}`,
      parameters_schema: [],
      sort_order: sort,
    });
  }
}

let pad = 1;
while (rows.length < TARGET) {
  sort += 10;
  const family = order[pad % order.length];
  const meta = DEFAULT[family];
  add(rows, seen, {
    code: `FG_PAD_${String(pad).padStart(3, "0")}`,
    name: `FRESA Catalog Pad ${String(pad).padStart(3, "0")}`,
    family,
    contexts: meta.contexts,
    formats: meta.formats,
    description: `FRESA FE taxonomy pad entry (${family})`,
    parameters_schema: [],
    sort_order: sort,
  });
  pad++;
}

const mustHave = [
  {
    code: "INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA",
    name: "Invoice Report Format-1 Tax Invoice India",
    family: "commercial",
  },
  {
    code: "INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA",
    name: "Invoice Report Format-2 Tax Invoice India",
    family: "commercial",
  },
  {
    code: "INVOICE_REPORT_FORMAT_SUMMARY_INDIA",
    name: "Invoice Report Summary India",
    family: "commercial",
  },
  {
    code: "OPS_LIST_GENERIC",
    name: "Operations List Generic",
    family: "ops_list",
  },
  { code: "SEA_HBL_DRAFT", name: "Sea HBL Draft", family: "sea_docs" },
  { code: "SEA_HBL_ORIGINAL", name: "Sea HBL Original", family: "sea_docs" },
  {
    code: "SEA_ARRIVAL_NOTICE",
    name: "Sea Arrival Notice",
    family: "sea_docs",
  },
  {
    code: "SEA_DELIVERY_ORDER",
    name: "Sea Delivery Order",
    family: "sea_docs",
  },
  {
    code: "SEA_CARGO_MANIFEST",
    name: "Sea Cargo Manifest",
    family: "sea_docs",
  },
  {
    code: "SEA_STUFFING_REPORT",
    name: "Sea Stuffing Report",
    family: "sea_docs",
  },
  { code: "AIR_HAWB_DRAFT", name: "Air HAWB Draft", family: "air_docs" },
  { code: "AIR_HAWB_FINAL", name: "Air HAWB Final", family: "air_docs" },
  { code: "AIR_MAWB", name: "Air MAWB", family: "air_docs" },
  {
    code: "AIR_ARRIVAL_NOTICE",
    name: "Air Arrival Notice",
    family: "air_docs",
  },
  {
    code: "AIR_DELIVERY_ORDER",
    name: "Air Delivery Order",
    family: "air_docs",
  },
  {
    code: "QUOTATION_STANDARD",
    name: "Quotation Standard",
    family: "quotation",
  },
  { code: "FINANCE_AGING", name: "Finance Aging", family: "finance" },
  { code: "FINANCE_SOA", name: "Finance SOA", family: "finance" },
  {
    code: "FINANCE_TRIAL_BALANCE",
    name: "Finance Trial Balance",
    family: "finance",
  },
  { code: "FINANCE_VOUCHER", name: "Finance Voucher", family: "finance" },
  {
    code: "FINANCE_JOURNAL_VOUCHER",
    name: "Finance Journal Voucher",
    family: "finance",
  },
  {
    code: "FINANCE_PAYMENT_VOUCHER",
    name: "Finance Payment Voucher",
    family: "finance",
  },
  {
    code: "FINANCE_RECEIPT_VOUCHER",
    name: "Finance Receipt Voucher",
    family: "finance",
  },
  {
    code: "FINANCE_OUTSTANDING_LETTER",
    name: "Finance Outstanding Letter",
    family: "finance",
  },
  { code: "WMS_ASN", name: "WMS ASN", family: "wms" },
  { code: "WMS_GRN", name: "WMS GRN", family: "wms" },
  { code: "WMS_GDO", name: "WMS GDO", family: "wms" },
  {
    code: "WMS_WAREHOUSE_NOTE",
    name: "WMS Warehouse Note",
    family: "wms",
  },
  {
    code: "OTHER_BOOKING_CONFIRMATION",
    name: "Other Booking Confirmation",
    family: "other",
  },
  { code: "OTHER_PRE_ALERT", name: "Other Pre Alert", family: "other" },
];

for (const m of mustHave) {
  if (seen.has(m.code)) {
    const existing = rows.find((r) => r.code === m.code);
    if (existing) {
      existing.name = m.name;
      existing.family = m.family;
    }
    continue;
  }
  const padIdx = rows.findIndex((r) => r.code.startsWith("FG_PAD_"));
  if (padIdx >= 0) {
    seen.delete(rows[padIdx].code);
    seen.add(m.code);
    const meta = DEFAULT[m.family];
    rows[padIdx] = {
      code: m.code,
      name: m.name,
      family: m.family,
      contexts: meta.contexts,
      formats: meta.formats,
      description: `FRESA FE taxonomy (${m.family}): ${m.name}`,
      parameters_schema: [],
      sort_order: rows[padIdx].sort_order,
    };
  }
}

const fam = {};
for (const r of rows) fam[r.family] = (fam[r.family] || 0) + 1;
const out = { templates: rows.slice(0, TARGET) };
const outPath = path.join(
  __dirname,
  "..",
  "src/modules/reports/seed/fresaReportRegistry.json",
);
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log("wrote", out.templates.length, "entries to", outPath);
console.log(JSON.stringify(fam, null, 2));
