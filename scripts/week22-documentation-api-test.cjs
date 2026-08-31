/**
 * Week 22 — Documentation uploads, DO, reports, voucher batch, public API smoke test.
 *
 * Usage:
 *   node scripts/week22-documentation-api-test.cjs
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const ROOT = path.join(__dirname, '..');
const JSON_OUT = path.join(ROOT, 'docs', 'WEEK22_DOCUMENTATION_API_TEST_RESULTS.json');
const runId = Date.now();
const PASSWORD = 'Welcome@123';

const ctx = { saToken: null, token: null, tenantId: null, jobId: null, apiKey: null };
const results = [];

function record(tc) {
  results.push({ ...tc, at: new Date().toISOString() });
  console.log(`[${tc.status}] ${tc.method} ${tc.path} — ${tc.title}`);
}

async function req(method, urlPath, { token, apiKey, body } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (apiKey) headers['X-API-Key'] = apiKey;
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
  const saEmail = `w22.sa.${runId}@kingfisher.test`;
  let r = await req('POST', '/auth/super-admin/register', {
    body: { email: saEmail, password: PASSWORD, full_name: 'W22 SA' },
  });
  record({ status: r.status < 300 ? 'PASS' : 'FAIL', method: 'POST', path: '/auth/super-admin/register', title: 'Register SA', httpStatus: r.status });

  r = await req('POST', '/auth/super-admin/login', { body: { email: saEmail, password: PASSWORD } });
  ctx.saToken = unwrap(r.body)?.access_token;

  const tenantSlug = `w22-${runId}`;
  r = await req('POST', '/tenants', {
    token: ctx.saToken,
    body: {
      name: 'W22 Doc Tenant',
      slug: tenantSlug,
      admin_email: `w22.admin.${runId}@test.com`,
      admin_password: PASSWORD,
      admin_full_name: 'W22 Admin',
    },
  });
  ctx.tenantId = unwrap(r.body)?.id;

  r = await req('POST', '/auth/login', {
    body: { email: `w22.admin.${runId}@test.com`, password: PASSWORD },
  });
  ctx.token = unwrap(r.body)?.access_token;

  await req('POST', `/tenants/${ctx.tenantId}/sync-permissions`, { token: ctx.saToken });

  r = await req('POST', '/jobs', {
    token: ctx.token,
    body: { job_type: 'SEA_FCL_EXPORT', commodity: 'W22 DO test' },
  });
  ctx.jobId = unwrap(r.body)?.id;

  r = await req('POST', `/jobs/${ctx.jobId}/close`, { token: ctx.token });
  record({ status: r.status < 300 ? 'PASS' : 'FAIL', method: 'POST', path: '/jobs/:id/close', title: 'Close job for DO', httpStatus: r.status });

  r = await req('PATCH', `/documentation/jobs/${ctx.jobId}/delivery-order`, {
    token: ctx.token,
    body: { do_number: `DO-${runId}`, do_status: 'ISSUED' },
  });
  record({ status: r.status < 300 ? 'PASS' : 'FAIL', method: 'PATCH', path: '/documentation/jobs/:id/delivery-order', title: 'DO update on closed job', httpStatus: r.status });

  r = await req('GET', '/documentation/delivery-orders/closed-jobs', { token: ctx.token });
  record({ status: r.status < 300 ? 'PASS' : 'FAIL', method: 'GET', path: '/documentation/delivery-orders/closed-jobs', title: 'Closed jobs DO list', httpStatus: r.status });

  r = await req('GET', '/documentation/reports/eta-followup', { token: ctx.token });
  record({ status: r.status < 300 ? 'PASS' : 'FAIL', method: 'GET', path: '/documentation/reports/eta-followup', title: 'ETA follow-up report', httpStatus: r.status });

  r = await req('GET', '/documentation/tracking/air?mawb_number=176-12345678', { token: ctx.token });
  record({ status: r.status < 300 ? 'PASS' : 'FAIL', method: 'GET', path: '/documentation/tracking/air', title: 'Air tracking stub', httpStatus: r.status });

  r = await req('POST', '/admin/api-keys', {
    token: ctx.token,
    body: { name: `W22 Key ${runId}`, scopes: ['jobs.read'] },
  });
  ctx.apiKey = unwrap(r.body)?.api_key;
  record({ status: ctx.apiKey ? 'PASS' : 'FAIL', method: 'POST', path: '/admin/api-keys', title: 'Create tenant API key', httpStatus: r.status });

  if (ctx.apiKey) {
    r = await req('GET', '/api/v1/health', { apiKey: ctx.apiKey });
    record({ status: r.status < 300 ? 'PASS' : 'FAIL', method: 'GET', path: '/api/v1/health', title: 'Public API health', httpStatus: r.status });
    r = await req('GET', '/api/v1/jobs', { apiKey: ctx.apiKey });
    record({ status: r.status < 300 ? 'PASS' : 'FAIL', method: 'GET', path: '/api/v1/jobs', title: 'Public API jobs list', httpStatus: r.status });
  }

  r = await req('GET', '/admin/billing/status', { token: ctx.token });
  record({ status: r.status < 300 ? 'PASS' : 'FAIL', method: 'GET', path: '/admin/billing/status', title: 'Stripe billing stub', httpStatus: r.status });

  fs.mkdirSync(path.dirname(JSON_OUT), { recursive: true });
  fs.writeFileSync(JSON_OUT, JSON.stringify({ runId, results, ctx: { ...ctx, apiKey: ctx.apiKey ? '[redacted]' : null } }, null, 2));
  console.log(`\nWrote ${JSON_OUT}`);
  const failed = results.filter((x) => x.status === 'FAIL').length;
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
