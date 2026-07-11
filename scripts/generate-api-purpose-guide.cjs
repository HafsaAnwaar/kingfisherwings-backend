/**
 * Generates docs/API_PURPOSE_GUIDE.md — purpose of every API (287), none skipped.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ops = JSON.parse(fs.readFileSync(path.join(ROOT, 'openapi-ops-sorted.json'), 'utf8'));

const MODULE_INTRO = {
  Auth: `
### What is Auth?
Authentication proves **who** is calling the API. Kingfisher has three login types:
- **Super Admin** — platform owner (creates tenants)
- **Tenant Admin** — company owner (tenant password)
- **Staff User** — employees with roles/permissions

JWTs (access + refresh) carry \`tenantId\` and permissions. Almost every other API requires \`Authorization: Bearer <token>\`.
`,
  'Tenants (Super Admin)': `
### What is a Tenant?
A **tenant** is one customer company on the SaaS platform (e.g. “Kingfisher Wings LLC”). All jobs, invoices, and users belong to a tenant. Super Admin creates and suspends tenants; data is isolated by PostgreSQL RLS.
`,
  Companies: `
### What is a Company?
A **company** is a legal entity under a tenant (multi-entity groups). Most tenants have one default company created at signup. Jobs, parties, and invoices can be tagged to a company.
`,
  Users: `
### What are Users?
**Users** are staff accounts inside a tenant (ops, sales, finance). Each user has a role (e.g. OPERATIONS_MANAGER) and permission codes like \`jobs.view\`. Admins create users, reset passwords, and force logout.
`,
  'Organization Profile': `
### What is Organization Profile?
The tenant’s own company profile (name, VAT, IATA cargo agent code, branding). Used on documents and invoices.
`,
  'Organization — Number Formats': `
### What are Number Formats?
Rules for auto-generating document numbers (quotation, job, invoice, AWB, voucher). Example: \`KFW/AE/07/26/00136\`. Without an active format, create APIs for those documents fail.
`,
  'Organization — Bank Accounts': `
### What are Bank Accounts?
Tenant bank details printed on invoices / used later in finance (AR collections, reconciliations).
`,
  Parties: `
### What are Parties?
**Parties** are business partners: customers, shippers, consignees, agents, airlines-as-parties, suppliers. Quotations need a customer; jobs need shipper/consignee; invoices bill a party. Contacts and addresses hang off each party.
`,
  Quotations: `
### What is a Quotation?
A **sales quote** for freight (air/sea/land). Lifecycle: DRAFT → SUBMITTED → APPROVED → SENT → WON → CONVERTED (to Job), or LOST/EXPIRED. Charge lines calculate revenue, cost, and GP (gross profit). PDFs and email deliver the quote to the customer.
`,
  'Quotations — Online Tariff Master': `
### What are Tariffs?
**Rate cards** (sell/buy rates by lane, mode, weight). Used to auto-price quotations and the public online-quote widget.
`,
  'Quotations — Zip Distance Master': `
### What are Zip Distances?
Distance table between postal codes — used for land/trucking rate calculations.
`,
  Jobs: `
### What is a Job?
A **shipment / booking file** (operations). Created from a won quotation or directly. Holds parties, ports, weights, milestones, charges (P&L), documents (HAWB/MAWB), notes, and containers (sea). Air Export jobs get a standard milestone checklist.
`,
  'AWB Stock': `
### What is AWB?
**AWB = Air Waybill** — the official air cargo transport document/number.

Airlines issue blocks of AWB numbers (prefix + serial range), e.g. Emirates prefix \`176\` with numbers \`176-12345670\` … \`176-12345699\`.

**AWB Stock** is the inventory of those unused numbers. Ops:
1. Register a batch (range) for an airline
2. **Allocate** the next number to a job (stamps HAWB/MAWB)
3. Mark **used** when flown/printed, or **void** if spoiled
4. Monitor **low stock** so you reorder from the airline before running out

Without stock control, duplicate or invalid AWBs cause airline rejection and customs delays.
`,
  Invoices: `
### What is an Invoice?
A **customer tax invoice** (AR) for freight charges — often created from billable job charges. UAE VAT (default 5%) is applied. Lifecycle: DRAFT → POSTED → SENT → PAID (or CANCELLED). PDF + email deliver the invoice.
`,
  'Credit Notes': `
### What is a Credit Note?
A document that **reduces** what a customer owes on a previous invoice (rate correction, short-shipment, goodwill). Always linked to the original invoice.
`,
  'Purchase Invoices': `
### What is a Purchase Invoice?
A **vendor bill** (AP) — what you owe airlines, agents, truckers. Separate from customer invoices.
`,
  'Payment Requests': `
### What is a Payment Request?
An internal/collections request to chase or record payment against an invoice/job. Flow: PENDING → APPROVED → PAID (or REJECTED).
`,
  Search: `
### What is Global Search?
One search box across jobs, quotations, and parties (job numbers, HAWB/MAWB, customer names, etc.).
`,
  Files: `
### What are Files?
Download endpoint for PDFs stored locally after generation (quotations, invoices, HAWB). Tenant in the URL must match the JWT tenant.
`,
  Untagged: `
### Health
Liveness / database connectivity check for monitoring.
`,
};

// Masters share a pattern
const MASTER_INTRO = (entity, why) => `
### What is this master?
**${entity}** is reference data used across ops and finance. ${why}

Standard pattern: list → get by id → create → update → soft-delete. Requires \`masters.view|create|update|delete\` permissions.
`;

Object.assign(MODULE_INTRO, {
  'Masters — Airlines': MASTER_INTRO('Airlines', 'Carriers for air jobs and AWB stock (IATA code, AWB prefix).'),
  'Masters — Airports': MASTER_INTRO('Airports', 'Origin/destination airports for air bookings.'),
  'Masters — Banks': MASTER_INTRO('Banks', 'Bank directory for organization bank accounts.'),
  'Masters — Branches': MASTER_INTRO('Branches', 'Office locations; used on jobs, stock, numbering.'),
  'Masters — ChargeCodes': MASTER_INTRO('Charge codes', 'Freight/local/customs charge types on quotes, jobs, invoices (e.g. AFR = Air Freight).'),
  'Masters — ContainerTypes': MASTER_INTRO('Container types', '20GP/40HC etc. for sea FCL jobs.'),
  'Masters — Countries': MASTER_INTRO('Countries', 'ISO country list for parties, ports, tax.'),
  'Masters — Currencies': MASTER_INTRO('Currencies', 'AED/USD etc. for pricing and invoices.'),
  'Masters — Departments': MASTER_INTRO('Departments', 'Org structure (Sales, Ops, Finance).'),
  'Masters — Designations': MASTER_INTRO('Designations', 'Job titles for users/HR.'),
  'Masters — Exchange Rates': MASTER_INTRO('Exchange rates', 'FX rates for multi-currency P&L.'),
  'Masters — Holidays': MASTER_INTRO('Holidays', 'Calendar for SLA / working-day logic.'),
  'Masters — HsCodes': MASTER_INTRO('HS codes', 'Harmonized System commodity codes for customs.'),
  'Masters — Ports': MASTER_INTRO('Ports', 'Sea/air/land ports (UN/LOCODE) for origin/destination.'),
  'Masters — ShippingLines': MASTER_INTRO('Shipping lines', 'Ocean carriers for sea jobs.'),
  'Masters — TaxRates': MASTER_INTRO('Tax rates', 'VAT/GST rates (e.g. UAE VAT 5%) for invoices.'),
  'Masters — Truckers': MASTER_INTRO('Truckers', 'Road carriers for land legs.'),
  'Masters — UnitsOfMeasure': MASTER_INTRO('Units of measure', 'KG, CBM, PKG for cargo quantities.'),
  'Masters — Vessels': MASTER_INTRO('Vessels', 'Ship names/IMO for sea bookings.'),
  'Masters — Warehouses': MASTER_INTRO('Warehouses', 'Storage locations for WMS later.'),
});

function explain(op) {
  const { method, path: p, summary } = op;
  const s = (summary || '').trim();

  // Prefer swagger summary when present, then enrich
  const base = s || `${method} ${p}`;

  // Path-based enrichment
  if (p === '/health') {
    return {
      why: 'Monitoring and load balancers need a cheap check that the API and database are alive.',
      does: 'Runs a DB ping and returns health status. (On this deployment it may still require JWT if not marked public.)',
    };
  }

  if (p.startsWith('/auth/')) {
    return authExplain(method, p, base);
  }
  if (p.startsWith('/tenants')) {
    return tenantExplain(method, p, base);
  }
  if (p.startsWith('/awb-stock')) {
    return awbExplain(method, p, base);
  }
  if (p.startsWith('/quotations')) {
    return quotationExplain(method, p, base);
  }
  if (p.startsWith('/jobs')) {
    return jobExplain(method, p, base);
  }
  if (p.startsWith('/invoices') || p.startsWith('/credit-notes') || p.startsWith('/purchase-invoices') || p.startsWith('/payment-requests')) {
    return invoiceExplain(method, p, base);
  }
  if (p.startsWith('/parties')) {
    return partyExplain(method, p, base);
  }
  if (p.startsWith('/masters/')) {
    return masterExplain(method, p, base);
  }
  if (p.startsWith('/organization')) {
    return orgExplain(method, p, base);
  }
  if (p.startsWith('/users')) {
    return userExplain(method, p, base);
  }
  if (p.startsWith('/companies')) {
    return crudExplain('company', method, p, base, 'Legal entity under the tenant for multi-company accounting.');
  }
  if (p.startsWith('/search')) {
    return {
      why: 'Users need one place to find a shipment, quote, or customer without knowing which module to open.',
      does: base + ' Searches jobs, quotations, and parties by free text (`q`).',
    };
  }
  if (p.startsWith('/files')) {
    return {
      why: 'Generated PDFs are stored on disk/S3; the UI needs a secure download URL scoped to the tenant.',
      does: base + ' Streams the file if the JWT tenant matches the path tenant.',
    };
  }

  return {
    why: 'Supports the freight ERP workflow for this resource.',
    does: base,
  };
}

function authExplain(method, p, base) {
  const map = {
    'POST /auth/super-admin/signup': ['Bootstrap the platform owner account once.', 'Creates a Super Admin and returns tokens.'],
    'POST /auth/super-admin/login': ['Super Admin must access tenant management.', 'Validates credentials and issues Super Admin JWT.'],
    'POST /auth/tenant-login': ['Company owner logs in with the tenant password (not a staff email).', 'Verifies tenant password and returns TENANT_ADMIN user tokens.'],
    'POST /auth/login': ['Daily staff login.', 'Validates tenant slug + email + password; returns access/refresh tokens and permissions.'],
    'POST /auth/refresh': ['Access tokens expire; clients renew without re-entering password.', 'Exchanges refresh token for a new token pair.'],
    'POST /auth/logout': ['End current device session securely.', 'Revokes the current session (jti) so the token cannot be reused.'],
    'POST /auth/logout-all': ['Lost laptop / security incident.', 'Revokes every active session for the user.'],
    'GET /auth/sessions': ['Show where the user is logged in.', 'Lists active sessions (devices).'],
    'POST /auth/sessions/{sessionId}/revoke': ['Kill one suspicious device.', 'Revokes a single session by id.'],
    'GET /auth/me': ['UI needs current user profile and permissions on load.', 'Returns the authenticated principal (user or super admin).'],
    'POST /auth/change-password': ['Users must rotate passwords (policy / first login).', 'Updates the user password hash and password history.'],
    'POST /auth/tenant/change-password': ['Change the tenant-owner login credential separately from staff passwords.', 'Updates Tenant.password_hash (TENANT_ADMIN only).'],
  };
  const key = `${method} ${p}`;
  const hit = map[key];
  if (hit) return { why: hit[0], does: hit[1] };
  return { why: 'Authentication / session security.', does: base };
}

function tenantExplain(method, p, base) {
  if (p.includes('sync-permissions')) {
    return {
      why: 'After deploying new modules (e.g. invoices), existing tenants need new permission rows seeded.',
      does: base + ' Reconciles Permission catalog into the tenant DB.',
    };
  }
  if (p.includes('statistics')) {
    return { why: 'Super Admin dashboard counts.', does: base };
  }
  if (p.includes('activate') || p.includes('deactivate')) {
    return { why: 'Suspend or resume a customer’s SaaS access.', does: base };
  }
  if (p.includes('restore')) {
    return { why: 'Undo a soft-delete.', does: base };
  }
  const verb = { GET: 'Read', POST: 'Create', PATCH: 'Update', DELETE: 'Soft-delete' }[method] || method;
  return {
    why: 'Super Admin onboards and manages SaaS customers (tenants).',
    does: `${verb} tenant record. ${base}`,
  };
}

function awbExplain(method, p, base) {
  if (p.includes('low-stock')) {
    return {
      why: 'Running out of AWB numbers stops air bookings; ops must reorder from the airline in time.',
      does: 'Returns batches whose remaining numbers are at or below the low-stock threshold.',
    };
  }
  if (p.includes('/allocate')) {
    return {
      why: 'Each air shipment needs a unique AWB number assigned from airline stock.',
      does: 'Takes the next serial from the batch, creates an allocation linked to the job, and stamps HAWB/MAWB on air details.',
    };
  }
  if (p.includes('/void')) {
    return {
      why: 'Wrong print, damaged stock, or cancelled booking must not leave the number reusable incorrectly.',
      does: 'Marks an allocated (unused) AWB as VOIDED with a reason.',
    };
  }
  if (p.includes('mark-used')) {
    return {
      why: 'Track that the AWB was actually printed/flown so stock reporting stays accurate.',
      does: 'Moves allocation status from ALLOCATED → USED.',
    };
  }
  if (p.includes('transfer-branch')) {
    return {
      why: 'AWB paper/electronic stock may move between Dubai and another branch.',
      does: 'Updates the batch’s owning branch_id.',
    };
  }
  if (p.includes('allocations') && method === 'GET') {
    return {
      why: 'Audit which jobs received which AWB numbers.',
      does: 'Lists AWB allocations (optionally filtered by job/airline).',
    };
  }
  if (p.includes('batches')) {
    if (method === 'POST') {
      return {
        why: 'Register a new block of AWB numbers received from an airline.',
        does: 'Creates a stock batch with prefix + range_from/range_to and next_number pointer.',
      };
    }
    if (method === 'GET' && p.endsWith('batches')) {
      return { why: 'See available AWB inventory.', does: 'Lists AWB stock batches for the tenant.' };
    }
    if (method === 'GET') {
      return { why: 'Inspect one batch and recent allocations.', does: base };
    }
    if (method === 'PATCH') {
      return { why: 'Adjust threshold/notes without changing the number range.', does: base };
    }
    if (method === 'DELETE') {
      return { why: 'Remove an empty/unused batch from active inventory.', does: 'Soft-deletes the batch if no active allocations.' };
    }
  }
  return { why: 'Air Waybill number inventory control.', does: base };
}

function quotationExplain(method, p, base) {
  if (p.includes('online-quote')) {
    return {
      why: 'Website widget lets prospects request a price without logging in.',
      does: 'Public endpoint: accepts cargo details, prices from tariffs, creates a draft quote.',
    };
  }
  if (p.includes('convert-to-job')) {
    return {
      why: 'When sales wins the deal, operations need a job file with charges carried over.',
      does: 'Sets quotation CONVERTED and creates a linked Job.',
    };
  }
  if (p.includes('/pdf')) {
    return {
      why: 'Customers need a printable quote; internal staff need a GP version.',
      does: base + ' Queues/stores PDF (customer or internal mode).',
    };
  }
  if (p.includes('send-email')) {
    return { why: 'Deliver the quotation PDF to the customer by email.', does: base };
  }
  if (p.includes('/submit')) {
    return { why: 'Start approval workflow.', does: 'DRAFT/REJECTED → SUBMITTED.' };
  }
  if (p.includes('/approve')) {
    return { why: 'Manager accepts pricing/GP.', does: 'SUBMITTED → APPROVED.' };
  }
  if (p.includes('/reject')) {
    return { why: 'Manager sends quote back for edits.', does: 'SUBMITTED → REJECTED.' };
  }
  if (p.includes('/send') && !p.includes('email')) {
    return { why: 'Mark quote as issued to customer (status).', does: 'APPROVED → SENT.' };
  }
  if (p.includes('mark-won')) {
    return { why: 'Customer accepted the quote.', does: 'SENT → WON.' };
  }
  if (p.includes('mark-lost')) {
    return { why: 'Track why sales lost the deal.', does: 'SENT → LOST with reason code.' };
  }
  if (p.includes('duplicate')) {
    return { why: 'Revise pricing without losing history.', does: 'Clones into a new DRAFT revision (version+1).' };
  }
  if (p.includes('expire')) {
    return { why: 'Quotes past valid_until should not stay open.', does: base };
  }
  if (p.includes('archive')) {
    return { why: 'Hide closed quotes from active lists.', does: 'Soft-archives a closed quotation.' };
  }
  if (p.includes('apply-tariff')) {
    return { why: 'Speed up pricing from rate cards.', does: 'Adds a charge line from the best matching tariff.' };
  }
  if (p.includes('/lines')) {
    return {
      why: 'Build sell and buy amounts; GP is recalculated live.',
      does: base,
    };
  }
  if (p.includes('analytics') || p.includes('reports')) {
    return { why: 'Sales management KPIs (volume, conversion, lost reasons).', does: base };
  }
  if (p.includes('tariffs')) {
    return { why: 'Maintain sell/buy rate cards for auto-quoting.', does: base };
  }
  if (p.includes('zip-distances')) {
    return { why: 'Land pricing needs distance between zips.', does: base };
  }
  if (p.includes('revisions')) {
    return { why: 'Audit quote version history.', does: base };
  }
  return {
    why: 'Sales quotation lifecycle for freight opportunities.',
    does: base,
  };
}

function jobExplain(method, p, base) {
  if (p.includes('pre-alert/send')) {
    return {
      why: 'Notify consignee/agent that cargo is departing (standard air export step).',
      does: 'Sends pre-alert email and completes the PRE_ALERT_SENT milestone.',
    };
  }
  if (p.includes('documents/hawb') || p.includes('documents/mawb') || p.includes('cargo-manifest') || p.includes('documents/pre-alert')) {
    return {
      why: 'Airlines/customs/customers need transport documents as PDF.',
      does: base + ' Queues Puppeteer/Bull PDF generation.',
    };
  }
  if (p.includes('generation-status')) {
    return { why: 'UI polls until async PDF is ready.', does: base };
  }
  if (p.includes('/pnl')) {
    return { why: 'Ops/finance see job profitability.', does: 'Returns revenue vs cost lines and GP.' };
  }
  if (p.includes('prorate-cost')) {
    return {
      why: 'Master consol costs must be shared fairly across house jobs.',
      does: 'Splits a master cost line to houses by chargeable weight.',
    };
  }
  if (p.includes('air-details')) {
    return { why: 'Store airline, flight, HAWB/MAWB, freight type.', does: base };
  }
  if (p.includes('sea-fcl-details')) {
    return { why: 'Store shipping line, BL numbers, cutoffs for FCL.', does: base };
  }
  if (p.includes('milestones')) {
    return {
      why: 'Track operational progress (booking → docs → departure → delivery).',
      does: base,
    };
  }
  if (p.includes('/charges')) {
    return { why: 'Job P&L and later invoicing come from charge lines.', does: base };
  }
  if (p.includes('/notes')) {
    return { why: 'Internal collaboration on the shipment file.', does: base };
  }
  if (p.includes('/documents')) {
    return { why: 'Register or finalize shipment documents (draft → original).', does: base };
  }
  if (p.includes('/containers')) {
    return { why: 'Sea FCL needs container numbers, seals, weights.', does: base };
  }
  if (p.includes('house-jobs')) {
    return { why: 'View houses under a master consol.', does: base };
  }
  if (p.includes('/close')) {
    return { why: 'Mark shipment operationally complete.', does: 'Status → COMPLETED.' };
  }
  if (p.includes('/cancel')) {
    return { why: 'Stop a booking that will not move.', does: 'Status → CANCELLED.' };
  }
  return {
    why: 'Shipment/booking operations file for freight execution.',
    does: base,
  };
}

function invoiceExplain(method, p, base) {
  if (p.includes('from-job')) {
    return {
      why: 'Bill the customer quickly from uninvoiced billable job charges.',
      does: 'Creates a draft customer invoice and links/marks those charges.',
    };
  }
  if (p.includes('/post')) {
    return { why: 'Lock the invoice for accounting (no more draft edits).', does: 'DRAFT → POSTED.' };
  }
  if (p.includes('/pdf')) {
    return { why: 'Produce tax invoice PDF for customer/records.', does: base };
  }
  if (p.includes('/send')) {
    return { why: 'Email the invoice PDF to accounts payable at the customer.', does: base };
  }
  if (p.includes('overdue')) {
    return { why: 'Collections team needs past-due AR.', does: base };
  }
  if (p.includes('/cancel')) {
    return { why: 'Void an invoice that should not be collected.', does: base };
  }
  if (p.startsWith('/credit-notes')) {
    return {
      why: 'Correct overbilling without deleting the original tax invoice.',
      does: base,
    };
  }
  if (p.startsWith('/purchase-invoices')) {
    return {
      why: 'Record what the company owes vendors (airline/agent bills).',
      does: base,
    };
  }
  if (p.startsWith('/payment-requests')) {
    if (p.includes('approve')) return { why: 'Finance authorizes collection/payment.', does: 'PENDING → APPROVED.' };
    if (p.includes('reject')) return { why: 'Finance declines the request with a reason.', does: 'PENDING → REJECTED.' };
    if (p.includes('mark-paid')) return { why: 'Record that money was received/paid.', does: 'APPROVED → PAID; may update invoice balance.' };
    return { why: 'Track payment collection workflow against invoices/jobs.', does: base };
  }
  if (p.includes('/lines')) {
    return { why: 'Invoice amounts are built from taxable/non-taxable lines.', does: base };
  }
  return {
    why: 'Accounts receivable / billing for freight services.',
    does: base,
  };
}

function partyExplain(method, p, base) {
  if (p.includes('credit-status')) {
    return {
      why: 'Stop quoting/shipping to customers on credit hold or blacklist.',
      does: 'Updates credit_status (ACTIVE / ON_HOLD / BLACKLISTED).',
    };
  }
  if (p.includes('/import')) {
    return { why: 'Onboard many customers/agents at once.', does: 'CSV bulk import with per-row errors.' };
  }
  if (p.includes('/contacts')) {
    return { why: 'Store multiple people (ops, accounts) per party.', does: base };
  }
  if (p.includes('/addresses')) {
    return { why: 'Pickup/delivery/billing addresses.', does: base };
  }
  return {
    why: 'Master data for customers, shippers, agents, and other partners.',
    does: base,
  };
}

function masterExplain(method, p, base) {
  const entity = p.split('/')[2] || 'master';
  const actions = {
    GET: p.includes('{') ? `Fetch one ${entity} record by id.` : `List ${entity} for dropdowns and admin screens.`,
    POST: `Create a new ${entity} reference record.`,
    PATCH: `Update ${entity} fields.`,
    DELETE: `Soft-delete ${entity} (keeps history; hides from active lists).`,
  };
  return {
    why: `Reference data (${entity}) is required so jobs/quotes/invoices use consistent codes and names.`,
    does: `${actions[method] || base} ${base !== actions[method] ? `(${base})` : ''}`.trim(),
  };
}

function orgExplain(method, p, base) {
  if (p.includes('number-formats')) {
    if (p.includes('preview')) {
      return { why: 'Show users what the next number will look like before saving.', does: base };
    }
    return {
      why: 'Document numbers must be unique, branded, and reset by year/month per policy.',
      does: base,
    };
  }
  if (p.includes('bank-accounts')) {
    return { why: 'Print bank details on invoices / use in banking later.', does: base };
  }
  return { why: 'Tenant self-service organization settings.', does: base };
}

function userExplain(method, p, base) {
  if (p.includes('admin-reset-password')) {
    return { why: 'Helpdesk unlocks users who forgot passwords.', does: 'Issues a new temporary password.' };
  }
  if (p.includes('force-logout')) {
    return { why: 'Security: kill all sessions for a compromised account.', does: base };
  }
  if (p.includes('change-password')) {
    return { why: 'Self-service password change.', does: base };
  }
  if (p.includes('/status')) {
    return { why: 'Activate, suspend, or lock staff accounts.', does: base };
  }
  if (p.includes('/bulk')) {
    return { why: 'HR/admin mass updates.', does: base };
  }
  if (p.includes('restore')) {
    return { why: 'Reactivate a soft-deleted user.', does: base };
  }
  return {
    why: 'Manage staff access inside the tenant.',
    does: base,
  };
}

function crudExplain(name, method, p, base, why) {
  return {
    why,
    does: base || `${method} ${name}`,
  };
}

// Build document
const lines = [];
lines.push('# Kingfisher Wings ERP — Purpose of Every API');
lines.push('');
lines.push('**Base URL:** `https://kingfisherwings.onrender.com`');
lines.push('**Swagger:** https://kingfisherwings.onrender.com/docs');
lines.push(`**Total APIs documented:** ${ops.length} (none skipped)`);
lines.push(`**Generated:** ${new Date().toISOString()}`);
lines.push('');
lines.push('This guide explains **what each area of the system is for**, then **why each API exists** and **what it does**.');
lines.push('');
lines.push('## End-to-end business flow (how APIs connect)');
lines.push('');
lines.push('```');
lines.push('Super Admin creates Tenant');
lines.push('   → Tenant Admin / Staff login (Auth)');
lines.push('   → Masters (ports, airlines, charge codes, tax…)');
lines.push('   → Parties (customers / shippers)');
lines.push('   → Quotation (price → approve → send → win)');
lines.push('   → Job (booking, milestones, charges)');
lines.push('   → AWB Stock allocate (air waybill number)');
lines.push('   → Documents / pre-alert');
lines.push('   → Invoice from job → post → PDF → email');
lines.push('   → Payment request / credit note if needed');
lines.push('```');
lines.push('');
lines.push('## Index by module');
lines.push('');
lines.push('| # | Method | Path | Module |');
lines.push('|---|--------|------|--------|');
ops.forEach((o, i) => {
  lines.push(`| ${i + 1} | ${o.method} | \`${o.path}\` | ${o.tag} |`);
});
lines.push('');

let n = 0;
let currentTag = null;
for (const op of ops) {
  if (op.tag !== currentTag) {
    currentTag = op.tag;
    lines.push(`## ${currentTag}`);
    lines.push('');
    if (MODULE_INTRO[currentTag]) {
      lines.push(MODULE_INTRO[currentTag].trim());
      lines.push('');
    }
  }

  n += 1;
  const { why, does } = explain(op);
  lines.push(`### ${String(n).padStart(3, '0')}. \`${op.method} ${op.path}\``);
  lines.push('');
  if (op.summary) {
    lines.push(`**Swagger summary:** ${op.summary}`);
    lines.push('');
  }
  lines.push(`| | |`);
  lines.push(`|-|-|`);
  lines.push(`| **Why it exists** | ${why} |`);
  lines.push(`| **What it does** | ${does} |`);
  lines.push('');
}

lines.push('## Coverage');
lines.push('');
lines.push(`- OpenAPI operations: **${ops.length}**`);
lines.push(`- Explained in this document: **${n}**`);
lines.push(`- Missing: **${ops.length - n}**`);
lines.push('');
lines.push('---');
lines.push('');
lines.push('*Related docs: `API_PASS_CASES.md`, `API_FAIL_CASES.md`, `api-complete-testing-guide.md`.*');

const out = path.join(ROOT, 'docs', 'API_PURPOSE_GUIDE.md');
fs.writeFileSync(out, lines.join('\n'));
console.log(JSON.stringify({ out, total: ops.length, written: n }, null, 2));
