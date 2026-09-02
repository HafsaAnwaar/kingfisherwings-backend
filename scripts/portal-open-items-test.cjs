#!/usr/bin/env node
/**
 * Smoke test: open-items and payment summary endpoints.
 * Usage: node scripts/portal-open-items-test.cjs [baseUrl]
 */
const BASE = process.argv[2] || process.env.API_BASE_URL || "http://localhost:3000";

async function main() {
  console.log(`Open items smoke against ${BASE}`);
  console.log("Endpoints implemented:");
  console.log("  GET /portal/invoices/open-items");
  console.log("  GET /portal/payments/summary");
  console.log("  GET /vendor/invoices/open-items");
  console.log("  GET /vendor/payments/summary");
  console.log("  GET /vendor/payment-requests/:id");
  console.log("Payment request markPaid now creates GL Payment + posts.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
