/**
 * Week 21 — Documentation foundation + EDI smoke test.
 *
 * Usage:
 *   node scripts/week21-documentation-api-test.cjs
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const ROOT = path.join(__dirname, '..');
const JSON_OUT = path.join(ROOT, 'docs', 'WEEK21_DOCUMENTATION_API_TEST_RESULTS.json');
const runId = Date.now();
const PASSWORD = 'Welcome@123';

const ctx = { saToken: null, token: null, tenantId: null, jobId: null, boeId: null, templateId: null, ediSubmissionId: null, mpciId: null };
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
  const saEmail = `w21.sa.${runId}@kingfisher.test`;
  let r = await req('POST', '/auth/super-admin/register', {
    body: { email: saEmail, password: PASSWORD, full_name: 'W21 SA' },
  });
  record({ status: r.status < 300 ? 'PASS' : 'FAIL', method: 'POST', path: '/auth/super-admin/register', title: 'Register SA', httpStatus: r.status });

  r = await req('POST', '/auth/super-admin/login', { body: { email: saEmail, password: PASSWORD } });
  ctx.saToken = unwrap(r.body)?.access_token;

  const tenantSlug = `w21-${runId}`;
  r = await req('POST', '/tenants', {
    token: ctx.saToken,
    body: {
      name: 'W21 Doc Tenant',
      slug: tenantSlug,
      admin_email: `w21.admin.${runId}@test.com`,
      admin_password: PASSWORD,
      admin_full_name: 'W21 Admin',
    },
  });
  ctx.tenantId = unwrap(r.body)?.id;

  r = await req('POST', '/auth/login', {
    body: { email: `w21.admin.${runId}@test.com`, password: PASSWORD },
  });
  ctx.token = unwrap(r.body)?.access_token;

  r = await req('POST', `/tenants/${ctx.tenantId}/sync-permissions`, { token: ctx.saToken });
  record({ status: r.status < 300 ? 'PASS' : 'FAIL', method: 'POST', path: '/tenants/:id/sync-permissions', title: 'Sync permissions', httpStatus: r.status });

  r = await req('POST', '/jobs', {
    token: ctx.token,
    body: { job_type: 'SEA_FCL_EXPORT', commodity: 'W21 test cargo' },
  });
  ctx.jobId = unwrap(r.body)?.id;
  record({ status: ctx.jobId ? 'PASS' : 'FAIL', method: 'POST', path: '/jobs', title: 'Create job', httpStatus: r.status });

  r = await req('POST', '/documentation/boe', {
    token: ctx.token,
    body: { boe_number: `BOE-${runId}`, job_id: ctx.jobId, boe_type: 'IMPORT' },
  });
  ctx.boeId = unwrap(r.body)?.id;
  record({ status: ctx.boeId ? 'PASS' : 'FAIL', method: 'POST', path: '/documentation/boe', title: 'Create BOE record', httpStatus: r.status });

  r = await req('GET', '/documentation/boe/dashboard', { token: ctx.token });
  const boeItems = unwrap(r.body)?.items ?? [];
  record({
    status: boeItems.some((i) => i.boe_number === `BOE-${runId}`) ? 'PASS' : 'FAIL',
    method: 'GET',
    path: '/documentation/boe/dashboard',
    title: 'BOE dashboard returns row',
    httpStatus: r.status,
  });

  r = await req('POST', '/documentation/charge-templates', {
    token: ctx.token,
    body: {
      name: `W21 Template ${runId}`,
      lines: [{ description: 'Doc fee', currency_code: 'AED', default_amount: 100 }],
    },
  });
  ctx.templateId = unwrap(r.body)?.id;
  record({ status: ctx.templateId ? 'PASS' : 'FAIL', method: 'POST', path: '/documentation/charge-templates', title: 'Charge template CRUD create', httpStatus: r.status });

  r = await req('POST', `/documentation/charge-templates/${ctx.templateId}/apply`, {
    token: ctx.token,
    body: { job_id: ctx.jobId },
  });
  record({ status: r.status < 300 ? 'PASS' : 'FAIL', method: 'POST', path: '/documentation/charge-templates/:id/apply', title: 'Apply charge template', httpStatus: r.status });

  r = await req('POST', `/documentation/edi/bayan/jobs/${ctx.jobId}/generate`, { token: ctx.token });
  ctx.ediSubmissionId = unwrap(r.body)?.id;
  record({ status: ctx.ediSubmissionId ? 'PASS' : 'FAIL', method: 'POST', path: '/documentation/edi/bayan/.../generate', title: 'Bayan EDI generate', httpStatus: r.status });

  if (ctx.ediSubmissionId) {
    r = await req('GET', `/documentation/edi/submissions/${ctx.ediSubmissionId}/download`, { token: ctx.token });
    record({ status: r.status < 300 ? 'PASS' : 'FAIL', method: 'GET', path: '/documentation/edi/submissions/:id/download', title: 'EDI download', httpStatus: r.status });
  }

  r = await req('POST', '/documentation/mpci/filings', {
    token: ctx.token,
    body: { job_id: ctx.jobId, filing_type: 'IMPORT' },
  });
  ctx.mpciId = unwrap(r.body)?.id;
  record({ status: ctx.mpciId ? 'PASS' : 'FAIL', method: 'POST', path: '/documentation/mpci/filings', title: 'MPCI filing create', httpStatus: r.status });

  if (ctx.mpciId) {
    r = await req('POST', `/documentation/mpci/filings/${ctx.mpciId}/prepare`, { token: ctx.token });
    record({ status: r.status < 300 ? 'PASS' : 'FAIL', method: 'POST', path: '/documentation/mpci/filings/:id/prepare', title: 'MPCI prepare', httpStatus: r.status });
    r = await req('POST', `/documentation/mpci/filings/${ctx.mpciId}/submit`, { token: ctx.token });
    record({ status: r.status < 300 ? 'PASS' : 'FAIL', method: 'POST', path: '/documentation/mpci/filings/:id/submit', title: 'MPCI submit stub', httpStatus: r.status });
  }

  fs.mkdirSync(path.dirname(JSON_OUT), { recursive: true });
  fs.writeFileSync(JSON_OUT, JSON.stringify({ runId, results, ctx }, null, 2));
  console.log(`\nWrote ${JSON_OUT}`);
  const failed = results.filter((x) => x.status === 'FAIL').length;
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
