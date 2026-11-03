/** Pack-owned HTML shells for document-kind report PDFs — Fresa form chrome (not KF theme). */
import * as Handlebars from "handlebars";

/** Shared body chrome — black borders, sample-form geometry. Branding slots only swap identity. */
const DOC_BASE_STYLE = `
  body { font-family: Arial, Helvetica, sans-serif; font-size: 10px; color: #000; margin: 12px; }
  h1 { font-size: 14px; margin: 0 0 2px; font-weight: 700; }
  h2 { font-size: 11px; margin: 10px 0 4px; text-transform: uppercase; letter-spacing: 0.5px; }
  table { width: 100%; border-collapse: collapse; margin-top: 4px; }
  th, td { border: 1px solid #000; padding: 3px 5px; vertical-align: top; }
  th { background: #e8e8e8; font-weight: 700; font-size: 9px; }
  .header { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 6px; align-items: flex-start; }
  .logo { max-height: 52px; max-width: 150px; }
  .title-bar { background: #000; color: #fff; text-align: center; padding: 5px; font-size: 13px; font-weight: 700; letter-spacing: 1.5px; margin: 6px 0; }
  .muted { color: #444; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
  .box { border: 1px solid #000; padding: 5px; white-space: pre-line; min-height: 48px; }
  .lbl { font-size: 8px; font-weight: 700; text-transform: uppercase; color: #333; display: block; margin-bottom: 2px; }
  .right { text-align: right; }
  .totals { margin-top: 8px; width: 42%; margin-left: auto; }
  .footer { margin-top: 14px; font-size: 8px; color: #333; border-top: 1px solid #000; padding-top: 4px; }
  .terms li { margin-bottom: 2px; }
  .wm { position: fixed; top: 38%; left: 12%; font-size: 72px; color: rgba(180,0,0,0.12); font-weight: 900;
    letter-spacing: 8px; transform: rotate(-28deg); z-index: 0; pointer-events: none; }
  .form { position: relative; z-index: 1; border: 2px solid #000; }
  .form table { margin: 0; }
  .form td { border: 1px solid #000; padding: 4px 6px; }
  .cell-lbl { font-size: 7px; font-weight: 700; text-transform: uppercase; color: #222; }
  .cell-val { white-space: pre-line; min-height: 36px; font-size: 10px; }
  .inv-title { background: #1a1a1a; color: #fff; text-align: center; padding: 6px; font-size: 14px; font-weight: 700; letter-spacing: 2px; margin: 6px 0; }
`;

const HBL_FORM = (draft: boolean) => `
<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${DOC_BASE_STYLE}</style></head>
<body>
  ${draft ? '<div class="wm">DRAFT</div>' : ""}
  <div class="form">
    <table>
      <tr>
        <td colspan="2" style="width:55%">
          <div class="header" style="margin:0">
            <div>
              {{#if company_logo}}<img class="logo" src="{{company_logo}}" alt=""/>{{/if}}
              <h1>{{company_name}}</h1>
              {{#if company_address}}<div class="muted">{{company_address}}</div>{{/if}}
              {{#if company_phone}}<div>Tel: {{company_phone}}</div>{{/if}}
              {{#if company_email}}<div>{{company_email}}</div>{{/if}}
              {{#if company_vat}}<div>Tax/VAT: {{company_vat}}</div>{{/if}}
            </div>
          </div>
        </td>
        <td colspan="2" style="width:45%;text-align:center;vertical-align:middle;">
          <div style="font-size:14px;font-weight:700;letter-spacing:1px;">
            BILL OF LADING${draft ? " — DRAFT" : " — ORIGINAL"}
          </div>
          <div style="margin-top:6px;font-size:9px;">HOUSE BILL OF LADING</div>
          <div style="margin-top:8px;"><span class="cell-lbl">B/L No.</span><div style="font-size:13px;font-weight:700;">{{hbl_number}}</div></div>
          <div><span class="cell-lbl">Job</span> {{job_number}}</div>
          <div><span class="cell-lbl">MBL</span> {{mbl_number}}</div>
        </td>
      </tr>
      <tr>
        <td colspan="2" rowspan="2"><div class="cell-lbl">Shipper</div><div class="cell-val">{{shipper}}</div></td>
        <td colspan="2"><div class="cell-lbl">Export references</div><div class="cell-val">{{doc_ref}}</div></td>
      </tr>
      <tr>
        <td colspan="2"><div class="cell-lbl">Forwarding agent references</div><div class="cell-val">{{job_number}}</div></td>
      </tr>
      <tr>
        <td colspan="2" rowspan="2"><div class="cell-lbl">Consignee</div><div class="cell-val">{{consignee}}</div></td>
        <td colspan="2"><div class="cell-lbl">Point and country of origin</div><div class="cell-val">{{place_of_receipt}}</div></td>
      </tr>
      <tr>
        <td colspan="2"><div class="cell-lbl">Domestic routing / Export instructions</div><div class="cell-val"></div></td>
      </tr>
      <tr>
        <td colspan="2"><div class="cell-lbl">Notify party</div><div class="cell-val">{{notify}}</div></td>
        <td><div class="cell-lbl">Place of receipt</div><div class="cell-val">{{place_of_receipt}}</div></td>
        <td><div class="cell-lbl">Vessel / Voyage</div><div class="cell-val">{{vessel_voyage}}</div></td>
      </tr>
      <tr>
        <td><div class="cell-lbl">Port of loading</div><div class="cell-val">{{pol}}</div></td>
        <td><div class="cell-lbl">Port of discharge</div><div class="cell-val">{{pod}}</div></td>
        <td><div class="cell-lbl">Place of delivery</div><div class="cell-val">{{place_of_delivery}}</div></td>
        <td><div class="cell-lbl">ETD / ETA</div><div class="cell-val">{{etd}} / {{eta}}</div></td>
      </tr>
      <tr>
        <td colspan="4">
          <div class="cell-lbl">Marks and numbers · No. of pkgs · Description of goods · Gross weight · Measurement</div>
          <div class="cell-val">{{commodity}}
{{#if container_rows.length}}
{{#each container_rows}}{{container_no}} / {{seal}} / {{gross_weight}} KGS / {{cbm}} CBM
{{/each}}
{{else}}Containers: {{containers}}
{{/if}}
Pcs: {{pieces}} · G.Wt: {{gross_weight}} · CBM: {{volume_cbm}}</div>
        </td>
      </tr>
      <tr>
        <td colspan="2"><div class="cell-lbl">Freight payable at</div><div class="cell-val"></div></td>
        <td colspan="2"><div class="cell-lbl">Number of original B/L</div><div class="cell-val">${draft ? "DRAFT — NOT NEGOTIABLE" : "THREE (3)"}</div></td>
      </tr>
      <tr>
        <td colspan="4" style="text-align:right;padding:16px 8px;">
          <div class="cell-lbl">Signed for the Carrier</div>
          <div style="margin-top:28px;border-top:1px solid #000;display:inline-block;min-width:220px;text-align:center;padding-top:2px;">Authorized Signature</div>
        </td>
      </tr>
    </table>
  </div>
  <div class="footer">${draft ? "DRAFT — not for negotiation · " : "ORIGINAL · "}{{generated_at}} · Computer generated</div>
</body></html>`;

const HAWB_FORM = (draft: boolean) => `
<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${DOC_BASE_STYLE}</style></head>
<body>
  ${draft ? '<div class="wm">DRAFT</div>' : ""}
  <div class="form">
    <table>
      <tr>
        <td colspan="2" style="width:55%">
          {{#if company_logo}}<img class="logo" src="{{company_logo}}" alt=""/>{{/if}}
          <h1>{{company_name}}</h1>
          {{#if company_address}}<div class="muted">{{company_address}}</div>{{/if}}
          {{#if company_phone}}<div>Tel: {{company_phone}}</div>{{/if}}
        </td>
        <td colspan="2" style="text-align:center;vertical-align:middle;">
          <div style="font-size:13px;font-weight:700;letter-spacing:1px;">AIR WAYBILL${draft ? " — DRAFT" : ""}</div>
          <div style="font-size:9px;margin-top:4px;">HOUSE AIR WAYBILL (HAWB)</div>
          <div style="margin-top:8px;"><span class="cell-lbl">HAWB No.</span><div style="font-size:13px;font-weight:700;">{{hawb_number}}</div></div>
          <div><span class="cell-lbl">MAWB</span> {{mawb_number}}</div>
          <div><span class="cell-lbl">Job</span> {{job_number}}</div>
        </td>
      </tr>
      <tr>
        <td colspan="2"><div class="cell-lbl">Shipper's name and address</div><div class="cell-val">{{shipper}}</div></td>
        <td colspan="2"><div class="cell-lbl">Consignee's name and address</div><div class="cell-val">{{consignee}}</div></td>
      </tr>
      <tr>
        <td><div class="cell-lbl">Airport of departure</div><div class="cell-val">{{origin}}</div></td>
        <td><div class="cell-lbl">Airport of destination</div><div class="cell-val">{{dest}}</div></td>
        <td><div class="cell-lbl">Flight / Date</div><div class="cell-val">{{flight}}</div></td>
        <td><div class="cell-lbl">ETD / ETA</div><div class="cell-val">{{etd}} / {{eta}}</div></td>
      </tr>
      <tr>
        <td colspan="4">
          <div class="cell-lbl">Nature and quantity of goods · Gross weight · Chargeable weight</div>
          <div class="cell-val">{{commodity}}
Pcs: {{pieces}} · G.Wt: {{gross_weight}} · Ch.Wt: {{chargeable_weight}}</div>
        </td>
      </tr>
      <tr>
        <td colspan="4" style="text-align:right;padding:14px 8px;">
          <div class="cell-lbl">Signature of issuing carrier or agent</div>
          <div style="margin-top:24px;border-top:1px solid #000;display:inline-block;min-width:200px;text-align:center;padding-top:2px;">Authorized</div>
        </td>
      </tr>
    </table>
  </div>
  <div class="footer">${draft ? "DRAFT — not for carriage · " : ""}{{generated_at}}</div>
</body></html>`;

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
<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${DOC_BASE_STYLE}
  .meta-table td { border: none; padding: 2px 4px; }
  .shipment-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0; margin-top: 4px; border: 1px solid #000; }
  .shipment-grid .cell { border: 1px solid #000; padding: 4px; min-height: 28px; }
  .shipment-grid .lbl { font-size: 7px; color: #222; text-transform: uppercase; font-weight: 700; }
  .outer { border: 2px solid #000; padding: 8px; }
</style></head>
<body>
  <div class="outer">
  <div class="header">
    <div>
      {{#if company.logo_url}}<img class="logo" src="{{company.logo_url}}" alt="logo"/>{{/if}}
      <h1>{{company.name}}</h1>
      {{#each company.address_lines}}<div>{{this}}</div>{{/each}}
      {{#if company.website}}<div>{{company.website}}</div>{{/if}}
      {{#if company.gstin}}<div><strong>GSTIN:</strong> {{company.gstin}}</div>{{/if}}
      {{#if company.phone}}<div>Phone: {{company.phone}}</div>{{/if}}
      {{#if company.email}}<div>{{company.email}}</div>{{/if}}
    </div>
    <div class="right">
      <table class="meta-table" style="width:auto;margin-left:auto;border:1px solid #000;">
        <tr><td><strong>Invoice No</strong></td><td style="border-left:1px solid #000;">{{invoice.number}}</td></tr>
        <tr><td><strong>Date</strong></td><td style="border-left:1px solid #000;">{{invoice.invoice_date}}</td></tr>
        {{#if invoice.due_date}}<tr><td><strong>Due Date</strong></td><td style="border-left:1px solid #000;">{{invoice.due_date}}</td></tr>{{/if}}
        {{#if invoice.status}}<tr><td><strong>Status</strong></td><td style="border-left:1px solid #000;">{{invoice.status}}</td></tr>{{/if}}
        <tr><td><strong>Currency</strong></td><td style="border-left:1px solid #000;">{{invoice.currency_code}} @ {{invoice.exchange_rate}}</td></tr>
      </table>
    </div>
  </div>
  <div class="inv-title">TAX INVOICE</div>
  <div class="grid-2">
    <div class="box" style="border-right:none;">
      <strong>Bill To</strong>
      <div>{{bill_to.name}}</div>
      {{#each bill_to.address_lines}}<div>{{this}}</div>{{/each}}
      {{#if bill_to.phone}}<div>Phone: {{bill_to.phone}}</div>{{/if}}
      {{#if bill_to.gstin}}<div><strong>GSTIN:</strong> {{bill_to.gstin}}</div>{{/if}}
    </div>
    <div class="box">
      <strong>Invoice Meta</strong>
      {{#if invoice.narration}}<div>Narration: {{invoice.narration}}</div>{{/if}}
      {{#if invoice.remarks}}<div>Remarks: {{invoice.remarks}}</div>{{/if}}
      {{#if shipment.reference_no}}<div>Ref: {{shipment.reference_no}}</div>{{/if}}
      {{#if shipment.inco_terms}}<div>INCO: {{shipment.inco_terms}}</div>{{/if}}
    </div>
  </div>

  {{#if shipment}}
  <h2>Shipment</h2>
  <div class="shipment-grid">
    <div class="cell"><div class="lbl">Shipper</div>{{shipment.shipper}}</div>
    <div class="cell"><div class="lbl">Consignee</div>{{shipment.consignee}}</div>
    <div class="cell"><div class="lbl">Job / Shipment</div>{{shipment.job_no}} / {{shipment.shipment_no}}</div>
    <div class="cell"><div class="lbl">MBL / MAWB</div>{{shipment.mbl_mawb}}</div>
    <div class="cell"><div class="lbl">HBL / HAWB</div>{{shipment.hbl_hawb}}</div>
    <div class="cell"><div class="lbl">Vessel / Voyage</div>{{shipment.vessel_voyage}}</div>
    <div class="cell"><div class="lbl">POR</div>{{shipment.por}}</div>
    <div class="cell"><div class="lbl">POL</div>{{shipment.pol}}</div>
    <div class="cell"><div class="lbl">POD</div>{{shipment.pod}}</div>
    <div class="cell"><div class="lbl">ETD</div>{{shipment.etd}}</div>
    <div class="cell"><div class="lbl">ETA</div>{{shipment.eta}}</div>
    <div class="cell"><div class="lbl">Place of Delivery</div>{{shipment.place_of_delivery}}</div>
  </div>
  {{/if}}

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
    This is a computer-generated tax invoice. Catalog Format-1 — default POST /invoices/:id/pdf unchanged.
    {{#if footer.created_by}} Created by {{footer.created_by}}.{{/if}}
    Generated {{footer.generated_at}}{{#if footer.timezone}} ({{footer.timezone}}){{/if}}.
  </div>
  </div>
</body></html>`,

  "commercial.invoice_tax_india_2": `
<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${DOC_BASE_STYLE}</style></head>
<body>
  <div class="header"><div><h1>{{company.name}}</h1>
  {{#each company.address_lines}}<div>{{this}}</div>{{/each}}
  {{#if company.gstin}}<div>GSTIN: {{company.gstin}}</div>{{/if}}</div>
  <div class="right"><div>No: {{invoice.number}}</div><div>{{invoice.invoice_date}}</div></div></div>
  <div class="inv-title">TAX INVOICE (FORMAT 2)</div>
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
  <div class="inv-title">TAX INVOICE SUMMARY</div>
  <p>{{bill_to.name}} · Invoice {{invoice.number}} · {{invoice.invoice_date}}</p>
  <p><strong>Total:</strong> {{totals.grand_total}} ({{invoice.currency_code}})</p>
  <p>{{totals.amount_in_words}}</p>
  <div class="footer">Generated {{generated_at}}</div>
</body></html>`,

  "commercial.invoice_standard": `
<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${DOC_BASE_STYLE}</style></head>
<body>
  <div class="header"><div><h1>{{company.name}}</h1>{{#each company.address_lines}}<div>{{this}}</div>{{/each}}</div>
  <div class="right"><div>Invoice {{invoice.number}}</div><div>{{invoice.invoice_date}}</div></div></div>
  <div class="inv-title">INVOICE</div>
  <div class="box"><strong>Bill To:</strong> {{bill_to.name}}</div>
  <table><thead><tr><th>Description</th><th>Qty</th><th>Amount</th><th>Tax</th><th>Total</th></tr></thead>
  <tbody>{{#each lines}}<tr><td>{{description}}</td><td class="right">{{qty}}</td>
  <td class="right">{{taxable_amount}}</td><td class="right">{{igst_amount}}</td>
  <td class="right">{{total_inr}}</td></tr>{{/each}}</tbody></table>
  <p><strong>Grand Total:</strong> {{totals.grand_total}} — {{totals.amount_in_words}}</p>
  <div class="footer">Catalog standard invoice · default POST /invoices/:id/pdf unchanged · {{generated_at}}</div>
</body></html>`,

  "commercial.invoice_simple_india": `
<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${DOC_BASE_STYLE}</style></head>
<body>
  <h1>{{company.name}}</h1>
  {{#if company.gstin}}<div>GSTIN: {{company.gstin}}</div>{{/if}}
  <div class="inv-title">SIMPLE INVOICE (INDIA)</div>
  <p>{{bill_to.name}} {{#if bill_to.gstin}}(GSTIN {{bill_to.gstin}}){{/if}}</p>
  <p>Invoice {{invoice.number}} · {{invoice.invoice_date}}</p>
  <table><thead><tr><th>Description</th><th>Amount</th></tr></thead>
  <tbody>{{#each lines}}<tr><td>{{description}}</td><td class="right">{{total_inr}}</td></tr>{{/each}}</tbody></table>
  <p><strong>Total:</strong> {{totals.grand_total}}</p>
  <div class="footer">{{generated_at}}</div>
</body></html>`,

  "commercial.invoice_arabic": `
<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${DOC_BASE_STYLE}
  .rtl { direction: rtl; text-align: right; }
</style></head>
<body>
  <div class="header"><div><h1>{{company.name}}</h1></div>
  <div class="right"><div>{{invoice.number}}</div><div>{{invoice.invoice_date}}</div></div></div>
  <div class="inv-title">INVOICE / فاتورة</div>
  <div class="box"><strong>Bill To / العميل:</strong> {{bill_to.name}}</div>
  <table><thead><tr><th>Description / البيان</th><th>Amount / المبلغ</th></tr></thead>
  <tbody>{{#each lines}}<tr><td>{{description}}</td><td class="right">{{total_inr}}</td></tr>{{/each}}</tbody></table>
  <p><strong>Total / الإجمالي:</strong> {{totals.grand_total}} {{invoice.currency_code}}</p>
  <div class="footer">{{generated_at}}</div>
</body></html>`,

  "commercial.invoice_usa": `
<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${DOC_BASE_STYLE}</style></head>
<body>
  <div class="header"><div><h1>{{company.name}}</h1>{{#each company.address_lines}}<div>{{this}}</div>{{/each}}</div>
  <div class="right"><div>Invoice # {{invoice.number}}</div><div>Date {{invoice.invoice_date}}</div>
  {{#if invoice.due_date}}<div>Due {{invoice.due_date}}</div>{{/if}}</div></div>
  <div class="inv-title">INVOICE</div>
  <div class="box"><strong>Bill To</strong><div>{{bill_to.name}}</div>{{#each bill_to.address_lines}}<div>{{this}}</div>{{/each}}</div>
  <table><thead><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
  <tbody>{{#each lines}}<tr><td>{{description}}</td><td class="right">{{qty}}</td>
  <td class="right">{{amount_per_qty}}</td><td class="right">{{total_inr}}</td></tr>{{/each}}</tbody></table>
  <p><strong>Amount Due:</strong> {{totals.grand_total}} {{invoice.currency_code}}</p>
  <div class="footer">{{generated_at}}</div>
</body></html>`,

  "commercial.invoice_warehouse": `
<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${DOC_BASE_STYLE}</style></head>
<body>
  <h1>{{company.name}}</h1>
  <div class="inv-title">WAREHOUSE INVOICE</div>
  <p>{{bill_to.name}} · Invoice {{invoice.number}} · {{invoice.invoice_date}}</p>
  {{#if shipment}}<p>Job {{shipment.job_no}} · Ref {{shipment.reference_no}}</p>{{/if}}
  <table><thead><tr><th>Description</th><th>Qty</th><th>Amount</th></tr></thead>
  <tbody>{{#each lines}}<tr><td>{{description}}</td><td class="right">{{qty}}</td>
  <td class="right">{{total_inr}}</td></tr>{{/each}}</tbody></table>
  <p><strong>Total:</strong> {{totals.grand_total}}</p>
  <div class="footer">{{generated_at}}</div>
</body></html>`,

  "sea.hbl_draft": HBL_FORM(true),
  "sea.hbl_original": HBL_FORM(false),

  "sea.arrival_notice": `
<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${DOC_BASE_STYLE}</style></head>
<body>
  <div class="form">
  <div class="title-bar">ARRIVAL NOTICE</div>
  <div class="header"><div>
    {{#if company_logo}}<img class="logo" src="{{company_logo}}" alt=""/>{{/if}}
    <h1>{{company_name}}</h1>
  </div></div>
  <div class="grid-2">
    <div class="box"><span class="lbl">Consignee</span>{{consignee}}</div>
    <div class="box"><span class="lbl">Shipper</span>{{shipper}}</div>
  </div>
  <table style="margin-top:0;">
    <tr><td><span class="cell-lbl">Job</span> {{job_number}}</td><td><span class="cell-lbl">HBL</span> {{hbl_number}}</td><td><span class="cell-lbl">MBL</span> {{mbl_number}}</td></tr>
    <tr><td colspan="2"><span class="cell-lbl">Vessel / Voyage</span> {{vessel_voyage}}</td><td><span class="cell-lbl">ETA</span> {{eta}}</td></tr>
    <tr><td><span class="cell-lbl">POL</span> {{pol}}</td><td><span class="cell-lbl">POD</span> {{pod}}</td><td><span class="cell-lbl">Containers</span> {{containers}}</td></tr>
    <tr><td colspan="3"><span class="cell-lbl">Commodity</span> {{commodity}}</td></tr>
  </table>
  </div>
  <div class="footer">{{generated_at}}</div>
</body></html>`,

  "sea.delivery_order": `
<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${DOC_BASE_STYLE}</style></head>
<body>
  <div class="form">
  <div class="title-bar">DELIVERY ORDER</div>
  <h1>{{company_name}}</h1>
  <table>
    <tr><td><span class="cell-lbl">Job</span> {{job_number}}</td><td><span class="cell-lbl">DO Ref</span> {{doc_ref}}</td></tr>
    <tr><td colspan="2"><span class="cell-lbl">Consignee</span><div class="cell-val">{{consignee}}</div></td></tr>
    <tr><td colspan="2"><span class="cell-lbl">Containers</span> {{containers}}</td></tr>
  </table>
  <p style="padding:8px;">Please release cargo against this delivery order.</p>
  </div>
  <div class="footer">{{generated_at}}</div>
</body></html>`,

  "sea.cargo_manifest": `
<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${DOC_BASE_STYLE}</style></head>
<body>
  <div class="title-bar">CARGO MANIFEST</div>
  <h1>{{company_name}}</h1>
  <p>Job {{job_number}} · MBL {{mbl_number}} · HBL {{hbl_number}}</p>
  <p>Vessel/Voyage: {{vessel_voyage}} · POL {{pol}} → POD {{pod}}</p>
  <p>Shipper: {{shipper_name}} · Consignee: {{consignee_name}}</p>
  <p>Commodity: {{commodity}}</p>
  {{#if container_rows.length}}
  <table><thead><tr><th>Container</th><th>Seal</th><th>G.Wt</th><th>CBM</th></tr></thead>
  <tbody>{{#each container_rows}}<tr><td>{{container_no}}</td><td>{{seal}}</td>
  <td>{{gross_weight}}</td><td>{{cbm}}</td></tr>{{/each}}</tbody></table>
  {{else}}<p>Containers: {{containers}}</p>{{/if}}
  <div class="footer">{{generated_at}}</div>
</body></html>`,

  "sea.stuffing_report": `
<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${DOC_BASE_STYLE}</style></head>
<body>
  <div class="title-bar">STUFFING REPORT</div>
  <h1>{{company_name}}</h1>
  <p>Job {{job_number}} · HBL {{hbl_number}}</p>
  <p>Vessel/Voyage: {{vessel_voyage}} · ETD {{etd}}</p>
  <p>POL {{pol}} · Commodity {{commodity}}</p>
  {{#if container_rows.length}}
  <table><thead><tr><th>Container</th><th>Seal</th><th>G.Wt</th><th>CBM</th></tr></thead>
  <tbody>{{#each container_rows}}<tr><td>{{container_no}}</td><td>{{seal}}</td>
  <td>{{gross_weight}}</td><td>{{cbm}}</td></tr>{{/each}}</tbody></table>
  {{else}}<p>Containers: {{containers}}</p>{{/if}}
  <div class="footer">{{generated_at}}</div>
</body></html>`,

  "sea.letter_shell": `
<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${DOC_BASE_STYLE}</style></head>
<body>
  <div class="title-bar">{{letter_kind}}</div>
  <h1>{{company_name}}</h1>
  <p>Job {{job_number}} · HBL {{hbl_number}} · MBL {{mbl_number}}</p>
  <p>Shipper: {{shipper_name}} · Consignee: {{consignee_name}}</p>
  <p>POL {{pol}} → POD {{pod}} · {{vessel_voyage}}</p>
  <div class="box" style="margin-top:12px;min-height:80px;">{{letter_body}}</div>
  <div class="footer">{{generated_at}}</div>
</body></html>`,

  "air.hawb_draft": HAWB_FORM(true),
  "air.hawb_final": HAWB_FORM(false),

  "air.mawb": `
<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${DOC_BASE_STYLE}</style></head>
<body>
  <div class="form">
  <div class="title-bar">MASTER AIR WAYBILL</div>
  <h1>{{company_name}}</h1>
  <table>
    <tr><td><span class="cell-lbl">MAWB</span> {{mawb_number}}</td><td><span class="cell-lbl">Job</span> {{job_number}}</td></tr>
    <tr><td><span class="cell-lbl">Flight</span> {{flight}}</td><td><span class="cell-lbl">Route</span> {{origin}} → {{dest}}</td></tr>
  </table>
  </div>
  <div class="footer">{{generated_at}}</div>
</body></html>`,

  "air.arrival_notice": `
<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${DOC_BASE_STYLE}</style></head>
<body>
  <div class="title-bar">AIR ARRIVAL NOTICE</div>
  <h1>{{company_name}}</h1>
  <p>Job {{job_number}} · HAWB {{hawb_number}} · MAWB {{mawb_number}}</p>
  <p>Flight {{flight}} · ETA {{eta}} · Dest {{dest}}</p>
  <div class="box"><span class="lbl">Consignee</span>{{consignee}}</div>
  <div class="footer">{{generated_at}}</div>
</body></html>`,

  "air.delivery_order": `
<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${DOC_BASE_STYLE}</style></head>
<body>
  <div class="title-bar">AIR DELIVERY ORDER</div>
  <h1>{{company_name}}</h1>
  <p>Job {{job_number}} · HAWB {{hawb_number}}</p>
  <div class="box"><span class="lbl">Consignee</span>{{consignee}}</div>
  <p>Please release cargo against this delivery order.</p>
  <div class="footer">{{generated_at}}</div>
</body></html>`,

  "quotation.standard": `
<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${DOC_BASE_STYLE}</style></head>
<body>
  <div class="header"><div><h1>{{branding.company_name}}</h1>
  {{#if branding.address}}<div class="muted">{{branding.address}}</div>{{/if}}</div>
  <div class="right"><div>Quote {{quote_number}}</div><div>{{quote_date}}</div><div>{{status}}</div></div></div>
  <div class="title-bar">QUOTATION</div>
  <div class="box"><strong>Customer:</strong> {{party_name}}</div>
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
  {{#if party_address}}<p class="muted">{{party_address}}</p>{{/if}}
  <p>Your outstanding balance is <strong>{{balance}}</strong> {{currency}} as of {{as_of}}.</p>
  <table>
    <thead><tr><th>Invoice</th><th>Date</th><th>Due</th><th>Bucket</th><th>Balance</th></tr></thead>
    <tbody>{{#each invoices}}<tr><td>{{number}}</td><td>{{date}}</td><td>{{due}}</td>
    <td>{{bucket}}</td><td class="right">{{balance}}</td></tr>{{/each}}</tbody>
  </table>
  {{#if closing}}<p>{{closing}}</p>{{/if}}
  <div class="footer">{{generated_at}}</div>
</body></html>`,

  "finance.journal_voucher": `
<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${DOC_BASE_STYLE}</style></head>
<body>
  <div class="title-bar">JOURNAL VOUCHER</div>
  <h1>{{branding.company_name}}</h1>
  <p>Voucher {{voucher_number}} · {{voucher_type}} · {{voucher_date}} · {{currency}}</p>
  {{#if narration}}<p>{{narration}}</p>{{/if}}
  <table><thead><tr><th>Account</th><th>Narration</th><th>Debit</th><th>Credit</th></tr></thead>
  <tbody>{{#each lines}}<tr><td>{{account}}</td><td>{{narration}}</td>
  <td class="right">{{debit}}</td><td class="right">{{credit}}</td></tr>{{/each}}</tbody></table>
  <div class="footer">{{generated_at}}</div>
</body></html>`,

  "finance.payment_voucher": `
<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${DOC_BASE_STYLE}</style></head>
<body>
  <div class="title-bar">PAYMENT VOUCHER</div>
  <h1>{{branding.company_name}}</h1>
  <p>Voucher {{voucher_number}} · {{voucher_type}} · {{voucher_date}} · {{currency}}</p>
  {{#if narration}}<p>{{narration}}</p>{{/if}}
  <table><thead><tr><th>Account</th><th>Narration</th><th>Debit</th><th>Credit</th></tr></thead>
  <tbody>{{#each lines}}<tr><td>{{account}}</td><td>{{narration}}</td>
  <td class="right">{{debit}}</td><td class="right">{{credit}}</td></tr>{{/each}}</tbody></table>
  <div class="footer">{{generated_at}}</div>
</body></html>`,

  "finance.receipt_voucher": `
<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${DOC_BASE_STYLE}</style></head>
<body>
  <div class="title-bar">RECEIPT VOUCHER</div>
  <h1>{{branding.company_name}}</h1>
  <p>Voucher {{voucher_number}} · {{voucher_type}} · {{voucher_date}} · {{currency}}</p>
  {{#if narration}}<p>{{narration}}</p>{{/if}}
  <table><thead><tr><th>Account</th><th>Narration</th><th>Debit</th><th>Credit</th></tr></thead>
  <tbody>{{#each lines}}<tr><td>{{account}}</td><td>{{narration}}</td>
  <td class="right">{{debit}}</td><td class="right">{{credit}}</td></tr>{{/each}}</tbody></table>
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

  "wms.grn": `
<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${DOC_BASE_STYLE}</style></head>
<body>
  <div class="title-bar">GOODS RECEIPT NOTE</div>
  <h1>{{branding.company_name}}</h1>
  <p>GRN {{doc_number}} · {{warehouse}} · {{status}}</p>
  <p>Received {{received_at}}</p>
  <table><thead><tr><th>Item</th><th>Qty</th></tr></thead>
  <tbody>{{#each lines}}<tr><td>{{item}}</td><td class="right">{{qty}}</td></tr>{{/each}}</tbody></table>
  <div class="footer">{{generated_at}}</div>
</body></html>`,

  "wms.gdo": `
<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${DOC_BASE_STYLE}</style></head>
<body>
  <div class="title-bar">GOODS DELIVERY ORDER</div>
  <h1>{{branding.company_name}}</h1>
  <p>GDO {{doc_number}} · {{warehouse}} · {{status}}</p>
  <p>Delivered {{dispatched_at}}</p>
  <table><thead><tr><th>Item</th><th>Qty</th></tr></thead>
  <tbody>{{#each lines}}<tr><td>{{item}}</td><td class="right">{{qty}}</td></tr>{{/each}}</tbody></table>
  <div class="footer">{{generated_at}}</div>
</body></html>`,

  "other.booking_confirmation": `
<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${DOC_BASE_STYLE}</style></head>
<body>
  <div class="title-bar">BOOKING CONFIRMATION</div>
  <h1>{{branding.company_name}}</h1>
  <p>Job {{job_number}} · {{job_type}} · {{status}}</p>
  <p>Shipper: {{shipper}} · Consignee: {{consignee}}</p>
  <p>ETD {{etd}} · ETA {{eta}} · {{vessel_voyage}}</p>
  <p>BL/AWB: {{bl_awb}}</p>
  {{#if notes}}<p>{{notes}}</p>{{/if}}
  <div class="footer">{{generated_at}}</div>
</body></html>`,

  "other.pre_alert": `
<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${DOC_BASE_STYLE}</style></head>
<body>
  <div class="title-bar">PRE-ALERT</div>
  <h1>{{branding.company_name}}</h1>
  <p>Job {{job_number}} · {{job_type}}</p>
  <p>Shipper: {{shipper}} · Consignee: {{consignee}}</p>
  <p>ETD {{etd}} · ETA {{eta}} · {{vessel_voyage}}</p>
  <p>BL/AWB: {{bl_awb}}</p>
  {{#if notes}}<p>{{notes}}</p>{{/if}}
  <div class="footer">{{generated_at}}</div>
</body></html>`,
};

Handlebars.registerHelper("json", (ctx: unknown) =>
  JSON.stringify(ctx ?? {}, null, 2),
);
