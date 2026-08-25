/**
 * Week 17 — WMS (Ch.22) API smoke test.
 *
 * Usage:
 *   node scripts/week17-wms-api-test.cjs
 *   BASE_URL=http://localhost:3000 TENANT_SLUG=... TENANT_PASSWORD=... node scripts/week17-wms-api-test.cjs
 *
 * Writes:
 *   docs/WEEK17_API_PASS_RESULTS.md
 *   docs/WEEK17_API_FAIL_RESULTS.md
 *   docs/WEEK17_API_TEST_RESULTS.json
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const ROOT = path.join(__dirname, '..');
const PASS_MD = path.join(ROOT, 'docs', 'WEEK17_API_PASS_RESULTS.md');
const FAIL_MD = path.join(ROOT, 'docs', 'WEEK17_API_FAIL_RESULTS.md');
const JSON_OUT = path.join(ROOT, 'docs', 'WEEK17_API_TEST_RESULTS.json');

const runId = Date.now();
const PASSWORD = 'Welcome@123';

const ctx = {
  saEmail: `w17.sa.${runId}@kingfisher.test`,
  saPassword: PASSWORD,
  tenantSlug: `w17-${runId}`.slice(0, 40),
  tenantCode: `W${String(runId).slice(-8)}`,
  tenantPassword: PASSWORD,
  tenantEmail: `owner.w17.${runId}@kingfisher.test`,
  saToken: null,
  token: null,
  tenantId: null,
  companyId: null,
  warehouseId: null,
  warehouse2Id: null,
  partyId: null,
  itemId: null,
  asnId: null,
  grnId: null,
  gdoId: null,
  transferId: null,
  chargeIds: [],
};

const results = [];

function record(tc) {
  results.push({ ...tc, at: new Date().toISOString() });
  const icon = tc.status === 'PASS' ? 'PASS' : tc.status === 'SKIP' ? 'SKIP' : 'FAIL';
  console.log(`[${icon}] ${tc.method || ''} ${tc.path || ''} — ${tc.title} (${tc.httpStatus ?? 'n/a'})`);
}

async function req(method, urlPath, { token, body } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (body !== undefined && body !== null) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(`${BASE_URL}${urlPath}`, {
    method,
    headers,
    body: method === 'GET' || method === 'HEAD' ? undefined : payload,
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text.slice(0, 400) };
  }
  return { status: res.status, body: json, text };
}

function unwrap(body) {
  if (!body || typeof body !== 'object') return body;
  if (body.data !== undefined) return body.data;
  return body;
}

async function passCase(title, method, urlPath, opts = {}) {
  const expected = opts.expectStatus ?? '2xx';
  try {
    const res = await req(method, urlPath, opts);
    const ok =
      typeof expected === 'number'
        ? res.status === expected
        : Array.isArray(expected)
          ? expected.includes(res.status)
          : res.status >= 200 && res.status < 300;
    record({
      phase: opts.phase || 'PASS',
      caseType: 'PASS_CASE',
      title,
      method,
      path: urlPath,
      expected: String(expected),
      httpStatus: res.status,
      status: ok ? 'PASS' : 'FAIL',
      notes: ok ? 'OK' : JSON.stringify(res.body).slice(0, 280),
    });
    return ok ? res : null;
  } catch (e) {
    record({
      phase: 'PASS',
      caseType: 'PASS_CASE',
      title,
      method,
      path: urlPath,
      status: 'FAIL',
      notes: e.message,
    });
    return null;
  }
}

async function failCase(title, method, urlPath, opts = {}) {
  const expected = opts.expectStatus ?? [400, 401, 403, 404];
  const res = await req(method, urlPath, opts);
  const list = Array.isArray(expected) ? expected : [expected];
  const ok = list.includes(res.status);
  record({
    phase: 'FAIL',
    caseType: 'FAIL_CASE',
    title,
    method,
    path: urlPath,
    expected: list.join('/'),
    httpStatus: res.status,
    status: ok ? 'PASS' : 'FAIL',
    notes: ok ? `Rejected (${res.status})` : `Expected ${list.join('/')}, got ${res.status}`,
  });
  return res;
}

async function bootstrap() {
  console.log(`\nBase URL: ${BASE_URL}\n=== BOOTSTRAP ===\n`);
  let res = await req('GET', '/health');
  if (res.status < 200 || res.status >= 300) throw new Error(`API not reachable (${res.status})`);

  if (process.env.TENANT_SLUG && process.env.TENANT_PASSWORD) {
    res = await req('POST', '/auth/tenant-login', {
      body: { tenant_slug: process.env.TENANT_SLUG, password: process.env.TENANT_PASSWORD },
    });
    ctx.token = unwrap(res.body)?.access_token;
    if (!ctx.token) throw new Error('Env tenant login failed');
    record({ phase: 'BOOTSTRAP', caseType: 'PASS_CASE', title: 'Tenant login via env', method: 'POST', path: '/auth/tenant-login', httpStatus: res.status, status: 'PASS' });
    return;
  }

  await req('POST', '/auth/super-admin/signup', {
    body: { email: ctx.saEmail, password: ctx.saPassword, first_name: 'W17', last_name: 'Tester' },
  });
  res = await req('POST', '/auth/super-admin/login', {
    body: { email: ctx.saEmail, password: ctx.saPassword },
  });
  ctx.saToken = unwrap(res.body)?.access_token;
  if (!ctx.saToken) throw new Error('SuperAdmin login failed');

  res = await req('POST', '/tenants', {
    token: ctx.saToken,
    body: {
      code: ctx.tenantCode,
      name: `W17 Tenant ${runId}`,
      slug: ctx.tenantSlug,
      owner_email: ctx.tenantEmail,
      owner_password: ctx.tenantPassword,
      owner_first_name: 'Owner',
      owner_last_name: 'W17',
      base_currency: 'AED',
      timezone: 'Asia/Dubai',
    },
  });
  const tenant = unwrap(res.body);
  ctx.tenantId = tenant?.id;
  if (!ctx.tenantId) throw new Error(`Tenant create failed: ${JSON.stringify(res.body).slice(0, 300)}`);

  await req('POST', `/tenants/${ctx.tenantId}/sync-permissions`, { token: ctx.saToken });

  res = await req('POST', '/auth/tenant-login', {
    body: { tenant_slug: ctx.tenantSlug, password: ctx.tenantPassword },
  });
  ctx.token = unwrap(res.body)?.access_token;
  if (!ctx.token) throw new Error('Tenant login failed');
  record({ phase: 'BOOTSTRAP', caseType: 'PASS_CASE', title: 'Tenant ready', method: 'POST', path: '/auth/tenant-login', httpStatus: res.status, status: 'PASS' });
}

async function runHappyPath() {
  console.log('\n=== WMS HAPPY PATH ===\n');
  const t = ctx.token;

  let res = await passCase('Upsert WMS settings FIFO', 'PUT', '/wms/settings', {
    token: t,
    body: { valuation_method: 'FIFO', default_free_days: 3, default_storage_rate: 10, default_currency: 'AED' },
  });

  res = await passCase('Create warehouse WH1', 'POST', '/masters/warehouses', {
    token: t,
    body: { code: `WH1-${runId}`.slice(0, 20), name: 'Main WH', city: 'Dubai', country_code: 'AE' },
  });
  ctx.warehouseId = unwrap(res?.body)?.id;

  res = await passCase('Create warehouse WH2', 'POST', '/masters/warehouses', {
    token: t,
    body: { code: `WH2-${runId}`.slice(0, 20), name: 'Overflow WH', city: 'Dubai', country_code: 'AE' },
  });
  ctx.warehouse2Id = unwrap(res?.body)?.id;

  res = await passCase('Create customer party', 'POST', '/parties', {
    token: t,
    body: { party_type: 'CUSTOMER', code: `PC-${runId}`.slice(0, 30), name: 'WMS Storage Customer', currency_code: 'AED' },
  });
  ctx.partyId = unwrap(res?.body)?.id;

  res = await passCase('Create WMS item', 'POST', '/wms/items', {
    token: t,
    body: { code: `SKU-${runId}`.slice(0, 40), name: 'Carton A', uom_code: 'CTN', low_stock_threshold: 5 },
  });
  ctx.itemId = unwrap(res?.body)?.id;

  if (!ctx.warehouseId || !ctx.itemId || !ctx.partyId) {
    record({ phase: 'PASS', caseType: 'PASS_CASE', title: 'Abort — missing master IDs', status: 'FAIL', notes: JSON.stringify(ctx) });
    return;
  }

  res = await passCase('Create ASN', 'POST', '/wms/asns', {
    token: t,
    body: {
      warehouse_id: ctx.warehouseId,
      party_id: ctx.partyId,
      lines: [{ item_id: ctx.itemId, quantity: 20, cbm: 2 }],
    },
  });
  ctx.asnId = unwrap(res?.body)?.id;
  if (ctx.asnId) {
    await passCase('Confirm ASN', 'POST', `/wms/asns/${ctx.asnId}/confirm`, { token: t });
  }

  res = await passCase('Create GRN', 'POST', '/wms/grns', {
    token: t,
    body: {
      warehouse_id: ctx.warehouseId,
      party_id: ctx.partyId,
      asn_id: ctx.asnId || undefined,
      lines: [{ item_id: ctx.itemId, quantity: 20, unit_cost: 5, cbm: 2, batch_code: 'B1' }],
    },
  });
  ctx.grnId = unwrap(res?.body)?.id;
  if (ctx.grnId) {
    await passCase('Post GRN', 'POST', `/wms/grns/${ctx.grnId}/post`, { token: t });
  }

  await passCase('Stock on-hand', 'GET', `/wms/stock/on-hand?warehouse_id=${ctx.warehouseId}`, { token: t });
  await passCase('Stock movements', 'GET', `/wms/stock/movements?warehouse_id=${ctx.warehouseId}`, { token: t });
  await passCase('Lot aging', 'GET', `/wms/stock/lot-aging?warehouse_id=${ctx.warehouseId}`, { token: t });

  res = await passCase('Create GDO', 'POST', '/wms/gdos', {
    token: t,
    body: {
      warehouse_id: ctx.warehouseId,
      party_id: ctx.partyId,
      lines: [{ item_id: ctx.itemId, quantity: 5 }],
    },
  });
  ctx.gdoId = unwrap(res?.body)?.id;
  if (ctx.gdoId) {
    await passCase('Post GDO (FIFO)', 'POST', `/wms/gdos/${ctx.gdoId}/post`, { token: t });
  }

  if (ctx.warehouse2Id) {
    res = await passCase('Create transfer', 'POST', '/wms/transfers', {
      token: t,
      body: {
        from_warehouse_id: ctx.warehouseId,
        to_warehouse_id: ctx.warehouse2Id,
        lines: [{ item_id: ctx.itemId, quantity: 3 }],
      },
    });
    ctx.transferId = unwrap(res?.body)?.id;
    if (ctx.transferId) {
      await passCase('Post transfer', 'POST', `/wms/transfers/${ctx.transferId}/post`, { token: t });
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const from = new Date(Date.now() - 10 * 86400000).toISOString().slice(0, 10);
  res = await passCase('Calculate storage', 'POST', '/wms/storage/calculate', {
    token: t,
    body: {
      warehouse_id: ctx.warehouseId,
      party_id: ctx.partyId,
      period_from: from,
      period_to: today,
      free_days: 3,
      rate_per_day: 10,
      currency_code: 'AED',
    },
  });
  const charges = unwrap(res?.body);
  if (Array.isArray(charges)) ctx.chargeIds = charges.map((c) => c.id).filter(Boolean);

  if (ctx.chargeIds.length) {
    await passCase('Invoice storage DRAFT', 'POST', '/wms/storage/invoice', {
      token: t,
      body: { charge_ids: ctx.chargeIds },
    });
  } else {
    record({ phase: 'PASS', caseType: 'PASS_CASE', title: 'Invoice storage DRAFT', status: 'SKIP', notes: 'No OPEN charges (stock may be empty after GDO/transfer)' });
  }

  await passCase('Low stock report', 'GET', '/wms/stock/low-stock', { token: t });
  await passCase('List storage charges', 'GET', '/wms/storage/charges', { token: t });
}

async function runFailCases() {
  console.log('\n=== FAIL CASES ===\n');
  await failCase('GRN without auth', 'GET', '/wms/grns', { expectStatus: 401 });
  if (ctx.token && ctx.warehouseId && ctx.itemId) {
    await failCase('GDO over-issue', 'POST', '/wms/gdos', {
      token: ctx.token,
      body: {
        warehouse_id: ctx.warehouseId,
        lines: [{ item_id: ctx.itemId, quantity: 999999 }],
      },
      expectStatus: [200, 201],
    });
    const last = results[results.length - 1];
    if (last?.httpStatus && last.httpStatus < 300) {
      const body = await req('POST', '/wms/gdos', {
        token: ctx.token,
        body: {
          warehouse_id: ctx.warehouseId,
          lines: [{ item_id: ctx.itemId, quantity: 999999 }],
        },
      });
      const id = unwrap(body.body)?.id;
      if (id) {
        await failCase('Post GDO insufficient stock', 'POST', `/wms/gdos/${id}/post`, {
          token: ctx.token,
          expectStatus: [400],
        });
      }
    }
  }
}

function writeReports() {
  const pass = results.filter((r) => r.caseType === 'PASS_CASE');
  const fail = results.filter((r) => r.caseType === 'FAIL_CASE');
  const fmt = (rows, title) => {
    const lines = [`# ${title}`, '', `| Status | Method | Path | Title | HTTP | Notes |`, `|---|---|---|---|---|---|`];
    for (const r of rows) {
      lines.push(`| ${r.status} | ${r.method || ''} | ${r.path || ''} | ${r.title} | ${r.httpStatus ?? ''} | ${(r.notes || '').replace(/\|/g, '/')} |`);
    }
    lines.push('');
    return lines.join('\n');
  };
  fs.writeFileSync(PASS_MD, fmt(pass, 'Week 17 WMS — PASS cases'));
  fs.writeFileSync(FAIL_MD, fmt(fail, 'Week 17 WMS — FAIL cases'));
  fs.writeFileSync(JSON_OUT, JSON.stringify({ runId, baseUrl: BASE_URL, results }, null, 2));
  const ok = results.filter((r) => r.status === 'PASS').length;
  const bad = results.filter((r) => r.status === 'FAIL').length;
  console.log(`\nDone. PASS=${ok} FAIL=${bad} → ${PASS_MD}`);
}

(async () => {
  try {
    await bootstrap();
    await runHappyPath();
    await runFailCases();
  } catch (e) {
    record({ phase: 'BOOTSTRAP', caseType: 'PASS_CASE', title: 'Fatal', status: 'FAIL', notes: e.message });
    console.error(e);
  } finally {
    writeReports();
    process.exit(results.some((r) => r.status === 'FAIL') ? 1 : 0);
  }
})();
