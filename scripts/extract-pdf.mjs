import './pdf-polyfills.mjs';
import { readFileSync, writeFileSync } from 'node:fs';
import { PDFParse } from 'pdf-parse';

const pdfPath = process.argv[2] || 'd:/Downloads/Fresa_Gold_Complete_28Week_Plan.pdf';
const outPath = process.argv[3] || 'd:/FreightSaas/pdf-raw.txt';

const buf = readFileSync(pdfPath);
const parser = new PDFParse({ data: buf });
const result = await parser.getText();
writeFileSync(outPath, result.text, 'utf8');
console.log(JSON.stringify({ pages: result.total, length: result.text.length, outPath }));
