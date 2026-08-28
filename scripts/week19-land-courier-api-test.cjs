/**
 * Week 19 — Land / Trucking + Courier (Ch.14–15) API smoke test.
 *
 * Usage:
 *   node scripts/week19-land-courier-api-test.cjs
 *   BASE_URL=http://localhost:3000 node scripts/week19-land-courier-api-test.cjs
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const ROOT = path.join(__dirname, '..');
const JSON_OUT = path.join(ROOT, 'docs', 'WEEK19_API_TEST_RESULTS.json');
const runId = Date.now();
const PASSWORD = 'Welcome@123';

const ctx = {
  saToken: null,
  token: null,
  tenantId: null,
  companyId: null,
  partyId: null,
  truckerId: null,
  vendorId: null,
  landId: null,
  courierId: null,
  trId: null,
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

async function main() {
  const saEmail = `w19.sa.${runId}@kingfisher.test`;
  let r = await req('POST', '/auth/super-admin/register', {
    body: { email: saEmail, password: PASSWORD, full_name: 'W19 SA' },
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
  record({
    status: ctx.saToken ? 'PASS' : 'FAIL',
    method: 'POST',
    path: '/auth/super-admin/login',
    title: 'SA login',
    httpStatus: r.status,
  });

  const slug = `w19-${runId}`.slice(0, 40);
  r = await req('POST', '/tenants', {
    token: ctx.saToken,
    body: {
      name: `Week19 ${runId}`,
      slug,
      code: `L${String(runId).slice(-8)}`,
      admin_email: `owner.w19.${runId}@kingfisher.test`,
      admin_password: PASSWORD,
      admin_full_name: 'W19 Owner',
    },
  });
  ctx.tenantId = unwrap(r.body)?.id;
  record({
    status: ctx.tenantId ? 'PASS' : 'FAIL',
    method: 'POST',
    path: '/tenants',
    title: 'Create tenant',
    httpStatus: r.status,
  });

  r = await req('POST', '/auth/tenant-login', {
    body: { tenant_slug: slug, email: `owner.w19.${runId}@kingfisher.test`, password: PASSWORD },
  });
  ctx.token = unwrap(r.body)?.access_token;
  record({
    status: ctx.token ? 'PASS' : 'FAIL',
    method: 'POST',
    path: '/auth/tenant-login',
    title: 'Tenant login',
    httpStatus: r.status,
  });

  r = await req('GET', '/companies', { token: ctx.token });
  ctx.companyId = unwrap(r.body)?.[0]?.id ?? unwrap(r.body)?.data?.[0]?.id;
  r = await req('GET', '/parties?limit=1', { token: ctx.token });
  ctx.partyId = unwrap(r.body)?.data?.[0]?.id ?? unwrap(r.body)?.[0]?.id;

  r = await req('POST', '/masters/truckers', {
    token: ctx.token,
    body: { name: 'W19 Trucker', code: `TRK${String(runId).slice(-6)}` },
  });
  ctx.truckerId = unwrap(r.body)?.id;
  record({
    status: ctx.truckerId ? 'PASS' : 'FAIL',
    method: 'POST',
    path: '/masters/truckers',
    title: 'Create trucker',
    httpStatus: r.status,
  });

  r = await req('POST', '/masters/courier-vendors', {
    token: ctx.token,
    body: { name: 'DHL Test', code: `DHL${String(runId).slice(-5)}` },
  });
  ctx.vendorId = unwrap(r.body)?.id;
  record({
    status: ctx.vendorId ? 'PASS' : 'FAIL',
    method: 'POST',
    path: '/masters/courier-vendors',
    title: 'Create courier vendor',
    httpStatus: r.status,
  });

  r = await req('POST', '/jobs', {
    token: ctx.token,
    body: { job_type: 'LAND', company_id: ctx.companyId, shipper_id: ctx.partyId },
  });
  ctx.landId = unwrap(r.body)?.id;
  record({
    status: ctx.landId ? 'PASS' : 'FAIL',
    method: 'POST',
    path: '/jobs',
    title: 'Create LAND job',
    httpStatus: r.status,
  });

  r = await req('PATCH', `/jobs/${ctx.landId}/land-details`, {
    token: ctx.token,
    body: { vehicle_type: 'TRUCK', vehicle_number: `DXB-${runId}`, origin_city_country: 'Dubai, AE' },
  });
  record({
    status: r.status < 300 ? 'PASS' : 'FAIL',
    method: 'PATCH',
    path: '/jobs/:id/land-details',
    title: 'Update land details',
    httpStatus: r.status,
  });

  r = await req('POST', `/jobs/${ctx.landId}/land/assign-trucker`, {
    token: ctx.token,
    body: { trucker_id: ctx.truckerId, vehicle_number: `DXB-${runId}` },
  });
  record({
    status: r.status < 300 ? 'PASS' : 'FAIL',
    method: 'POST',
    path: '/jobs/:id/land/assign-trucker',
    title: 'Assign trucker',
    httpStatus: r.status,
  });

  r = await req('POST', `/jobs/${ctx.landId}/transport-requests`, {
    token: ctx.token,
    body: { request_type: 'PICKUP', pickup_address: 'Jebel Ali', delivery_address: 'Sharjah' },
  });
  ctx.trId = unwrap(r.body)?.id;
  record({
    status: ctx.trId ? 'PASS' : 'FAIL',
    method: 'POST',
    path: '/jobs/:id/transport-requests',
    title: 'Create transport request',
    httpStatus: r.status,
  });

  r = await req('POST', `/transport-requests/${ctx.trId}/assign`, {
    token: ctx.token,
    body: { trucker_id: ctx.truckerId, vehicle_type: 'TRUCK' },
  });
  record({
    status: r.status < 300 ? 'PASS' : 'FAIL',
    method: 'POST',
    path: '/transport-requests/:id/assign',
    title: 'Assign TR',
    httpStatus: r.status,
  });

  r = await req('POST', `/transport-requests/${ctx.trId}/confirm-pickup`, { token: ctx.token, body: {} });
  record({
    status: r.status < 300 ? 'PASS' : 'FAIL',
    method: 'POST',
    path: '/transport-requests/:id/confirm-pickup',
    title: 'Confirm pickup',
    httpStatus: r.status,
  });

  r = await req('POST', '/jobs', {
    token: ctx.token,
    body: { job_type: 'COURIER', company_id: ctx.companyId, consignee_id: ctx.partyId },
  });
  ctx.courierId = unwrap(r.body)?.id;
  record({
    status: ctx.courierId ? 'PASS' : 'FAIL',
    method: 'POST',
    path: '/jobs',
    title: 'Create COURIER job',
    httpStatus: r.status,
  });

  r = await req('PATCH', `/jobs/${ctx.courierId}/courier-details`, {
    token: ctx.token,
    body: { courier_vendor_id: ctx.vendorId, service_type: 'EXPRESS' },
  });
  record({
    status: r.status < 300 ? 'PASS' : 'FAIL',
    method: 'PATCH',
    path: '/jobs/:id/courier-details',
    title: 'Update courier details',
    httpStatus: r.status,
  });

  r = await req('POST', `/jobs/${ctx.courierId}/courier/confirm-booking`, { token: ctx.token, body: {} });
  record({
    status: r.status < 300 ? 'PASS' : 'FAIL',
    method: 'POST',
    path: '/jobs/:id/courier/confirm-booking',
    title: 'Confirm courier booking',
    httpStatus: r.status,
  });

  r = await req('POST', `/jobs/${ctx.courierId}/courier/scan-checkpoint`, {
    token: ctx.token,
    body: { checkpoint: 'PICKED_UP', location: 'DXB hub' },
  });
  record({
    status: r.status < 300 ? 'PASS' : 'FAIL',
    method: 'POST',
    path: '/jobs/:id/courier/scan-checkpoint',
    title: 'Scan checkpoint',
    httpStatus: r.status,
  });

  fs.writeFileSync(JSON_OUT, JSON.stringify({ runId, results, ctx }, null, 2));
  const failed = results.filter((x) => x.status === 'FAIL').length;
  console.log(`\nDone: ${results.length - failed}/${results.length} passed. Results → ${JSON_OUT}`);
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
