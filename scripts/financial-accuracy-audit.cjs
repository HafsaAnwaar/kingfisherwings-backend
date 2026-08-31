/**
 * Week 27 — Compare job charge totals vs invoice lines (tolerance 0.01).
 *
 * Usage:
 *   BASE_URL=http://localhost:3000 node scripts/financial-accuracy-audit.cjs
 */
const BASE_URL = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const TOLERANCE = Number(process.env.TOLERANCE ?? 0.01);
const PASSWORD = process.env.TEST_PASSWORD || 'Welcome@123';
const runId = Date.now();

async function req(method, path, { token, body } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, body: json };
}

function unwrap(body) {
  return body?.data ?? body;
}

async function main() {
  const sa = await req('POST', '/auth/super-admin/register', {
    body: { email: `audit.sa.${runId}@test.com`, password: PASSWORD, full_name: 'Audit SA' },
  });
  const saToken = unwrap(sa.body)?.access_token;
  if (!saToken) throw new Error('Super admin bootstrap failed');

  const slug = `audit-${runId}`;
  await req('POST', '/tenants', {
    token: saToken,
    body: {
      name: 'Audit Tenant',
      slug,
      admin_email: `audit.${runId}@test.com`,
      admin_password: PASSWORD,
      admin_full_name: 'Audit Admin',
    },
  });

  const login = await req('POST', '/auth/login', {
    body: { email: `audit.${runId}@test.com`, password: PASSWORD },
  });
  const token = unwrap(login.body)?.access_token;

  const party = await req('POST', '/parties', {
    token,
    body: {
      party_type: 'CUSTOMER',
      code: `AUD-${runId}`,
      name: 'Audit Customer',
      email: `cust.${runId}@test.com`,
    },
  });
  const partyId = unwrap(party.body)?.id;

  const quote = await req('POST', '/quotations', {
    token,
    body: {
      job_type: 'AIR_EXPORT',
      customer_id: partyId,
      lines: [
        {
          description: 'Line A',
          quantity: 1,
          unit_price: 500,
          currency_code: 'AED',
          exchange_rate: 1,
          amount: 500,
          amount_base_currency: 500,
          is_cost: false,
        },
        {
          description: 'Line B',
          quantity: 2,
          unit_price: 250,
          currency_code: 'AED',
          exchange_rate: 1,
          amount: 500,
          amount_base_currency: 500,
          is_cost: false,
        },
      ],
    },
  });
  const quoteId = unwrap(quote.body)?.id;

  await req('POST', `/quotations/${quoteId}/send`, { token });
  await req('POST', `/quotations/${quoteId}/mark-won`, { token });
  const converted = await req('POST', `/quotations/${quoteId}/convert-to-job`, { token });
  const jobId = unwrap(converted.body)?.jobId;

  const job = await req('GET', `/jobs/${jobId}`, { token });
  const chargeTotal = (unwrap(job.body)?.charges ?? [])
    .filter((c) => !c.is_cost)
    .reduce((sum, c) => sum + Number(c.amount ?? 0), 0);

  const invoice = await req('POST', `/invoices/from-job/${jobId}`, { token });
  const invoiceId = unwrap(invoice.body)?.id;
  const inv = await req('GET', `/invoices/${invoiceId}`, { token });
  const lineTotal = (unwrap(inv.body)?.lines ?? []).reduce(
    (sum, l) => sum + Number(l.amount ?? 0),
    0,
  );

  const delta = Math.abs(chargeTotal - lineTotal);
  const ok = delta <= TOLERANCE;

  console.log(JSON.stringify({ chargeTotal, lineTotal, delta, tolerance: TOLERANCE, ok }, null, 2));
  process.exit(ok ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
