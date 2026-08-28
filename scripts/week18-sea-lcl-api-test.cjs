/**
 * Week 18 — Sea LCL Export + Import (Ch.12–13) API smoke test.
 *
 * Usage:
 *   node scripts/week18-sea-lcl-api-test.cjs
 *   BASE_URL=http://localhost:3000 node scripts/week18-sea-lcl-api-test.cjs
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const ROOT = path.join(__dirname, '..');
const JSON_OUT = path.join(ROOT, 'docs', 'WEEK18_API_TEST_RESULTS.json');
const runId = Date.now();
const PASSWORD = 'Welcome@123';

const ctx = { saToken: null, token: null, tenantId: null, companyId: null, partyId: null, masterId: null, houseId: null, importId: null };
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

function unwrap(body) {
  return body?.data ?? body;
}

async function main() {
  const saEmail = `w18.sa.${runId}@kingfisher.test`;
  let r = await req('POST', '/auth/super-admin/register', { body: { email: saEmail, password: PASSWORD, full_name: 'W18 SA' } });
  record({ status: r.status < 300 ? 'PASS' : 'FAIL', method: 'POST', path: '/auth/super-admin/register', title: 'Register SA', httpStatus: r.status });

  r = await req('POST', '/auth/super-admin/login', { body: { email: saEmail, password: PASSWORD } });
  ctx.saToken = unwrap(r.body)?.access_token;
  record({ status: ctx.saToken ? 'PASS' : 'FAIL', method: 'POST', path: '/auth/super-admin/login', title: 'SA login', httpStatus: r.status });

  const slug = `w18-${runId}`.slice(0, 40);
  r = await req('POST', '/tenants', {
    token: ctx.saToken,
    body: {
      name: `Week18 ${runId}`,
      slug,
      code: `W${String(runId).slice(-8)}`,
      admin_email: `owner.w18.${runId}@kingfisher.test`,
      admin_password: PASSWORD,
      admin_full_name: 'W18 Owner',
    },
  });
  const tenant = unwrap(r.body);
  ctx.tenantId = tenant?.id;
  record({ status: ctx.tenantId ? 'PASS' : 'FAIL', method: 'POST', path: '/tenants', title: 'Create tenant', httpStatus: r.status });

  r = await req('POST', '/auth/tenant-login', { body: { tenant_slug: slug, email: `owner.w18.${runId}@kingfisher.test`, password: PASSWORD } });
  ctx.token = unwrap(r.body)?.access_token;
  record({ status: ctx.token ? 'PASS' : 'FAIL', method: 'POST', path: '/auth/tenant-login', title: 'Tenant login', httpStatus: r.status });

  r = await req('GET', '/companies', { token: ctx.token });
  ctx.companyId = unwrap(r.body)?.[0]?.id ?? unwrap(r.body)?.data?.[0]?.id;
  r = await req('GET', '/parties?limit=1', { token: ctx.token });
  ctx.partyId = unwrap(r.body)?.data?.[0]?.id ?? unwrap(r.body)?.[0]?.id;

  r = await req('POST', '/jobs', {
    token: ctx.token,
    body: { job_type: 'SEA_LCL_EXPORT', company_id: ctx.companyId, shipper_id: ctx.partyId, volume_cbm: 5.5 },
  });
  ctx.masterId = unwrap(r.body)?.id;
  record({ status: ctx.masterId ? 'PASS' : 'FAIL', method: 'POST', path: '/jobs', title: 'Create LCL export master', httpStatus: r.status });

  r = await req('PATCH', `/jobs/${ctx.masterId}/sea-lcl-details`, {
    token: ctx.token,
    body: { consolidation_number: `CONS-${runId}`, mbl_number: `MBL${runId}` },
  });
  record({ status: r.status < 300 ? 'PASS' : 'FAIL', method: 'PATCH', path: '/jobs/:id/sea-lcl-details', title: 'Update LCL details', httpStatus: r.status });

  r = await req('POST', '/jobs', {
    token: ctx.token,
    body: { job_type: 'SEA_LCL_EXPORT', company_id: ctx.companyId, consignee_id: ctx.partyId, volume_cbm: 2.1 },
  });
  ctx.houseId = unwrap(r.body)?.id;
  record({ status: ctx.houseId ? 'PASS' : 'FAIL', method: 'POST', path: '/jobs', title: 'Create LCL export house', httpStatus: r.status });

  r = await req('POST', `/jobs/${ctx.masterId}/lcl/attach-house`, { token: ctx.token, body: { house_job_id: ctx.houseId } });
  record({ status: r.status < 300 ? 'PASS' : 'FAIL', method: 'POST', path: '/jobs/:id/lcl/attach-house', title: 'Attach house', httpStatus: r.status });

  r = await req('GET', `/jobs/${ctx.masterId}/lcl-consolidation`, { token: ctx.token });
  record({ status: r.status < 300 ? 'PASS' : 'FAIL', method: 'GET', path: '/jobs/:id/lcl-consolidation', title: 'Consolidation summary', httpStatus: r.status });

  r = await req('POST', `/jobs/${ctx.houseId}/cargo`, {
    token: ctx.token,
    body: { commodity: 'Electronics', packages: 10, gross_weight: 500, measurement: 2.1 },
  });
  record({ status: r.status < 300 ? 'PASS' : 'FAIL', method: 'POST', path: '/jobs/:id/cargo', title: 'Add LCL cargo', httpStatus: r.status });

  r = await req('POST', '/jobs', {
    token: ctx.token,
    body: { job_type: 'SEA_LCL_IMPORT', company_id: ctx.companyId, consignee_id: ctx.partyId, volume_cbm: 3.2 },
  });
  ctx.importId = unwrap(r.body)?.id;
  record({ status: ctx.importId ? 'PASS' : 'FAIL', method: 'POST', path: '/jobs', title: 'Create LCL import', httpStatus: r.status });

  r = await req('PATCH', `/jobs/${ctx.importId}/sea-lcl-details`, {
    token: ctx.token,
    body: {
      mbl_number_from_line: `MBL-IMP-${runId}`,
      cfs_storage_start_date: '2026-08-01',
      cfs_storage_rate_per_day: 10,
      storage_rate_basis: 'CBM',
    },
  });
  record({ status: r.status < 300 ? 'PASS' : 'FAIL', method: 'PATCH', path: '/jobs/:id/sea-lcl-details', title: 'Import LCL details + storage', httpStatus: r.status });

  r = await req('POST', `/jobs/${ctx.importId}/lcl/cfs-storage/calculate`, { token: ctx.token, body: {} });
  record({ status: r.status < 300 ? 'PASS' : 'FAIL', method: 'POST', path: '/jobs/:id/lcl/cfs-storage/calculate', title: 'CFS storage calc', httpStatus: r.status });

  fs.writeFileSync(JSON_OUT, JSON.stringify({ runId, results, ctx }, null, 2));
  const failed = results.filter((x) => x.status === 'FAIL').length;
  console.log(`\nDone: ${results.length - failed}/${results.length} passed. Results → ${JSON_OUT}`);
  process.exit(failed ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
