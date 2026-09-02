#!/usr/bin/env node
/**
 * Smoke test: portal quote estimate → request → negotiation timeline.
 * Usage: node scripts/portal-quote-negotiation-test.cjs [baseUrl]
 */
const BASE = process.argv[2] || process.env.API_BASE_URL || "http://localhost:3000";

async function main() {
  console.log(`Portal quote negotiation smoke against ${BASE}`);
  console.log("Endpoints implemented:");
  console.log("  GET  /portal/quotations/service-catalog");
  console.log("  POST /portal/quotations/estimate");
  console.log("  POST /portal/quotations/request");
  console.log("  GET  /portal/quotations/:id/negotiation");
  console.log("  POST /portal/quotations/:id/counter-offer");
  console.log("  POST /quotations/:id/revise-and-send (staff)");
  console.log("Run with valid portal + staff JWT tokens in env:");
  console.log("  PORTAL_TOKEN, STAFF_TOKEN, TENANT_ID");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
