/**
 * Week 23 — Post-deploy verification checklist (local or Render).
 *
 * Usage:
 *   BASE_URL=https://kingfisherwings.onrender.com CRON_SECRET=xxx node scripts/week23-deploy-check.cjs
 */
const BASE_URL = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const CRON_SECRET = process.env.CRON_SECRET || '';
const THROTTLE_BYPASS = process.env.THROTTLE_BYPASS || CRON_SECRET;

const checks = [
  { method: 'GET', path: '/health', auth: false },
  { method: 'GET', path: '/api/v1/health', auth: 'apiKey' },
  { method: 'GET', path: '/documentation/boe/dashboard?page=1&limit=5', auth: 'staff' },
  { method: 'GET', path: '/gl/vouchers/batch-status', auth: 'staff' },
];

async function req(method, path, token, apiKey) {
  const headers = { 'X-Throttle-Bypass': THROTTLE_BYPASS };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (apiKey) headers['X-API-Key'] = apiKey;
  const res = await fetch(`${BASE_URL}${path}`, { method, headers });
  return res.status;
}

async function bootstrapStaff() {
  const runId = Date.now();
  const password = process.env.TEST_PASSWORD || 'Welcome@123';
  const sa = await fetch(`${BASE_URL}/auth/super-admin/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Throttle-Bypass': THROTTLE_BYPASS },
    body: JSON.stringify({ email: `w23.${runId}@test.com`, password, full_name: 'W23 Check' }),
  }).then((r) => r.json());
  const saToken = sa?.data?.access_token ?? sa?.access_token;

  const slug = `w23-${runId}`;
  await fetch(`${BASE_URL}/tenants`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${saToken}`,
      'X-Throttle-Bypass': THROTTLE_BYPASS,
    },
    body: JSON.stringify({
      name: 'W23 Check',
      slug,
      admin_email: `w23.admin.${runId}@test.com`,
      admin_password: password,
      admin_full_name: 'W23 Admin',
    }),
  });

  const login = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Throttle-Bypass': THROTTLE_BYPASS },
    body: JSON.stringify({ email: `w23.admin.${runId}@test.com`, password }),
  }).then((r) => r.json());

  const token = login?.data?.access_token ?? login?.access_token;
  const tenantId = login?.data?.tenant?.id;

  await fetch(`${BASE_URL}/tenants/${tenantId}/sync-permissions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${saToken}`, 'X-Throttle-Bypass': THROTTLE_BYPASS },
  });

  const keyRes = await fetch(`${BASE_URL}/admin/api-keys`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-Throttle-Bypass': THROTTLE_BYPASS,
    },
    body: JSON.stringify({ name: 'w23-check', scopes: ['jobs.read'] }),
  }).then((r) => r.json());

  return { token, apiKey: keyRes?.api_key };
}

async function main() {
  let staffToken = process.env.STAFF_TOKEN;
  let apiKey = process.env.API_KEY;
  if (!staffToken || !apiKey) {
    const boot = await bootstrapStaff();
    staffToken = staffToken || boot.token;
    apiKey = apiKey || boot.apiKey;
  }

  let failed = 0;
  for (const c of checks) {
    const token = c.auth === 'staff' ? staffToken : undefined;
    const key = c.auth === 'apiKey' ? apiKey : undefined;
    const status = await req(c.method, c.path, token, key);
    const ok = status >= 200 && status < 300;
    console.log(`${ok ? 'PASS' : 'FAIL'} ${c.method} ${c.path} (${status})`);
    if (!ok) failed++;
  }

  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
