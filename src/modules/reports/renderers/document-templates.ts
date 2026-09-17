/** Pack-owned HTML shells for document-kind report PDFs. */
import * as Handlebars from "handlebars";

const DOC_BASE_STYLE = `
  body { font-family: Arial, Helvetica, sans-serif; font-size: 10px; color: #111; margin: 16px; }
  h1 { font-size: 16px; margin: 0 0 4px; }
  h2 { font-size: 13px; margin: 12px 0 6px; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; }
  th, td { border: 1px solid #999; padding: 3px 5px; vertical-align: top; }
  th { background: #eee; font-weight: 600; }
  .header { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 8px; }
  .logo { max-height: 48px; max-width: 140px; }
  .title-bar { background: #1a3a5c; color: #fff; text-align: center; padding: 6px; font-size: 14px; font-weight: 700; letter-spacing: 1px; margin: 8px 0; }
  .muted { color: #555; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .box { border: 1px solid #999; padding: 6px; }
  .right { text-align: right; }
  .totals { margin-top: 8px; width: 45%; margin-left: auto; }
  .footer { margin-top: 16px; font-size: 9px; color: #444; border-top: 1px solid #ccc; padding-top: 6px; }
  .terms li { margin-bottom: 2px; }
`;

export const DOCUMENT_HTML_TEMPLATES: Record<string, string> = {
  "document.generic": `
<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${DOC_BASE_STYLE}</style></head>
<body>
  <div class="header"><div><h1>{{branding.company_name}}</h1>
  {{#if branding.address}}<div class="muted">{{branding.address}}</div>{{/if}}
  {{#if branding.vat_number}}<div>GSTIN/VAT: {{branding.vat_number}}</div>{{/if}}</div></div>
  <div class="title-bar">{{title}}</div>
  <pre style="white-space:pre-wrap;font-size:10px;">{{json payload}}</pre>
  <div class="footer">Generated {{generated_at}} · Computer generated document</div>
</body></html>`,

  "commercial.invoice_tax_india_1": `
<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${DOC_BASE_STYLE}</style></head>
<body>
  <div class="header">
    <div>
      {{#if company.logo_url}}<img class="logo" src="{{company.logo_url}}" alt="logo"/>{{/if}}
      <h1>{{company.name}}</h1>
      {{#each company.address_lines}}<div>{{this}}</div>{{/each}}
      {{#if company.website}}<div>{{company.website}}</div>{{/if}}
      {{#if company.gstin}}<div><strong>GSTIN:</strong> {{company.gstin}}</div>{{/if}}
    </div>
    <div class="right">
      <div><strong>Invoice No:</strong> {{invoice.number}}</div>
      <div><strong>Date:</strong> {{invoice.invoice_date}}</div>
      {{#if invoice.due_date}}<div><strong>Due Date:</strong> {{invoice.due_date}}</div>{{/if}}
      {{#if invoice.status}}<div><strong>Status:</strong> {{invoice.status}}</div>{{/if}}
    </div>
  </div>
  <div class="title-bar">TAX INVOICE</div>
  <div class="grid-2">
    <div class="box">
      <strong>Bill To</strong>
      <div>{{bill_to.name}}</div>
      {{#each bill_to.address_lines}}<div>{{this}}</div>{{/each}}
      {{#if bill_to.phone}}<div>Phone: {{bill_to.phone}}</div>{{/if}}
      {{#if bill_to.gstin}}<div>GSTIN: {{bill_to.gstin}}</div>{{/if}}
    </div>
    <div class="box">
      <strong>Shipment</strong>
      {{#if shipment}}
      <div>Shipper: {{shipment.shipper}}</div>
      <div>Consignee: {{shipment.consignee}}</div>
      <div>Job: {{shipment.job_no}} · Shipment: {{shipment.shipment_no}}</div>
      <div>MBL/MAWB: {{shipment.mbl_mawb}} · HBL/HAWB: {{shipment.hbl_hawb}}</div>
      <div>POR: {{shipment.por}} · POL: {{shipment.pol}} · POD: {{shipment.pod}}</div>
      <div>Vessel/Voyage: {{shipment.vessel_voyage}}</div>
      <div>ETD: {{shipment.etd}} · ETA: {{shipment.eta}}</div>
      <div>Currency: {{invoice.currency_code}} · Rate: {{invoice.exchange_rate}}</div>
      {{#if shipment.inco_terms}}<div>INCO: {{shipment.inco_terms}}</div>{{/if}}
      {{#if shipment.reference_no}}<div>Ref: {{shipment.reference_no}}</div>{{/if}}
      {{#if invoice.narration}}<div>Narration: {{invoice.narration}}</div>{{/if}}
      {{#if invoice.remarks}}<div>Remarks: {{invoice.remarks}}</div>{{/if}}
      {{else}}<div class="muted">No linked shipment</div>{{/if}}
    </div>
  </div>

  {{#if containers.length}}
  <h2>Containers</h2>
  <table>
    <thead><tr><th>Container</th><th>Type</th><th>Pcs</th><th>G.Wt</th><th>Volume</th><th>Vol.Wt</th></tr></thead>
    <tbody>
      {{#each containers}}
      <tr>
        <td>{{container_no}}</td><td>{{type}}</td><td>{{pieces}}</td>
        <td>{{gross_weight}}</td><td>{{volume}}</td><td>{{volume_weight}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>
  {{/if}}

  <h2>Charges</h2>
  <table>
    <thead>
      <tr>
        <th>Description</th><th>SAC/HSN</th><th>Qty</th><th>Rate</th><th>FCY</th>
        <th>Taxable</th><th>Non-Tax</th><th>SGST</th><th>CGST</th><th>IGST</th><th>Total</th>
      </tr>
    </thead>
    <tbody>
      {{#each lines}}
      <tr>
        <td>{{description}}</td><td>{{sac_hsn}}</td><td class="right">{{qty}}</td>
        <td class="right">{{amount_per_qty}}</td><td class="right">{{fcy_amount}}</td>
        <td class="right">{{taxable_amount}}</td><td class="right">{{non_taxable_amount}}</td>
        <td class="right">{{sgst_amount}}</td><td class="right">{{cgst_amount}}</td>
        <td class="right">{{igst_amount}}</td><td class="right">{{total_inr}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  <table class="totals">
    <tr><td>Taxable</td><td class="right">{{totals.taxable}}</td></tr>
    <tr><td>Non-taxable</td><td class="right">{{totals.non_taxable}}</td></tr>
    <tr><td>SGST</td><td class="right">{{totals.sgst}}</td></tr>
    <tr><td>CGST</td><td class="right">{{totals.cgst}}</td></tr>
    <tr><td>IGST</td><td class="right">{{totals.igst}}</td></tr>
    <tr><td><strong>Grand Total</strong></td><td class="right"><strong>{{totals.grand_total}}</strong></td></tr>
  </table>
  <div><strong>Amount in words:</strong> {{totals.amount_in_words}}</div>
  {{#if gst_note}}<div class="muted" style="margin-top:4px;">{{gst_note}}</div>{{/if}}

  {{#if terms.length}}
  <h2>Terms</h2>
  <ul class="terms">{{#each terms}}<li>{{this}}</li>{{/each}}</ul>
  {{/if}}

  {{#if bank}}
  <h2>Bank Details</h2>
  <div class="box">
    <div>Beneficiary: {{bank.beneficiary_name}}</div>
    <div>Bank: {{bank.bank_name}}</div>
    <div>A/C: {{bank.account_no}}</div>
    {{#if bank.iban}}<div>IBAN: {{bank.iban}}</div>{{/if}}
    {{#if bank.swift}}<div>SWIFT: {{bank.swift}}</div>{{/if}}
  </div>
  {{/if}}

  <div class="footer">
    This is a computer-generated tax invoice.
    {{#if footer.created_by}} Created by {{footer.created_by}}.{{/if}}
    Generated {{footer.generated_at}}{{#if footer.timezone}} ({{footer.timezone}}){{/if}}.
  </div>
</body></html>`,

  "commercial.invoice_tax_india_2": `
<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${DOC_BASE_STYLE}</style></head>
<body>
  <div class="header"><div><h1>{{company.name}}</h1>
  {{#each company.address_lines}}<div>{{this}}</div>{{/each}}
  {{#if company.gstin}}<div>GSTIN: {{company.gstin}}</div>{{/if}}</div>
  <div class="right"><div>No: {{invoice.number}}</div><div>{{invoice.invoice_date}}</div></div></div>
  <div class="title-bar">TAX INVOICE (FORMAT 2)</div>
  <div class="box"><strong>Bill To:</strong> {{bill_to.name}} {{#if bill_to.gstin}}(GSTIN {{bill_to.gstin}}){{/if}}</div>
  <table>
    <thead><tr><th>Description</th><th>Qty</th><th>Amount</th><th>Tax</th><th>Total</th></tr></thead>
    <tbody>
      {{#each lines}}
      <tr><td>{{description}}</td><td class="right">{{qty}}</td>
      <td class="right">{{taxable_amount}}</td><td class="right">{{igst_amount}}</td>
      <td class="right">{{total_inr}}</td></tr>
      {{/each}}
    </tbody>
  </table>
  <p><strong>Grand Total:</strong> {{totals.grand_total}} — {{totals.amount_in_words}}</p>
  <div class="footer">Generated {{generated_at}}</div>
</body></html>`,

  "commercial.invoice_summary_india": `
<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${DOC_BASE_STYLE}</style></head>
<body>
  <h1>{{company.name}}</h1>
  <div class="title-bar">TAX INVOICE SUMMARY</div>
  <p>{{bill_to.name}} · Invoice {{invoice.number}} · {{invoice.invoice_date}}</p>
  <p><strong>Total:</strong> {{totals.grand_total}} ({{invoice.currency_code}})</p>
  <p>{{totals.amount_in_words}}</p>
  <div class="footer">Generated {{generated_at}}</div>
</body></html>`,

  "sea.hbl_draft": `
<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${DOC_BASE_STYLE}</style></head>
<body>
  <div class="title-bar">HOUSE BILL OF LADING — DRAFT</div>
  <div class="header"><div><h1>{{branding.company_name}}</h1></div>
  <div class="right"><div>HBL: {{hbl_number}}</div><div>Job: {{job_number}}</div></div></div>
  <div class="grid-2">
    <div class="box"><strong>Shipper</strong><div>{{shipper}}</div></div>
    <div class="box"><strong>Consignee</strong><div>{{consignee}}</div></div>
  </div>
  <div class="box" style="margin-top:8px;">
    <div>POL: {{pol}} · POD: {{pod}}</div>
    <div>Vessel/Voyage: {{vessel_voyage}}</div>
    <div>ETD: {{etd}} · ETA: {{eta}}</div>
    <div>Containers: {{containers}}</div>
    <div>Commodity: {{commodity}}</div>
  </div>
  <div class="footer">DRAFT — not for negotiation · {{generated_at}}</div>
</body></html>`,

  "sea.hbl_original": `
<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${DOC_BASE_STYLE}</style></head>
<body>
  <div class="title-bar">HOUSE BILL OF LADING — ORIGINAL</div>
  <div class="header"><div><h1>{{branding.company_name}}</h1></div>
  <div class="right"><div>HBL: {{hbl_number}}</div><div>Job: {{job_number}}</div></div></div>
  <div class="grid-2">
    <div class="box"><strong>Shipper</strong><div>{{shipper}}</div></div>
    <div class="box"><strong>Consignee</strong><div>{{consignee}}</div></div>
  </div>
  <div class="box" style="margin-top:8px;">
    <div>POL: {{pol}} · POD: {{pod}}</div>
    <div>Vessel/Voyage: {{vessel_voyage}}</div>
    <div>Containers: {{containers}}</div>
  </div>
  <div class="footer">ORIGINAL · {{generated_at}}</div>
</body></html>`,

  "sea.arrival_notice": `
<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${DOC_BASE_STYLE}</style></head>
<body>
  <div class="title-bar">ARRIVAL NOTICE</div>
  <h1>{{branding.company_name}}</h1>
  <p>Job {{job_number}} · HBL/HAWB {{hbl_number}}</p>
  <p>Vessel/Flight: {{vessel_voyage}} · ETA {{eta}}</p>
  <p>POD: {{pod}} · Consignee: {{consignee}}</p>
  <p>Containers: {{containers}}</p>
  <div class="footer">{{generated_at}}</div>
</body></html>`,

  "sea.delivery_order": `
<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${DOC_BASE_STYLE}</style></head>
<body>
  <div class="title-bar">DELIVERY ORDER</div>
  <h1>{{branding.company_name}}</h1>
  <p>Job {{job_number}} · DO Ref {{doc_ref}}</p>
  <p>Consignee: {{consignee}}</p>
  <p>Containers: {{containers}}</p>
  <p>Please release cargo against this delivery order.</p>
  <div class="footer">{{generated_at}}</div>
</body></html>`,

  "air.hawb_draft": `
<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${DOC_BASE_STYLE}</style></head>
<body>
  <div class="title-bar">HOUSE AIR WAYBILL — DRAFT</div>
  <h1>{{branding.company_name}}</h1>
  <p>HAWB {{hawb_number}} · MAWB {{mawb_number}} · Job {{job_number}}</p>
  <p>Shipper: {{shipper}} · Consignee: {{consignee}}</p>
  <p>Origin {{origin}} → Dest {{dest}} · Flight {{flight}}</p>
  <div class="footer">DRAFT · {{generated_at}}</div>
</body></html>`,

  "air.hawb_final": `
<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${DOC_BASE_STYLE}</style></head>
<body>
  <div class="title-bar">HOUSE AIR WAYBILL — FINAL</div>
  <h1>{{branding.company_name}}</h1>
  <p>HAWB {{hawb_number}} · MAWB {{mawb_number}} · Job {{job_number}}</p>
  <p>Shipper: {{shipper}} · Consignee: {{consignee}}</p>
  <p>Origin {{origin}} → Dest {{dest}} · Flight {{flight}}</p>
  <div class="footer">FINAL · {{generated_at}}</div>
</body></html>`,

  "air.mawb": `
<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${DOC_BASE_STYLE}</style></head>
<body>
  <div class="title-bar">MASTER AIR WAYBILL</div>
  <h1>{{branding.company_name}}</h1>
  <p>MAWB {{mawb_number}} · Job {{job_number}}</p>
  <p>Airline / Flight: {{flight}}</p>
  <p>Origin {{origin}} → Dest {{dest}}</p>
  <div class="footer">{{generated_at}}</div>
</body></html>`,

  "air.arrival_notice": `
<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${DOC_BASE_STYLE}</style></head>
<body>
  <div class="title-bar">AIR ARRIVAL NOTICE</div>
  <h1>{{branding.company_name}}</h1>
  <p>Job {{job_number}} · HAWB {{hawb_number}} · MAWB {{mawb_number}}</p>
  <p>Flight {{flight}} · ETA {{eta}} · Dest {{dest}}</p>
  <div class="footer">{{generated_at}}</div>
</body></html>`,

  "air.delivery_order": `
<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${DOC_BASE_STYLE}</style></head>
<body>
  <div class="title-bar">AIR DELIVERY ORDER</div>
  <h1>{{branding.company_name}}</h1>
  <p>Job {{job_number}} · HAWB {{hawb_number}}</p>
  <p>Consignee: {{consignee}}</p>
  <div class="footer">{{generated_at}}</div>
</body></html>`,

  "quotation.standard": `
<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${DOC_BASE_STYLE}</style></head>
<body>
  <div class="title-bar">QUOTATION</div>
  <h1>{{branding.company_name}}</h1>
  <p>Quote {{quote_number}} · {{quote_date}} · {{status}}</p>
  <p>Customer: {{party_name}}</p>
  <p>Origin {{origin}} → Dest {{dest}} · Mode {{mode}}</p>
  <table>
    <thead><tr><th>Charge</th><th>Amount</th></tr></thead>
    <tbody>{{#each lines}}<tr><td>{{description}}</td><td class="right">{{amount}}</td></tr>{{/each}}</tbody>
  </table>
  <p><strong>Total:</strong> {{total}} {{currency}}</p>
  <div class="footer">Catalog format — default quotation PDF unchanged · {{generated_at}}</div>
</body></html>`,

  "finance.outstanding_letter": `
<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${DOC_BASE_STYLE}</style></head>
<body>
  <div class="title-bar">OUTSTANDING LETTER</div>
  <h1>{{branding.company_name}}</h1>
  <p>Dear {{party_name}},</p>
  <p>Your outstanding balance is <strong>{{balance}}</strong> {{currency}} as of {{as_of}}.</p>
  <table>
    <thead><tr><th>Invoice</th><th>Date</th><th>Due</th><th>Balance</th></tr></thead>
    <tbody>{{#each invoices}}<tr><td>{{number}}</td><td>{{date}}</td><td>{{due}}</td><td class="right">{{balance}}</td></tr>{{/each}}</tbody>
  </table>
  <div class="footer">{{generated_at}}</div>
</body></html>`,

  "wms.warehouse_note": `
<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${DOC_BASE_STYLE}</style></head>
<body>
  <div class="title-bar">WAREHOUSE NOTE</div>
  <h1>{{branding.company_name}}</h1>
  <p>Ref {{ref}} · Warehouse {{warehouse}}</p>
  <p>{{notes}}</p>
  <div class="footer">{{generated_at}}</div>
</body></html>`,
};

Handlebars.registerHelper("json", (ctx: unknown) =>
  JSON.stringify(ctx ?? {}, null, 2),
);
