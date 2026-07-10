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
