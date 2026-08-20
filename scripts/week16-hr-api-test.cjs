/**
 * Week 16 — HR Module (Ch.21) API test suite.
 *
 * Usage:
 *   node scripts/week16-hr-api-test.cjs
 *   BASE_URL=http://localhost:3000 TENANT_SLUG=... TENANT_PASSWORD=... node scripts/week16-hr-api-test.cjs
 *
 * Writes:
 *   docs/WEEK16_API_PASS_RESULTS.md
 *   docs/WEEK16_API_FAIL_RESULTS.md
 *   docs/WEEK16_API_TEST_RESULTS.json
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const ROOT = path.join(__dirname, '..');
const PASS_MD = path.join(ROOT, 'docs', 'WEEK16_API_PASS_RESULTS.md');
const FAIL_MD = path.join(ROOT, 'docs', 'WEEK16_API_FAIL_RESULTS.md');
const JSON_OUT = path.join(ROOT, 'docs', 'WEEK16_API_TEST_RESULTS.json');

const runId = Date.now();
const PASSWORD = 'Welcome@123';
const year = new Date().getUTCFullYear();
const month = new Date().getUTCMonth() + 1;

const ctx = {
  saEmail: `w16.sa.${runId}@kingfisher.test`,
  saPassword: PASSWORD,
  tenantSlug: `w16-${runId}`.slice(0, 40),
  tenantCode: `H${String(runId).slice(-8)}`,
  tenantPassword: PASSWORD,
  tenantEmail: `owner.w16.${runId}@kingfisher.test`,
  saToken: null,
  token: null,
  tenantId: null,
  companyId: null,
  employeeId: null,
  leaveRequestId: null,
  payrollRunId: null,
  payrollLineEmployeeId: null,
  loanId: null,
  timesheetId: null,
  templateId: null,
  cycleId: null,
  evaluationId: null,
  letterId: null,
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
  if (body.user) return body.user;
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
      record({
        phase: 'BOOTSTRAP',
        caseType: 'PASS_CASE',
        title: 'Tenant login via env',
        method: 'POST',
        path: '/auth/tenant-login',
        httpStatus: res.status,
        status: 'PASS',
      });
      await loadCompany();
      return;
    }
  }

  await req('POST', '/auth/super-admin/signup', {
    body: { email: ctx.saEmail, password: ctx.saPassword, first_name: 'W16', last_name: 'Tester' },
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
      name: `Week16 Tenant ${runId}`,
      password: ctx.tenantPassword,
      email: ctx.tenantEmail,
      country_code: 'AE',
      base_currency: 'AED',
      timezone: 'Asia/Dubai',
    },
  });
  const tenantData = unwrap(res.body);
  ctx.tenantId = tenantData?.id || tenantData?.tenant?.id;

  if (ctx.tenantId) {
    await req('POST', `/tenants/${ctx.tenantId}/sync-permissions`, { token: ctx.saToken });
  }

  res = await req('POST', '/auth/tenant-login', {
    body: { tenant_slug: ctx.tenantSlug, password: ctx.tenantPassword },
  });
  ctx.token = unwrap(res.body)?.access_token;
  if (!ctx.token) throw new Error('Tenant login failed after create');
  await loadCompany();
}

async function loadCompany() {
  let res = await req('GET', '/organization/company', { token: ctx.token });
  ctx.companyId = unwrap(res.body)?.id;
  if (ctx.companyId) {
    await passCase('Set company WPS MOL ID', 'PATCH', `/companies/${ctx.companyId}`, {
      token: ctx.token,
      body: { wps_employer_mol_id: 'MOL1234567', wps_agent_routing_code: '003' },
    });
  }
}

async function runTests() {
  const token = ctx.token;
  const joining = `${year - 3}-01-15`;

  let res = await passCase('Create employee', 'POST', '/hr/employees', {
    token,
    body: {
      first_name: 'Aisha',
      last_name: 'Khan',
      joining_date: joining,
      company_id: ctx.companyId,
      email: `aisha.w16.${runId}@test`,
      basic_salary: 8000,
      housing_allowance: 3000,
      transport_allowance: 1000,
      mobile_allowance: 250,
      overtime_rate: 50,
      social_security_amount: 100,
      mol_employee_id: '784199012345678',
      iban: 'AE070331234567890123456',
      staff_grade: 'STAFF',
      contract_type: 'UNLIMITED',
      status: 'ACTIVE',
    },
  });
  ctx.employeeId = unwrap(res?.body)?.id;

  await passCase('List employees', 'GET', '/hr/employees', { token });
  if (ctx.employeeId) {
    await passCase('Get employee', 'GET', `/hr/employees/${ctx.employeeId}`, { token });
    await passCase('Add passport document', 'POST', `/hr/employees/${ctx.employeeId}/documents`, {
      token,
      body: {
        document_type: 'PASSPORT',
        document_no: 'P1234567',
        expires_at: `${year}-12-31`,
      },
    });
    await passCase('Add dependent', 'POST', `/hr/employees/${ctx.employeeId}/dependents`, {
      token,
      body: {
        full_name: 'Omar Khan',
        relation: 'CHILD',
        passport_expires_at: `${year}-09-01`,
      },
    });
  }

  await failCase('Create employee missing first_name', 'POST', '/hr/employees', {
    token,
    body: { last_name: 'X', joining_date: joining },
    expectStatus: [400, 422],
  });

  await passCase('Create annual leave policy', 'POST', '/hr/leave-policies', {
    token,
    body: {
      leave_type: 'ANNUAL',
      staff_grade: 'STAFF',
      entitlement_days: 30,
      carry_forward_max: 5,
      encashment_allowed: true,
    },
  });

  if (ctx.employeeId) {
    await passCase('Get leave balances', 'GET', `/hr/employees/${ctx.employeeId}/leave-balances`, { token });
    res = await passCase('Create leave request', 'POST', '/hr/leave-requests', {
      token,
      body: {
        employee_id: ctx.employeeId,
        leave_type: 'ANNUAL',
        start_date: `${year}-06-01`,
        end_date: `${year}-06-03`,
        reason: 'Family',
      },
    });
    ctx.leaveRequestId = unwrap(res?.body)?.id;
    if (ctx.leaveRequestId) {
      await passCase('Approve leave', 'PATCH', `/hr/leave-requests/${ctx.leaveRequestId}/approve`, { token });
    }
    await passCase('Leave calendar', 'GET', `/hr/leave-calendar?from=${year}-06-01&to=${year}-06-30`, { token });
    await passCase('Document expiry report', 'GET', '/hr/document-expiry/report?within_days=90', { token });
    await passCase('Gratuity calculator', 'GET', `/hr/employees/${ctx.employeeId}/gratuity`, { token });
  }

  await passCase('Seed salary components', 'POST', '/hr/salary-components/seed', { token });
  res = await passCase('Create payroll run', 'POST', '/hr/payroll-runs', {
    token,
    body: { payroll_year: year, payroll_month: month, company_id: ctx.companyId, currency_code: 'AED' },
  });
  ctx.payrollRunId = unwrap(res?.body)?.id;

  if (ctx.payrollRunId) {
    await passCase('Generate payroll lines', 'POST', `/hr/payroll-runs/${ctx.payrollRunId}/generate`, { token });
    await passCase('Get payroll run', 'GET', `/hr/payroll-runs/${ctx.payrollRunId}`, { token });
    await passCase('Finalize payroll', 'POST', `/hr/payroll-runs/${ctx.payrollRunId}/finalize`, { token });
    await passCase('WPS export', 'GET', `/hr/payroll-runs/${ctx.payrollRunId}/wps-export`, { token });
    const payslip = await req('POST', `/hr/payroll-runs/${ctx.payrollRunId}/payslips/${ctx.employeeId}`, { token });
    record({
      phase: 'PASS',
      caseType: 'PASS_CASE',
      title: 'Generate payslip PDF',
      method: 'POST',
      path: `/hr/payroll-runs/${ctx.payrollRunId}/payslips/${ctx.employeeId}`,
      httpStatus: payslip.status,
      status: payslip.status >= 200 && payslip.status < 300 ? 'PASS' : payslip.status === 503 ? 'SKIP' : 'FAIL',
      notes: payslip.status === 503 ? 'PDF runtime unavailable' : JSON.stringify(payslip.body).slice(0, 200),
    });
  }

  if (ctx.employeeId) {
    res = await passCase('Create loan', 'POST', '/hr/loans', {
      token,
      body: { employee_id: ctx.employeeId, principal: 12000, interest_rate: 0, tenure_months: 6, purpose: 'Advance' },
    });
    ctx.loanId = unwrap(res?.body)?.id;
    if (ctx.loanId) {
      await passCase('Approve loan', 'PATCH', `/hr/loans/${ctx.loanId}/approve`, { token });
      await passCase('Loan schedule', 'GET', `/hr/loans/${ctx.loanId}/schedule`, { token });
    }
    await passCase('Create advance', 'POST', '/hr/advances', {
      token,
      body: { employee_id: ctx.employeeId, amount: 500, reason: 'Travel' },
    });

    const today = new Date().toISOString().slice(0, 10);
    res = await passCase('Create timesheet', 'POST', '/hr/timesheets', {
      token,
      body: { employee_id: ctx.employeeId, work_date: today, hours: 8, overtime_hours: 2, billable: false },
    });
    ctx.timesheetId = unwrap(res?.body)?.id;
    if (ctx.timesheetId) {
      await passCase('Approve timesheet', 'POST', `/hr/timesheets/${ctx.timesheetId}/approve`, { token });
    }
    await passCase('Missing timesheet report', 'GET', '/hr/timesheets/missing-report', { token });

    res = await passCase('Create evaluation template', 'POST', '/hr/evaluation-templates', {
      token,
      body: { name: 'Annual KPI', kpis: [{ id: 'quality', name: 'Quality', weight: 1 }] },
    });
    ctx.templateId = unwrap(res?.body)?.id;
    if (ctx.templateId) {
      res = await passCase('Create evaluation cycle', 'POST', '/hr/evaluation-cycles', {
        token,
        body: {
          template_id: ctx.templateId,
          name: `Cycle ${year}`,
          year,
          start_date: `${year}-01-01`,
          end_date: `${year}-12-31`,
        },
      });
      ctx.cycleId = unwrap(res?.body)?.id;
    }
    if (ctx.cycleId) {
      res = await passCase('Create evaluation', 'POST', '/hr/evaluations', {
        token,
        body: { cycle_id: ctx.cycleId, employee_id: ctx.employeeId },
      });
      ctx.evaluationId = unwrap(res?.body)?.id;
    }
    if (ctx.evaluationId) {
      await passCase('Submit self assessment', 'POST', `/hr/evaluations/${ctx.evaluationId}/submit-self`, {
        token,
        body: { scores: { quality: 80 }, comments: 'Self' },
      });
      await passCase('Submit manager assessment', 'POST', `/hr/evaluations/${ctx.evaluationId}/submit-manager`, {
        token,
        body: { scores: { quality: 85 }, comments: 'Strong', promotion_recommended: false },
      });
      await passCase('Finalize evaluation', 'POST', `/hr/evaluations/${ctx.evaluationId}/finalize`, { token });
    }

    const letter = await req('POST', '/hr/letters/generate', {
      token,
      body: { employee_id: ctx.employeeId, letter_type: 'EMPLOYMENT_CERT' },
    });
    record({
      phase: 'PASS',
      caseType: 'PASS_CASE',
      title: 'Generate employment certificate',
      method: 'POST',
      path: '/hr/letters/generate',
      httpStatus: letter.status,
      status: letter.status >= 200 && letter.status < 300 ? 'PASS' : letter.status === 503 ? 'SKIP' : 'FAIL',
      notes: letter.status === 503 ? 'PDF runtime unavailable' : JSON.stringify(letter.body).slice(0, 200),
    });
    ctx.letterId = unwrap(letter.body)?.id;
    if (ctx.letterId && letter.status < 300) {
      await passCase('Get HR letter', 'GET', `/hr/letters/${ctx.letterId}`, { token });
    }
  }

  await failCase('SuperAdmin cannot run payroll', 'POST', '/hr/payroll-runs', {
    token: ctx.saToken,
    body: { payroll_year: year, payroll_month: month },
    expectStatus: [401, 403],
  });
}

function writeDocs() {
  const pass = results.filter((r) => r.status === 'PASS');
  const fail = results.filter((r) => r.status === 'FAIL');
  const skip = results.filter((r) => r.status === 'SKIP');
  const md = (rows, title) =>
    `# ${title}\n\nGenerated: ${new Date().toISOString()}\n\n| Status | Method | Path | Title | HTTP | Notes |\n|--------|--------|------|-------|------|-------|\n` +
    rows
      .map(
        (r) =>
          `| ${r.status} | ${r.method || ''} | ${r.path || ''} | ${r.title} | ${r.httpStatus ?? ''} | ${(r.notes || '').replace(/\|/g, '/')} |`,
      )
      .join('\n') +
    '\n';
  fs.writeFileSync(PASS_MD, md(pass.concat(skip), 'Week 16 HR API — Pass / Skip'));
  fs.writeFileSync(FAIL_MD, md(fail, 'Week 16 HR API — Failures'));
  fs.writeFileSync(JSON_OUT, JSON.stringify({ runId, baseUrl: BASE_URL, results }, null, 2));
  console.log(`\nPass ${pass.length}  Skip ${skip.length}  Fail ${fail.length}`);
  console.log(`Wrote ${PASS_MD}`);
}

(async () => {
  try {
    await bootstrap();
    await runTests();
  } catch (e) {
    record({ phase: 'BOOTSTRAP', caseType: 'PASS_CASE', title: 'Suite crashed', status: 'FAIL', notes: e.message });
    console.error(e);
  } finally {
    writeDocs();
    const failed = results.some((r) => r.status === 'FAIL');
    process.exit(failed ? 1 : 0);
  }
})();
