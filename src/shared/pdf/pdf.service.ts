import { Injectable } from '@nestjs/common';
import * as Handlebars from 'handlebars';
import puppeteer from 'puppeteer';
import { DocumentType, InvoiceType, JobType, QuotationPdfMode } from '@prisma/client';

export interface QuotationPdfData {
  quotation_number: string;
  status: string;
  job_type: JobType;
  customer_name?: string;
  commodity?: string;
  gross_weight?: string;
  chargeable_weight?: string;
  volume_cbm?: string;
  pieces?: number;
  currency_code: string;
  revenue_total: string;
  cost_total?: string;
  gp_amount?: string;
  gp_percent?: string;
  valid_until?: string;
  remarks?: string;
  lines: Array<{
    description: string;
    quantity: string;
    unit_price: string;
    amount: string;
    is_cost: boolean;
  }>;
}

export interface JobDocumentPdfData {
  job_number: string;
  job_type: JobType;
  document_type: DocumentType;
  shipper_name?: string;
  consignee_name?: string;
  commodity?: string;
  gross_weight?: string;
  chargeable_weight?: string;
  pieces?: number;
  hawb_number?: string;
  mawb_number?: string;
  flight_number?: string;
  airline_name?: string;
  origin?: string;
  destination?: string;
  is_original?: boolean;
}

export interface SeaFclDocumentPdfData {
  job_number: string;
  document_type: DocumentType;
  title: string;
  watermark: string;
  layout_variant?: string;
  is_express_release?: boolean;
  is_fiata?: boolean;
  is_non_negotiable?: boolean;
  shipper_name?: string;
  consignee_name?: string;
  notify_name?: string;
  pol?: string;
  pod?: string;
  place_of_receipt?: string;
  place_of_delivery?: string;
  vessel_name?: string;
  voyage_number?: string;
  etd?: string;
  eta?: string;
  sailed_at?: string;
  bl_number?: string;
  hbl_number?: string;
  mbl_number?: string;
  booking_number?: string;
  freight_terms?: string;
  freight_payable_at?: string;
  number_of_originals?: number;
  description_of_goods?: string;
  marks_numbers?: string;
  packages?: number;
  gross_weight?: string;
  measurement?: string;
  commodity?: string;
  shipping_line_name?: string;
  bl_conditions?: string;
  rider_terms?: string;
  switched_from_bl_number?: string;
  switch_consignee_name?: string;
  switch_notify_name?: string;
  proxy_forwarder_name?: string;
  proxy_forwarder_address?: string;
  transhipment_port?: string;
  house_bl_number?: string;
  master_bl_number?: string;
  revenue_total?: string;
  cost_total?: string;
  gp_amount?: string;
  gp_percent?: string;
  containers?: Array<{
    container_number?: string;
    seal_number?: string;
    container_type?: string;
    status?: string;
    gross_weight?: string;
    vgm_weight?: string;
    cbm?: string;
  }>;
  cargo_lines?: Array<{
    commodity?: string;
    marks_numbers?: string;
    packages?: number;
    gross_weight?: string;
    measurement?: string;
    container_number?: string;
  }>;
  stuffing_records?: Array<{
    supervisor_name?: string;
    stuffing_date?: string;
    location?: string;
    goods_condition?: string;
    container_number?: string;
  }>;
  charge_lines?: Array<{
    description: string;
    quantity: string;
    unit_price: string;
    amount: string;
    is_cost: boolean;
  }>;
}

export interface InvoicePdfData {
  invoice_number: string;
  invoice_type: InvoiceType;
  status: string;
  party_name?: string;
  party_vat_number?: string;
  job_number?: string;
  currency_code: string;
  subtotal: string;
  tax_amount: string;
  total_amount: string;
  vat_rate: string;
  invoice_date?: string;
  due_date?: string;
  remarks?: string;
  lines: Array<{
    description: string;
    quantity: string;
    unit_price: string;
    amount: string;
    tax_amount: string;
  }>;
}

@Injectable()
export class PdfService {
  async generateQuotationPdf(data: QuotationPdfData, mode: QuotationPdfMode): Promise<Buffer> {
    const showCosts = mode === 'INTERNAL';
    const lines = showCosts ? data.lines : data.lines.filter((l) => !l.is_cost);

    const template = Handlebars.compile(QUOTATION_TEMPLATE);
    const html = template({
      ...data,
      mode,
      title: mode === 'CUSTOMER' ? 'Quotation' : 'Internal Quotation',
      lines,
      show_gp: showCosts,
    });

    return this.htmlToPdf(html);
  }

  async generateJobDocumentPdf(data: JobDocumentPdfData): Promise<Buffer> {
    const template = Handlebars.compile(JOB_DOCUMENT_TEMPLATE);
    const html = template({
      ...data,
      title: data.document_type.replace(/_/g, ' '),
      watermark: data.is_original ? 'ORIGINAL' : 'DRAFT',
    });

    return this.htmlToPdf(html);
  }

  async generateSeaFclDocumentPdf(data: SeaFclDocumentPdfData): Promise<Buffer> {
    const isBlFamily = [
      'HBL',
      'HBL_EXPRESS_RELEASE',
      'MBL',
      'FIATA_BL',
      'RIDER_BL',
      'SWITCH_BL',
      'PROXY_BL',
      'BACK_TO_BACK_BL',
    ].includes(data.document_type);

    const template = Handlebars.compile(isBlFamily ? SEA_FCL_BL_TEMPLATE : SEA_FCL_SUPPORT_TEMPLATE);
    const html = template({
      ...data,
      show_signature: data.watermark === 'ORIGINAL',
      show_containers: (data.containers?.length ?? 0) > 0,
      show_cargo: (data.cargo_lines?.length ?? 0) > 0,
      show_stuffing: (data.stuffing_records?.length ?? 0) > 0,
      show_charges: (data.charge_lines?.length ?? 0) > 0,
      show_pnl: data.document_type === 'JOB_PNL' || data.document_type === 'JOB_CARD',
      show_rider: !!data.rider_terms || data.document_type === 'RIDER_BL',
      show_switch: data.document_type === 'SWITCH_BL',
      show_proxy: data.document_type === 'PROXY_BL',
      show_back_to_back: data.document_type === 'BACK_TO_BACK_BL',
    });

    return this.htmlToPdf(html);
  }

  async generateInvoicePdf(data: InvoicePdfData): Promise<Buffer> {
    const template = Handlebars.compile(INVOICE_TEMPLATE);
    const title =
      data.invoice_type === 'CREDIT_NOTE'
        ? 'Credit Note'
        : data.invoice_type === 'PURCHASE_INVOICE'
          ? 'Purchase Invoice'
          : data.invoice_type === 'DEBIT_NOTE'
            ? 'Debit Note'
            : 'Tax Invoice';

    const html = template({ ...data, title });
    return this.htmlToPdf(html);
  }

  private async htmlToPdf(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20mm', bottom: '20mm' } });
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }
}

const QUOTATION_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; color: #222; }
    h1 { font-size: 20px; margin-bottom: 4px; }
    .meta { margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border: 1px solid #ccc; padding: 6px; text-align: left; }
    th { background: #f5f5f5; }
    .totals { margin-top: 16px; text-align: right; }
    .gp { color: #0a7; font-weight: bold; }
  </style>
</head>
<body>
  <h1>{{title}} — {{quotation_number}}</h1>
  <div class="meta">
    <div>Service: {{job_type}}</div>
    <div>Customer: {{customer_name}}</div>
    <div>Status: {{status}}</div>
    {{#if valid_until}}<div>Valid Until: {{valid_until}}</div>{{/if}}
    {{#if commodity}}<div>Commodity: {{commodity}}</div>{{/if}}
  </div>
  <table>
    <thead>
      <tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount ({{currency_code}})</th></tr>
    </thead>
    <tbody>
      {{#each lines}}
      <tr>
        <td>{{description}}</td>
        <td>{{quantity}}</td>
        <td>{{unit_price}}</td>
        <td>{{amount}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>
  <div class="totals">
    <div>Revenue Total: {{revenue_total}} {{currency_code}}</div>
    {{#if show_gp}}
    <div>Cost Total: {{cost_total}} {{currency_code}}</div>
    <div class="gp">GP: {{gp_amount}} ({{gp_percent}}%)</div>
    {{/if}}
  </div>
  {{#if remarks}}<p><strong>Remarks:</strong> {{remarks}}</p>{{/if}}
</body>
</html>
`;

const JOB_DOCUMENT_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Arial, sans-serif; font-size: 11px; }
    .watermark { position: fixed; top: 40%; left: 20%; font-size: 72px; color: rgba(0,0,0,0.08); transform: rotate(-30deg); }
    h1 { font-size: 18px; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 4px; vertical-align: top; }
    .label { font-weight: bold; width: 140px; }
  </style>
</head>
<body>
  <div class="watermark">{{watermark}}</div>
  <h1>{{title}} — {{job_number}}</h1>
  <table>
    <tr><td class="label">Shipper</td><td>{{shipper_name}}</td></tr>
    <tr><td class="label">Consignee</td><td>{{consignee_name}}</td></tr>
    <tr><td class="label">Origin</td><td>{{origin}}</td></tr>
    <tr><td class="label">Destination</td><td>{{destination}}</td></tr>
    <tr><td class="label">Commodity</td><td>{{commodity}}</td></tr>
    <tr><td class="label">Pieces</td><td>{{pieces}}</td></tr>
    <tr><td class="label">Gross Wt</td><td>{{gross_weight}}</td></tr>
    <tr><td class="label">Chg Wt</td><td>{{chargeable_weight}}</td></tr>
    <tr><td class="label">HAWB</td><td>{{hawb_number}}</td></tr>
    <tr><td class="label">MAWB</td><td>{{mawb_number}}</td></tr>
    <tr><td class="label">Flight</td><td>{{flight_number}}</td></tr>
    <tr><td class="label">Airline</td><td>{{airline_name}}</td></tr>
  </table>
</body>
</html>
`;

const SEA_FCL_BL_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: "Times New Roman", Times, serif; font-size: 11px; color: #111; }
    .watermark { position: fixed; top: 35%; left: 15%; font-size: 64px; color: rgba(0,0,0,0.07); transform: rotate(-28deg); z-index: 0; }
    .stamp { display: inline-block; border: 2px solid #b00; color: #b00; padding: 4px 10px; font-weight: bold; margin: 6px 4px 6px 0; }
    h1 { font-size: 18px; margin: 0 0 4px; }
    .sub { color: #444; margin-bottom: 12px; }
    .grid { width: 100%; border-collapse: collapse; margin-top: 8px; }
    .grid td { border: 1px solid #999; padding: 6px; vertical-align: top; width: 50%; }
    .label { font-size: 9px; text-transform: uppercase; color: #555; display: block; margin-bottom: 2px; }
    table.data { width: 100%; border-collapse: collapse; margin-top: 12px; }
    table.data th, table.data td { border: 1px solid #bbb; padding: 5px; text-align: left; }
    table.data th { background: #f3f3f3; font-size: 10px; }
    .footer { margin-top: 24px; font-size: 10px; }
    .sig { margin-top: 40px; border-top: 1px solid #333; width: 240px; padding-top: 4px; }
    .page-break { page-break-before: always; }
  </style>
</head>
<body>
  <div class="watermark">{{watermark}}</div>
  <h1>{{title}}</h1>
  <div class="sub">Job {{job_number}} {{#if layout_variant}}· Layout {{layout_variant}}{{/if}} {{#if shipping_line_name}}· {{shipping_line_name}}{{/if}}</div>
  {{#if is_express_release}}<span class="stamp">NON-NEGOTIABLE</span><span class="stamp">EXPRESS / TELEX RELEASE</span>{{/if}}
  {{#if is_fiata}}<span class="stamp">FIATA FBL</span>{{/if}}
  {{#if is_non_negotiable}}<span class="stamp">NON-NEGOTIABLE</span>{{/if}}

  <table class="grid">
    <tr>
      <td><span class="label">Shipper</span>{{shipper_name}}</td>
      <td><span class="label">BL Number</span>{{bl_number}}{{#unless bl_number}}{{hbl_number}}{{/unless}}</td>
    </tr>
    <tr>
      <td><span class="label">Consignee</span>{{consignee_name}}</td>
      <td><span class="label">Number of Originals</span>{{number_of_originals}}</td>
    </tr>
    <tr>
      <td><span class="label">Notify Party</span>{{notify_name}}</td>
      <td><span class="label">Freight Terms</span>{{freight_terms}} · Payable at {{freight_payable_at}}</td>
    </tr>
    <tr>
      <td><span class="label">Place of Receipt</span>{{place_of_receipt}}</td>
      <td><span class="label">Place of Delivery</span>{{place_of_delivery}}</td>
    </tr>
    <tr>
      <td><span class="label">Port of Loading (POL)</span>{{pol}}</td>
      <td><span class="label">Port of Discharge (POD)</span>{{pod}}</td>
    </tr>
    <tr>
      <td><span class="label">Vessel / Voyage</span>{{vessel_name}} / {{voyage_number}}</td>
      <td><span class="label">ETD / ETA</span>{{etd}} / {{eta}}</td>
    </tr>
  </table>

  {{#if show_switch}}
  <p><strong>Switch BL</strong> — Original BL: {{switched_from_bl_number}} · Replacement Consignee: {{switch_consignee_name}} · Notify: {{switch_notify_name}}</p>
  {{/if}}
  {{#if show_proxy}}
  <p><strong>Proxy / Carrier Agent:</strong> {{proxy_forwarder_name}}<br/>{{proxy_forwarder_address}}</p>
  {{/if}}
  {{#if show_back_to_back}}
  <p><strong>Back-to-Back pair</strong> — Master BL: {{master_bl_number}} · House BL: {{house_bl_number}}</p>
  {{/if}}

  <table class="data">
    <thead>
      <tr><th>Marks &amp; Numbers</th><th>Description of Goods</th><th>Pkgs</th><th>Gross Wt</th><th>Measurement (CBM)</th></tr>
    </thead>
    <tbody>
      <tr>
        <td>{{marks_numbers}}</td>
        <td>{{description_of_goods}}{{#unless description_of_goods}}{{commodity}}{{/unless}}</td>
        <td>{{packages}}</td>
        <td>{{gross_weight}}</td>
        <td>{{measurement}}</td>
      </tr>
    </tbody>
  </table>

  {{#if show_containers}}
  <h3>Containers</h3>
  <table class="data">
    <thead><tr><th>Container #</th><th>Seal</th><th>Type</th><th>Gross Wt</th><th>VGM</th><th>CBM</th><th>Status</th></tr></thead>
    <tbody>
      {{#each containers}}
      <tr>
        <td>{{container_number}}</td><td>{{seal_number}}</td><td>{{container_type}}</td>
        <td>{{gross_weight}}</td><td>{{vgm_weight}}</td><td>{{cbm}}</td><td>{{status}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>
  {{/if}}

  {{#if show_rider}}
  <div class="page-break"></div>
  <h2>Rider / Addendum to Bill of Lading</h2>
  <p>{{rider_terms}}</p>
  {{/if}}

  <div class="footer">
    {{#if bl_conditions}}<p><strong>Conditions:</strong> {{bl_conditions}}</p>{{/if}}
    {{#unless bl_conditions}}<p>Subject to standard bill of lading terms and conditions on reverse.</p>{{/unless}}
    {{#if show_signature}}<div class="sig">Authorized Signature / Stamp</div>{{/if}}
  </div>
</body>
</html>
`;

const SEA_FCL_SUPPORT_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Arial, sans-serif; font-size: 11px; color: #222; }
    .watermark { position: fixed; top: 40%; left: 18%; font-size: 64px; color: rgba(0,0,0,0.07); transform: rotate(-28deg); }
    h1 { font-size: 18px; margin-bottom: 4px; }
    .meta { margin-bottom: 14px; line-height: 1.5; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border: 1px solid #ccc; padding: 6px; text-align: left; vertical-align: top; }
    th { background: #f5f5f5; }
    .label { font-weight: bold; width: 160px; }
    .totals { margin-top: 14px; text-align: right; }
  </style>
</head>
<body>
  <div class="watermark">{{watermark}}</div>
  <h1>{{title}} — {{job_number}}</h1>
  <div class="meta">
    <div>Shipper: {{shipper_name}}</div>
    <div>Consignee: {{consignee_name}}</div>
    <div>Vessel / Voyage: {{vessel_name}} / {{voyage_number}}</div>
    <div>POL / POD: {{pol}} → {{pod}}</div>
    <div>ETD / ETA: {{etd}} / {{eta}}</div>
    {{#if bl_number}}<div>BL No: {{bl_number}}</div>{{/if}}
    {{#if booking_number}}<div>Booking: {{booking_number}}</div>{{/if}}
    {{#if sailed_at}}<div>Sailed At: {{sailed_at}}</div>{{/if}}
    {{#if transhipment_port}}<div>Transhipment Port: {{transhipment_port}}</div>{{/if}}
  </div>

  {{#if show_containers}}
  <h3>Containers</h3>
  <table>
    <thead><tr><th>Container #</th><th>Seal</th><th>Type</th><th>Gross Wt</th><th>VGM</th><th>CBM</th><th>Status</th></tr></thead>
    <tbody>
      {{#each containers}}
      <tr>
        <td>{{container_number}}</td><td>{{seal_number}}</td><td>{{container_type}}</td>
        <td>{{gross_weight}}</td><td>{{vgm_weight}}</td><td>{{cbm}}</td><td>{{status}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>
  {{/if}}

  {{#if show_cargo}}
  <h3>Cargo</h3>
  <table>
    <thead><tr><th>Commodity</th><th>Marks</th><th>Pkgs</th><th>Gross Wt</th><th>CBM</th><th>Container</th></tr></thead>
    <tbody>
      {{#each cargo_lines}}
      <tr>
        <td>{{commodity}}</td><td>{{marks_numbers}}</td><td>{{packages}}</td>
        <td>{{gross_weight}}</td><td>{{measurement}}</td><td>{{container_number}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>
  {{/if}}

  {{#if show_stuffing}}
  <h3>Stuffing Records</h3>
  <table>
    <thead><tr><th>Supervisor</th><th>Date</th><th>Location</th><th>Condition</th><th>Container</th></tr></thead>
    <tbody>
      {{#each stuffing_records}}
      <tr>
        <td>{{supervisor_name}}</td><td>{{stuffing_date}}</td><td>{{location}}</td>
        <td>{{goods_condition}}</td><td>{{container_number}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>
  {{/if}}

  {{#if show_charges}}
  <h3>Charges</h3>
  <table>
    <thead><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th><th>Type</th></tr></thead>
    <tbody>
      {{#each charge_lines}}
      <tr>
        <td>{{description}}</td><td>{{quantity}}</td><td>{{unit_price}}</td><td>{{amount}}</td>
        <td>{{#if is_cost}}Cost{{else}}Revenue{{/if}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>
  {{/if}}

  {{#if show_pnl}}
  <div class="totals">
    <div>Revenue: {{revenue_total}}</div>
    <div>Cost: {{cost_total}}</div>
    <div><strong>GP: {{gp_amount}} ({{gp_percent}}%)</strong></div>
  </div>
  {{/if}}

  {{#if description_of_goods}}<p><strong>Notes:</strong> {{description_of_goods}}</p>{{/if}}
</body>
</html>
`;

const INVOICE_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; color: #222; }
    h1 { font-size: 20px; margin-bottom: 4px; }
    .meta { margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border: 1px solid #ccc; padding: 6px; text-align: left; }
    th { background: #f5f5f5; }
    .totals { margin-top: 16px; text-align: right; }
    .vat { color: #555; }
  </style>
</head>
<body>
  <h1>{{title}} — {{invoice_number}}</h1>
  <div class="meta">
    <div>Bill To: {{party_name}}</div>
    {{#if party_vat_number}}<div>TRN/VAT: {{party_vat_number}}</div>{{/if}}
    {{#if job_number}}<div>Job: {{job_number}}</div>{{/if}}
    <div>Date: {{invoice_date}}</div>
    {{#if due_date}}<div>Due: {{due_date}}</div>{{/if}}
    <div>Status: {{status}}</div>
  </div>
  <table>
    <thead>
      <tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th><th>VAT</th></tr>
    </thead>
    <tbody>
      {{#each lines}}
      <tr>
        <td>{{description}}</td>
        <td>{{quantity}}</td>
        <td>{{unit_price}}</td>
        <td>{{amount}}</td>
        <td>{{tax_amount}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>
  <div class="totals">
    <div>Subtotal: {{subtotal}} {{currency_code}}</div>
    <div class="vat">VAT ({{vat_rate}}%): {{tax_amount}} {{currency_code}}</div>
    <div><strong>Total: {{total_amount}} {{currency_code}}</strong></div>
  </div>
  {{#if remarks}}<p><strong>Remarks:</strong> {{remarks}}</p>{{/if}}
</body>
</html>
`;
