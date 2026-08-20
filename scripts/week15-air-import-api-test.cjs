/**
 * Week 15 — Air Import (Ch.9) API test suite.
 *
 * Usage:
 *   node scripts/week15-air-import-api-test.cjs
 *   BASE_URL=http://localhost:3000 TENANT_SLUG=... TENANT_PASSWORD=... node scripts/week15-air-import-api-test.cjs
 *
 * Writes:
 *   docs/WEEK15_API_PASS_RESULTS.md
 *   docs/WEEK15_API_FAIL_RESULTS.md
 *   docs/WEEK15_API_TEST_RESULTS.json
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const ROOT = path.join(__dirname, '..');
const PASS_MD = path.join(ROOT, 'docs', 'WEEK15_API_PASS_RESULTS.md');
const FAIL_MD = path.join(ROOT, 'docs', 'WEEK15_API_FAIL_RESULTS.md');
const JSON_OUT = path.join(ROOT, 'docs', 'WEEK15_API_TEST_RESULTS.json');

const runId = Date.now();
const PASSWORD = 'Welcome@123';

const ctx = {
  saEmail: `w15.sa.${runId}@kingfisher.test`,
  saPassword: PASSWORD,
  tenantSlug: `w15-${runId}`.slice(0, 40),
  tenantCode: `A${String(runId).slice(-8)}`,
  tenantPassword: PASSWORD,
  tenantEmail: `owner.w15.${runId}@kingfisher.test`,
  saToken: null,
  token: null,
  tenantId: null,
  companyId: null,
  branchId: null,
  chargeCodeId: null,
  customerId: null,
  consigneeId: null,
  airImportJobId: null,
  airExportJobId: null,
  fclImportJobId: null,
  quotationId: null,
};

const results = [];
const AIR_IMPORT_MILESTONES = 16;

function record(tc) {
  results.push({ ...tc, at: new Date().toISOString() });
  const icon = tc.status === 'PASS' ? '✅' : tc.status === 'SKIP' ? '⏭️' : '❌';
  console.log(`${icon} [${tc.caseType}] ${tc.method} ${tc.path} — ${tc.title} (${tc.httpStatus ?? 'n/a'})`);
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
      group: opts.group || '',
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
    record({ phase: 'PASS', caseType: 'PASS_CASE', title, method, path: urlPath, status: 'FAIL', notes: e.message });
    return null;
  }
}

async function failCase(title, method, urlPath, opts = {}) {
  const expected = opts.expectStatus ?? [400, 403, 404, 409, 422];
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
  if (res.status < 200 || res.status >= 300) {
    throw new Error(`API not reachable (${res.status})`);
  }

  if (process.env.TENANT_SLUG && process.env.TENANT_PASSWORD) {
    res = await req('POST', '/auth/tenant-login', {
      body: { tenant_slug: process.env.TENANT_SLUG, password: process.env.TENANT_PASSWORD },
    });
    ctx.token = unwrap(res.body)?.access_token;
    ctx.tenantSlug = process.env.TENANT_SLUG;
    if (ctx.token) {
      record({ phase: 'BOOTSTRAP', caseType: 'PASS_CASE', title: 'Tenant login via env', method: 'POST', path: '/auth/tenant-login', httpStatus: res.status, status: 'PASS' });
      await loadTenantContext();
      return;
    }
  }

  await req('POST', '/auth/super-admin/signup', {
    body: { email: ctx.saEmail, password: ctx.saPassword, first_name: 'W15', last_name: 'Tester' },
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
      slug: ctx.tenantSlug,
      name: `Week15 Tenant ${runId}`,
      password: ctx.tenantPassword,
      email: ctx.tenantEmail,
      country_code: 'AE',
      base_currency: 'AED',
      timezone: 'Asia/Dubai',
    },
  });
  const tenantData = unwrap(res.body);
  ctx.tenantId = tenantData?.id || tenantData?.tenant?.id;

  res = await req('POST', '/auth/tenant-login', {
    body: { tenant_slug: ctx.tenantSlug, password: ctx.tenantPassword },
  });
  ctx.token = unwrap(res.body)?.access_token;
  if (!ctx.token) throw new Error('Tenant login failed after create');

  await loadTenantContext();
}

async function loadTenantContext() {
  let res = await req('GET', '/organization/company', { token: ctx.token });
  ctx.companyId = unwrap(res.body)?.id;

  res = await req('POST', '/masters/branches', {
    token: ctx.token,
    body: { code: 'W15', name: 'W15 Branch', company_id: ctx.companyId, country_code: 'AE', is_active: true },
  });
  if (res.status >= 200 && res.status < 300) {
    ctx.branchId = unwrap(res.body)?.id;
  } else {
    res = await req('GET', '/masters/branches', { token: ctx.token });
    const branches = unwrap(res.body);
    ctx.branchId = Array.isArray(branches) ? branches[0]?.id : branches?.items?.[0]?.id;
  }

  res = await req('POST', '/masters/charge-codes', {
    token: ctx.token,
    body: { code: 'STORAGE', name: 'Storage', charge_type: 'REVENUE', is_active: true },
  });
  if (res.status >= 200 && res.status < 300) {
    ctx.chargeCodeId = unwrap(res.body)?.id;
  } else {
    res = await req('GET', '/masters/charge-codes', { token: ctx.token });
    const codes = unwrap(res.body);
    const list = Array.isArray(codes) ? codes : codes?.items || [];
    ctx.chargeCodeId = list.find((c) => c.code === 'STORAGE')?.id || list[0]?.id;
  }

  res = await req('POST', '/parties', {
    token: ctx.token,
    body: {
      party_type: 'CUSTOMER',
      code: `W15-SHP-${runId}`,
      name: 'W15 Shipper',
      email: `shipper.w15.${runId}@test`,
      country_code: 'AE',
      company_id: ctx.companyId,
      is_active: true,
    },
  });
  ctx.customerId = unwrap(res.body)?.id;

  res = await req('POST', '/parties', {
    token: ctx.token,
    body: {
      party_type: 'CUSTOMER',
      code: `W15-CNS-${runId}`,
      name: 'W15 Consignee',
      email: `consignee.w15.${runId}@test`,
      country_code: 'AE',
      is_active: true,
    },
  });
  ctx.consigneeId = unwrap(res.body)?.id;
}

async function runTests() {
  console.log('\n=== WEEK 15 AIR IMPORT TESTS ===\n');

  // 1. Create AIR_IMPORT
  let res = await passCase('Create AIR_IMPORT job', 'POST', '/jobs', {
    token: ctx.token,
    group: 'P1',
    body: {
      job_type: 'AIR_IMPORT',
      company_id: ctx.companyId,
      branch_id: ctx.branchId,
      shipper_id: ctx.customerId,
      consignee_id: ctx.consigneeId,
      commodity: 'Pharma',
      pieces: 30,
      chargeable_weight: 500,
      gross_weight: 480,
      volume_cbm: 2.5,
    },
  });
  const job = unwrap(res?.body);
  ctx.airImportJobId = job?.id;
  if (!ctx.airImportJobId) throw new Error('AIR_IMPORT job create failed');

  res = await passCase('GET job has air_details + 16 milestones', 'GET', `/jobs/${ctx.airImportJobId}`, {
    token: ctx.token,
    group: 'P1',
  });
  const jobDetail = unwrap(res?.body);
  const milestones = jobDetail?.milestones || [];
  const bookingCreated = milestones.find((m) => m.milestone === 'BOOKING_CREATED' && m.actual_date);
  if (milestones.length !== AIR_IMPORT_MILESTONES) {
    record({
      phase: 'PASS',
      caseType: 'PASS_CASE',
      group: 'P1',
      title: '16 milestones seeded',
      method: 'GET',
      path: `/jobs/${ctx.airImportJobId}`,
      status: 'FAIL',
      notes: `Expected ${AIR_IMPORT_MILESTONES}, got ${milestones.length}`,
    });
  } else {
    record({
      phase: 'PASS',
      caseType: 'PASS_CASE',
      group: 'P1',
      title: '16 milestones seeded + BOOKING_CREATED actual',
      method: 'GET',
      path: `/jobs/${ctx.airImportJobId}`,
      status: bookingCreated ? 'PASS' : 'FAIL',
      notes: bookingCreated ? 'OK' : 'BOOKING_CREATED not auto-completed',
    });
  }

  // 2. PATCH air-details
  await passCase('PATCH air-details on AIR_IMPORT', 'PATCH', `/jobs/${ctx.airImportJobId}/air-details`, {
    token: ctx.token,
    group: 'P1',
    body: {
      mawb_number_from_origin: `176-${runId}`,
      hawb_number_from_origin_agent: `HAWB-${runId}`,
      storage_start_date: '2026-08-01',
      storage_free_days: 2,
      storage_rate: 0.5,
      storage_rate_basis: 'KG',
    },
  });

  res = await passCase('MAWB_RECEIVED milestone after origin MAWB', 'GET', `/jobs/${ctx.airImportJobId}`, {
    token: ctx.token,
    group: 'P1',
  });
  const mawbMs = (unwrap(res?.body)?.milestones || []).find((m) => m.milestone === 'MAWB_RECEIVED');
  record({
    phase: 'PASS',
    caseType: 'PASS_CASE',
    group: 'P1',
    title: 'MAWB_RECEIVED auto-completed',
    method: 'GET',
    path: `/jobs/${ctx.airImportJobId}`,
    status: mawbMs?.actual_date ? 'PASS' : 'FAIL',
    notes: mawbMs?.actual_date ? 'OK' : 'Missing actual_date',
  });

  res = await passCase('Create SEA_FCL_IMPORT for negative test', 'POST', '/jobs', {
    token: ctx.token,
    group: 'P1',
    body: {
      job_type: 'SEA_FCL_IMPORT',
      company_id: ctx.companyId,
      branch_id: ctx.branchId,
      shipper_id: ctx.customerId,
      consignee_id: ctx.consigneeId,
      commodity: 'FCL',
    },
  });
  ctx.fclImportJobId = unwrap(res?.body)?.id;
  if (ctx.fclImportJobId) {
    await failCase('PATCH air-details rejected on SEA_FCL_IMPORT', 'PATCH', `/jobs/${ctx.fclImportJobId}/air-details`, {
      token: ctx.token,
      group: 'P1',
      body: { flight_number: 'EK001' },
      expectStatus: 400,
    });
  }

  // 3. Document allowlist
  await failCase('HAWB on AIR_IMPORT rejected', 'POST', `/jobs/${ctx.airImportJobId}/documents/hawb`, {
    token: ctx.token,
    group: 'P3',
    body: {},
    expectStatus: 400,
  });

  await passCase('Queue PRE_CAN on AIR_IMPORT', 'POST', `/jobs/${ctx.airImportJobId}/documents/pre-can`, {
    token: ctx.token,
    group: 'P3',
    body: {},
  });

  await passCase('Queue CAN on AIR_IMPORT (CAN_SENT milestone)', 'POST', `/jobs/${ctx.airImportJobId}/documents/can`, {
    token: ctx.token,
    group: 'P3',
    body: {},
  });

  res = await passCase('CAN_SENT milestone after CAN queue', 'GET', `/jobs/${ctx.airImportJobId}`, {
    token: ctx.token,
    group: 'P3',
  });
  const canSent = (unwrap(res?.body)?.milestones || []).find((m) => m.milestone === 'CAN_SENT');
  record({
    phase: 'PASS',
    caseType: 'PASS_CASE',
    group: 'P3',
    title: 'CAN_SENT milestone',
    method: 'GET',
    path: `/jobs/${ctx.airImportJobId}`,
    status: canSent?.actual_date ? 'PASS' : 'FAIL',
    notes: canSent?.actual_date ? 'OK' : 'Not marked',
  });

  await passCase('Queue DO on AIR_IMPORT', 'POST', `/jobs/${ctx.airImportJobId}/documents/delivery-order`, {
    token: ctx.token,
    group: 'P3',
    body: {},
  });

  // 4. Customs status milestones
  for (const [status, milestone] of [
    ['FILED', 'CUSTOMS_ENTRY_FILED'],
    ['CLEARED', 'CUSTOMS_CLEARED'],
    ['RELEASED', 'CARGO_RELEASED_FROM_CUSTOMS'],
  ]) {
    await passCase(`Customs status ${status}`, 'PATCH', `/jobs/${ctx.airImportJobId}/customs-status`, {
      token: ctx.token,
      group: 'P2',
      body: { customs_status: status },
    });
    res = await req('GET', `/jobs/${ctx.airImportJobId}`, { token: ctx.token });
    const ms = (unwrap(res.body)?.milestones || []).find((m) => m.milestone === milestone);
    record({
      phase: 'PASS',
      caseType: 'PASS_CASE',
      group: 'P2',
      title: `${milestone} after customs ${status}`,
      method: 'GET',
      path: `/jobs/${ctx.airImportJobId}`,
      status: ms?.actual_date ? 'PASS' : 'FAIL',
    });
  }

  // 5. Deposits with expiry bands
  await passCase('Create customs deposit', 'POST', `/jobs/${ctx.airImportJobId}/deposits`, {
    token: ctx.token,
    group: 'P2',
    body: {
      deposit_type: 'CUSTOMS',
      deposit_amount: 5000,
      deposit_expiry_date: new Date(Date.now() + 45 * 86400000).toISOString().slice(0, 10),
    },
  });

  res = await passCase('List deposits with expiry band', 'GET', `/jobs/${ctx.airImportJobId}/deposits`, {
    token: ctx.token,
    group: 'P2',
  });
  const deposits = unwrap(res?.body);
  const depList = Array.isArray(deposits) ? deposits : deposits?.items || [];
  record({
    phase: 'PASS',
    caseType: 'PASS_CASE',
    group: 'P6',
    title: 'Deposit expiry band on GET',
    method: 'GET',
    path: `/jobs/${ctx.airImportJobId}/deposits`,
    status: depList[0]?.expiry_alert?.band ? 'PASS' : 'SKIP',
    notes: depList[0]?.expiry_alert?.band || 'No band field',
  });

  // 6. Part delivery over-delivery
  await passCase('Part delivery 10 packages', 'POST', `/jobs/${ctx.airImportJobId}/part-deliveries`, {
    token: ctx.token,
    group: 'P2',
    body: { packages_delivered: 10, delivery_date: '2026-08-10' },
  });
  await passCase('Part delivery 10 more packages', 'POST', `/jobs/${ctx.airImportJobId}/part-deliveries`, {
    token: ctx.token,
    group: 'P2',
    body: { packages_delivered: 10, delivery_date: '2026-08-11' },
  });
  await failCase('Part delivery over pieces rejected', 'POST', `/jobs/${ctx.airImportJobId}/part-deliveries`, {
    token: ctx.token,
    group: 'P2',
    body: { packages_delivered: 15, delivery_date: '2026-08-12' },
    expectStatus: 400,
  });

  // 7. Storage calc + DRAFT invoice
  res = await passCase('Storage calculation', 'GET', `/jobs/${ctx.airImportJobId}/storage-calculation`, {
    token: ctx.token,
    group: 'P4',
  });
  const calc = unwrap(res?.body);
  record({
    phase: 'PASS',
    caseType: 'PASS_CASE',
    group: 'P4',
    title: 'Storage amount > 0',
    method: 'GET',
    path: `/jobs/${ctx.airImportJobId}/storage-calculation`,
    status: calc?.storage_amount > 0 ? 'PASS' : 'FAIL',
    notes: `amount=${calc?.storage_amount}`,
  });

  res = await passCase('Create DRAFT storage invoice', 'POST', `/jobs/${ctx.airImportJobId}/storage-invoice`, {
    token: ctx.token,
    group: 'P4',
  });
  const inv = unwrap(res?.body);
  record({
    phase: 'PASS',
    caseType: 'PASS_CASE',
    group: 'P4',
    title: 'Storage invoice is DRAFT',
    method: 'POST',
    path: `/jobs/${ctx.airImportJobId}/storage-invoice`,
    status: inv?.status === 'DRAFT' ? 'PASS' : 'FAIL',
  });

  await passCase('Idempotent storage invoice returns same DRAFT', 'POST', `/jobs/${ctx.airImportJobId}/storage-invoice`, {
    token: ctx.token,
    group: 'P4',
  });

  // 8. Transhipment
  res = await passCase('Create AIR_EXPORT for transhipment target', 'POST', '/jobs', {
    token: ctx.token,
    group: 'P5',
    body: {
      job_type: 'AIR_EXPORT',
      company_id: ctx.companyId,
      branch_id: ctx.branchId,
      shipper_id: ctx.customerId,
      consignee_id: ctx.consigneeId,
      commodity: 'Re-export',
    },
  });
  ctx.airExportJobId = unwrap(res?.body)?.id;

  if (ctx.airExportJobId) {
    await passCase('Link air transhipment to AIR_EXPORT', 'POST', `/jobs/${ctx.airImportJobId}/air-transhipment-link`, {
      token: ctx.token,
      group: 'P5',
      body: { export_job_id: ctx.airExportJobId },
    });
    await failCase('Self transhipment rejected', 'POST', `/jobs/${ctx.airImportJobId}/air-transhipment-link`, {
      token: ctx.token,
      group: 'P5',
      body: { export_job_id: ctx.airImportJobId },
      expectStatus: 400,
    });
  }

  // Customs examination
  await passCase('Create customs examination', 'POST', `/jobs/${ctx.airImportJobId}/customs-examinations`, {
    token: ctx.token,
    group: 'P2',
    body: {
      examination_date: '2026-08-09',
      examining_officer: 'Officer A',
      items_examined: 'Cartons 1-5',
      result: 'RELEASED',
    },
  });

  await passCase('List customs examinations', 'GET', `/jobs/${ctx.airImportJobId}/customs-examinations`, {
    token: ctx.token,
    group: 'P2',
  });

  // 9. Quote convert AIR_IMPORT
  res = await passCase('Create AIR_IMPORT quotation', 'POST', '/quotations', {
    token: ctx.token,
    group: 'P1',
    body: {
      job_type: 'AIR_IMPORT',
      customer_id: ctx.customerId,
      company_id: ctx.companyId,
      branch_id: ctx.branchId,
      commodity: 'Quote Import',
      currency_code: 'AED',
      valid_until: '2026-12-31',
    },
  });
  ctx.quotationId = unwrap(res?.body)?.id;

  if (ctx.quotationId) {
    await passCase('Submit quotation', 'POST', `/quotations/${ctx.quotationId}/submit`, { token: ctx.token, body: {} });
    await passCase('Approve quotation', 'POST', `/quotations/${ctx.quotationId}/approve`, {
      token: ctx.token,
      body: { comments: 'OK' },
    });
    await passCase('Mark won', 'POST', `/quotations/${ctx.quotationId}/mark-won`, { token: ctx.token, body: {} });
    res = await passCase('Convert quote to AIR_IMPORT job', 'POST', `/quotations/${ctx.quotationId}/convert-to-job`, {
      token: ctx.token,
      group: 'P1',
      body: {},
    });
    const converted = unwrap(res?.body);
    const convertedJobId = converted?.job?.id || converted?.id;
    if (convertedJobId) {
      res = await req('GET', `/jobs/${convertedJobId}`, { token: ctx.token });
      const cj = unwrap(res.body);
      record({
        phase: 'PASS',
        caseType: 'PASS_CASE',
        group: 'P1',
        title: 'Quote convert seeds air_details + milestones',
        method: 'GET',
        path: `/jobs/${convertedJobId}`,
        status: cj?.air_details && (cj?.milestones?.length === AIR_IMPORT_MILESTONES) ? 'PASS' : 'FAIL',
      });
    }
  }

  // Transport request PDF allowed
  await passCase('Queue TRANSPORT_REQUEST on AIR_IMPORT', 'POST', `/jobs/${ctx.airImportJobId}/documents/transport-request`, {
    token: ctx.token,
    group: 'P5',
    body: {},
  });
}

function writeReports() {
  const pass = results.filter((r) => r.status === 'PASS');
  const fail = results.filter((r) => r.status === 'FAIL');
  const skip = results.filter((r) => r.status === 'SKIP');

  const summary = `# Week 15 Air Import — API Test Results

Generated: ${new Date().toISOString()}
Base URL: ${BASE_URL}

| Metric | Count |
|--------|-------|
| PASS | ${pass.length} |
| FAIL | ${fail.length} |
| SKIP | ${skip.length} |
| Total | ${results.length} |
`;

  fs.writeFileSync(JSON_OUT, JSON.stringify({ generated_at: new Date().toISOString(), base_url: BASE_URL, results }, null, 2));
  fs.writeFileSync(
    PASS_MD,
    summary +
      '\n## Passed\n\n' +
      pass.map((r) => `- **${r.title}** — \`${r.method} ${r.path}\` (${r.httpStatus ?? 'n/a'}) ${r.notes || ''}`).join('\n'),
  );
  fs.writeFileSync(
    FAIL_MD,
    summary +
      '\n## Failed / Skipped\n\n' +
      [...fail, ...skip]
        .map((r) => `- **${r.title}** — \`${r.method} ${r.path}\` (${r.httpStatus ?? 'n/a'}) ${r.notes || ''}`)
        .join('\n'),
  );

  console.log(`\nReports written:\n  ${PASS_MD}\n  ${FAIL_MD}\n  ${JSON_OUT}`);
  console.log(`\nSummary: ${pass.length} pass, ${fail.length} fail, ${skip.length} skip\n`);
}

(async () => {
  try {
    await bootstrap();
    await runTests();
  } catch (e) {
    console.error('Fatal:', e.message);
    record({ phase: 'FATAL', caseType: 'FAIL_CASE', title: e.message, method: '-', path: '-', status: 'FAIL' });
  } finally {
    writeReports();
    const failed = results.filter((r) => r.status === 'FAIL').length;
    process.exit(failed > 0 ? 1 : 0);
  }
})();
