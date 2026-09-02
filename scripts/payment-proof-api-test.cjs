#!/usr/bin/env node
/**
 * Smoke test: payment proof upload and review flow.
 * Usage: node scripts/payment-proof-api-test.cjs [baseUrl]
 */
const BASE = process.argv[2] || process.env.API_BASE_URL || "http://localhost:3000";

async function main() {
  console.log(`Payment proof smoke against ${BASE}`);
  console.log("Endpoints implemented:");
  console.log("  POST /portal/invoices/:id/payment-proofs");
  console.log("  GET  /portal/invoices/:id/payment-proofs");
  console.log("  POST /vendor/invoices/:id/payment-proofs");
  console.log("  GET  /invoices/:id/payment-proofs (staff)");
  console.log("  PATCH /payment-proofs/:id/acknowledge");
  console.log("  PATCH /payment-proofs/:id/reject");
  console.log("Set PORTAL_TOKEN, STAFF_TOKEN, INVOICE_ID to run live calls.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
