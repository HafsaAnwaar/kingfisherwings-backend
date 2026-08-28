/**
 * Week 20 — NVOCC API smoke test.
 *
 * Usage:
 *   node scripts/week20-nvocc-api-test.cjs
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const ROOT = path.join(__dirname, '..');
const JSON_OUT = path.join(ROOT, 'docs', 'WEEK20_API_TEST_RESULTS.json');
const runId = Date.now();
const PASSWORD = 'Welcome@123';

const ctx = { saToken: null, token: null, tenantId: null, companyId: null, partyId: null, voyageId: null, enquiryId: null, bookingId: null, jobId: null };
const results = [];

function record(tc) {
  results.push({ ...tc, at: new Date().toISOString() });
  console.log(`[${tc.status}] ${tc.method} ${tc.path} — ${tc.title}`);
}

async function req(method, urlPath, { token, body } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (body !== undefined && body !== null) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(`${BASE_URL}${urlPath}`, { method, headers, body: payload });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text.slice(0, 200) }; }
  return { status: res.status, body: json };
}

function unwrap(body) { return body?.data ?? body; }

async function main() {
  const saEmail = `w20.sa.${runId}@kingfisher.test`;
  let r = await req('POST', '/auth/super-admin/register', { body: { email: saEmail, password: PASSWORD, full_name: 'W20 SA' } });
  record({ status: r.status < 300 ? 'PASS' : 'FAIL', method: 'POST', path: '/auth/super-admin/register', title: 'Register SA', httpStatus: r.status });

  r = await req('POST', '/auth/super-admin/login', { body: { email: saEmail, password: PASSWORD } });
  ctx.saToken = unwrap(r.body)?.access_token;

  const tenantSlug = `w20-${runId}`;
  r = await req('POST', '/tenants', { token: ctx.saToken, body: { name: 'W20 Tenant', slug: tenantSlug, admin_email: `w20.admin.${runId}@test.com`, admin_password: PASSWORD, admin_full_name: 'W20 Admin' } });
  const tenant = unwrap(r.body);
  ctx.tenantId = tenant?.id;
  record({ status: ctx.tenantId ? 'PASS' : 'FAIL', method: 'POST', path: '/tenants', title: 'Create tenant', httpStatus: r.status });

  r = await req('POST', '/auth/login', { body: { email: `w20.admin.${runId}@test.com`, password: PASSWORD } });
  ctx.token = unwrap(r.body)?.access_token;
  record({ status: ctx.token ? 'PASS' : 'FAIL', method: 'POST', path: '/auth/login', title: 'Tenant admin login', httpStatus: r.status });

  r = await req('POST', `/tenants/${ctx.tenantId}/sync-permissions`, { token: ctx.saToken });
  record({ status: r.status < 300 ? 'PASS' : 'FAIL', method: 'POST', path: '/tenants/:id/sync-permissions', title: 'Sync permissions', httpStatus: r.status });

  r = await req('GET', '/companies', { token: ctx.token });
  ctx.companyId = unwrap(r.body)?.[0]?.id;

  r = await req('POST', '/parties', { token: ctx.token, body: { name: 'W20 Shipper', party_types: ['SHIPPER'], company_id: ctx.companyId } });
  ctx.partyId = unwrap(r.body)?.id;

  r = await req('POST', '/nvocc/voyages', { token: ctx.token, body: { slot_allocation_containers: 10, lcl_capacity_cbm: 100, etd: new Date(Date.now() + 86400000 * 14).toISOString() } });
  ctx.voyageId = unwrap(r.body)?.id;
  record({ status: ctx.voyageId ? 'PASS' : 'FAIL', method: 'POST', path: '/nvocc/voyages', title: 'Create voyage', httpStatus: r.status });

  r = await req('POST', '/nvocc/enquiries', { token: ctx.token, body: { customer_id: ctx.partyId, voyage_id: ctx.voyageId, cargo_type: 'LCL', cbm: 5, commodity: 'General cargo' } });
  ctx.enquiryId = unwrap(r.body)?.id;
  record({ status: ctx.enquiryId ? 'PASS' : 'FAIL', method: 'POST', path: '/nvocc/enquiries', title: 'Create enquiry', httpStatus: r.status });

  r = await req('POST', `/nvocc/enquiries/${ctx.enquiryId}/convert-to-booking`, { token: ctx.token, body: {} });
  ctx.bookingId = unwrap(r.body)?.id;
  record({ status: ctx.bookingId ? 'PASS' : 'FAIL', method: 'POST', path: '/nvocc/enquiries/:id/convert-to-booking', title: 'Convert enquiry to booking', httpStatus: r.status });

  r = await req('POST', `/nvocc/bookings/${ctx.bookingId}/confirm`, { token: ctx.token, body: {} });
  record({ status: r.status < 300 ? 'PASS' : 'FAIL', method: 'POST', path: '/nvocc/bookings/:id/confirm', title: 'Confirm booking', httpStatus: r.status });

  r = await req('GET', `/nvocc/voyages/${ctx.voyageId}/load-list`, { token: ctx.token });
  record({ status: r.status < 300 ? 'PASS' : 'FAIL', method: 'GET', path: '/nvocc/voyages/:id/load-list', title: 'Load list', httpStatus: r.status });

  r = await req('POST', `/nvocc/bookings/${ctx.bookingId}/convert-to-job`, { token: ctx.token, body: { company_id: ctx.companyId } });
  ctx.jobId = unwrap(r.body)?.jobId;
  record({ status: ctx.jobId ? 'PASS' : 'FAIL', method: 'POST', path: '/nvocc/bookings/:id/convert-to-job', title: 'Convert booking to job', httpStatus: r.status });

  r = await req('GET', `/jobs/${ctx.jobId}`, { token: ctx.token });
  const job = unwrap(r.body);
  record({ status: job?.nvocc_details ? 'PASS' : 'FAIL', method: 'GET', path: '/jobs/:id', title: 'Job has nvocc_details', httpStatus: r.status });

  r = await req('POST', '/nvocc/tariffs', { token: ctx.token, body: { trade_lane: 'UAE→India', rate_valid_from: '2026-01-01', currency_code: 'USD', lcl_rate_cbm: 50 } });
  record({ status: r.status < 300 ? 'PASS' : 'FAIL', method: 'POST', path: '/nvocc/tariffs', title: 'Create tariff', httpStatus: r.status });

  fs.writeFileSync(JSON_OUT, JSON.stringify({ runId, results, ctx }, null, 2));
  const failed = results.filter((x) => x.status === 'FAIL').length;
  console.log(`\nWeek 20 smoke: ${results.length - failed}/${results.length} passed`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => { console.error(err); process.exit(1); });
