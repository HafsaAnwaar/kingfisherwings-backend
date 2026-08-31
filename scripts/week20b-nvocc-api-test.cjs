/**
 * Week 20B — NVOCC documents, voyage P&L, reporting smoke test.
 *
 * Usage:
 *   node scripts/week20b-nvocc-api-test.cjs
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const ROOT = path.join(__dirname, '..');
const JSON_OUT = path.join(ROOT, 'docs', 'WEEK20B_API_TEST_RESULTS.json');
const runId = Date.now();
const PASSWORD = 'Welcome@123';

const ctx = {
  saToken: null,
  token: null,
  tenantId: null,
  companyId: null,
  partyId: null,
  voyageId: null,
  enquiryId: null,
  bookingId: null,
  jobId: null,
  importJobId: null,
  loadListItemId: null,
};
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
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text.slice(0, 200) };
  }
  return { status: res.status, body: json };
}

function unwrap(body) {
  return body?.data ?? body;
}

async function bootstrapWeek20() {
  const saEmail = `w20b.sa.${runId}@kingfisher.test`;
  let r = await req('POST', '/auth/super-admin/register', {
    body: { email: saEmail, password: PASSWORD, full_name: 'W20B SA' },
  });
  record({
    status: r.status < 300 ? 'PASS' : 'FAIL',
    method: 'POST',
    path: '/auth/super-admin/register',
    title: 'Register SA',
    httpStatus: r.status,
  });

  r = await req('POST', '/auth/super-admin/login', { body: { email: saEmail, password: PASSWORD } });
  ctx.saToken = unwrap(r.body)?.access_token;

  const tenantSlug = `w20b-${runId}`;
  r = await req('POST', '/tenants', {
    token: ctx.saToken,
    body: {
      name: 'W20B Tenant',
      slug: tenantSlug,
      admin_email: `w20b.admin.${runId}@test.com`,
      admin_password: PASSWORD,
      admin_full_name: 'W20B Admin',
    },
  });
  ctx.tenantId = unwrap(r.body)?.id;

  r = await req('POST', '/auth/login', {
    body: { email: `w20b.admin.${runId}@test.com`, password: PASSWORD },
  });
  ctx.token = unwrap(r.body)?.access_token;

  await req('POST', `/tenants/${ctx.tenantId}/sync-permissions`, { token: ctx.saToken });

  r = await req('GET', '/companies', { token: ctx.token });
  ctx.companyId = unwrap(r.body)?.[0]?.id;

  r = await req('POST', '/parties', {
    token: ctx.token,
    body: { name: 'W20B Shipper', party_types: ['SHIPPER'], company_id: ctx.companyId },
  });
  ctx.partyId = unwrap(r.body)?.id;

  r = await req('POST', '/nvocc/voyages', {
    token: ctx.token,
    body: {
      slot_allocation_containers: 10,
      lcl_capacity_cbm: 100,
      carrier_cost: 5000,
      etd: new Date(Date.now() + 86400000 * 14).toISOString(),
    },
  });
  ctx.voyageId = unwrap(r.body)?.id;

  r = await req('POST', '/nvocc/enquiries', {
    token: ctx.token,
    body: {
      customer_id: ctx.partyId,
      voyage_id: ctx.voyageId,
      cargo_type: 'LCL',
      cbm: 5,
      commodity: 'General cargo',
    },
  });
  ctx.enquiryId = unwrap(r.body)?.id;

  r = await req('POST', `/nvocc/enquiries/${ctx.enquiryId}/convert-to-booking`, { token: ctx.token, body: {} });
  ctx.bookingId = unwrap(r.body)?.id;

  await req('POST', `/nvocc/bookings/${ctx.bookingId}/confirm`, { token: ctx.token, body: {} });

  r = await req('POST', `/nvocc/bookings/${ctx.bookingId}/convert-to-job`, {
    token: ctx.token,
    body: { company_id: ctx.companyId },
  });
  ctx.jobId = unwrap(r.body)?.jobId;

  r = await req('GET', `/nvocc/voyages/${ctx.voyageId}/load-list`, { token: ctx.token });
  ctx.loadListItemId = unwrap(r.body)?.items?.[0]?.id;
}

async function main() {
  await bootstrapWeek20();

  let r = await req('POST', `/nvocc/jobs/${ctx.jobId}/documents/hbl-draft`, { token: ctx.token, body: {} });
  record({
    status: r.status < 300 ? 'PASS' : 'FAIL',
    method: 'POST',
    path: '/nvocc/jobs/:id/documents/hbl-draft',
    title: 'HBL draft PDF queued',
    httpStatus: r.status,
  });

  r = await req('POST', `/nvocc/jobs/${ctx.jobId}/documents/hbl-original`, { token: ctx.token, body: {} });
  record({
    status: r.status < 300 ? 'PASS' : 'FAIL',
    method: 'POST',
    path: '/nvocc/jobs/:id/documents/hbl-original',
    title: 'HBL original PDF queued',
    httpStatus: r.status,
  });

  r = await req('GET', `/jobs/${ctx.jobId}`, { token: ctx.token });
  const jobAfterHbl = unwrap(r.body);
  record({
    status: jobAfterHbl?.nvocc_details?.hbl_status === 'ORIGINAL' ? 'PASS' : 'FAIL',
    method: 'GET',
    path: '/jobs/:id',
    title: 'HBL status ORIGINAL after hbl-original',
    httpStatus: r.status,
  });

  r = await req('PATCH', `/nvocc/jobs/${ctx.jobId}/mbl-received`, {
    token: ctx.token,
    body: { mbl_number: `MBL-${runId}` },
  });
  record({
    status: r.status < 300 ? 'PASS' : 'FAIL',
    method: 'PATCH',
    path: '/nvocc/jobs/:id/mbl-received',
    title: 'MBL received',
    httpStatus: r.status,
  });

  r = await req('POST', `/nvocc/jobs/${ctx.jobId}/pre-alert/send`, {
    token: ctx.token,
    body: { to_email: 'consignee@example.com', message: 'Pre-alert test' },
  });
  record({
    status: r.status < 300 ? 'PASS' : 'FAIL',
    method: 'POST',
    path: '/nvocc/jobs/:id/pre-alert/send',
    title: 'Pre-alert send',
    httpStatus: r.status,
  });

  r = await req('POST', `/nvocc/jobs/${ctx.jobId}/documents/can`, { token: ctx.token, body: {} });
  record({
    status: r.status < 300 ? 'PASS' : 'FAIL',
    method: 'POST',
    path: '/nvocc/jobs/:id/documents/can',
    title: 'CAN PDF queued',
    httpStatus: r.status,
  });

  r = await req('POST', `/nvocc/jobs/${ctx.jobId}/documents/delivery-order`, { token: ctx.token, body: {} });
  record({
    status: r.status < 300 ? 'PASS' : 'FAIL',
    method: 'POST',
    path: '/nvocc/jobs/:id/documents/delivery-order',
    title: 'DO PDF queued',
    httpStatus: r.status,
  });

  r = await req('POST', `/nvocc/jobs/${ctx.jobId}/si/submit`, { token: ctx.token });
  record({
    status: r.status < 300 ? 'PASS' : 'FAIL',
    method: 'POST',
    path: '/nvocc/jobs/:id/si/submit',
    title: 'SI submitted',
    httpStatus: r.status,
  });

  r = await req('POST', `/nvocc/jobs/${ctx.jobId}/vgm/submit`, { token: ctx.token });
  record({
    status: r.status < 300 ? 'PASS' : 'FAIL',
    method: 'POST',
    path: '/nvocc/jobs/:id/vgm/submit',
    title: 'VGM submitted',
    httpStatus: r.status,
  });

  if (ctx.loadListItemId) {
    r = await req('PATCH', `/nvocc/voyages/${ctx.voyageId}/load-list/${ctx.loadListItemId}`, {
      token: ctx.token,
      body: { cargo_status: 'RECEIVED_AT_CFS' },
    });
    record({
      status: r.status < 300 ? 'PASS' : 'FAIL',
      method: 'PATCH',
      path: '/nvocc/voyages/:id/load-list/:itemId',
      title: 'Load list cargo status → RECEIVED_AT_CFS',
      httpStatus: r.status,
    });
  }

  r = await req('GET', `/nvocc/voyages/${ctx.voyageId}/pnl`, { token: ctx.token });
  const pnl = unwrap(r.body);
  record({
    status: pnl?.totals && pnl?.capacity ? 'PASS' : 'FAIL',
    method: 'GET',
    path: '/nvocc/voyages/:id/pnl',
    title: 'Voyage P&L',
    httpStatus: r.status,
  });

  r = await req('GET', '/nvocc/voyages/utilization', { token: ctx.token });
  const util = unwrap(r.body);
  record({
    status: util?.summary && Array.isArray(util?.voyages) ? 'PASS' : 'FAIL',
    method: 'GET',
    path: '/nvocc/voyages/utilization',
    title: 'Space utilization report',
    httpStatus: r.status,
  });

  r = await req('GET', '/nvocc/reports/trade-lane-profitability', { token: ctx.token });
  const lanes = unwrap(r.body);
  record({
    status: Array.isArray(lanes?.lanes) ? 'PASS' : 'FAIL',
    method: 'GET',
    path: '/nvocc/reports/trade-lane-profitability',
    title: 'Trade lane profitability',
    httpStatus: r.status,
  });

  r = await req('GET', `/nvocc/jobs/${ctx.jobId}/documents/generation-status`, { token: ctx.token });
  record({
    status: r.status < 300 ? 'PASS' : 'FAIL',
    method: 'GET',
    path: '/nvocc/jobs/:id/documents/generation-status',
    title: 'Document generation status',
    httpStatus: r.status,
  });

  fs.writeFileSync(JSON_OUT, JSON.stringify({ runId, results, ctx }, null, 2));
  const failed = results.filter((x) => x.status === 'FAIL').length;
  console.log(`\nWeek 20B smoke: ${results.length - failed}/${results.length} passed`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
