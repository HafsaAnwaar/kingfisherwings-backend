/**
 * Generates two complete documents from live OpenAPI:
 *  - docs/API_PASS_CASES.md  (one PASS case per operation)
 *  - docs/API_FAIL_CASES.md  (one FAIL case per operation)
 * Does not skip any path+method from openapi-live.json
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SPEC = JSON.parse(fs.readFileSync(path.join(ROOT, 'openapi-live.json'), 'utf8'));

const PUBLIC = new Set([
  'POST /auth/login',
  'POST /auth/tenant-login',
  'POST /auth/super-admin/signup',
  'POST /auth/super-admin/login',
  'POST /auth/refresh',
  'POST /quotations/online-quote',
]);

const BASE = 'https://kingfisherwings.onrender.com';

function resolveSchema(schema, depth = 0) {
  if (!schema || depth > 6) return undefined;
  if (schema.$ref) {
    const name = schema.$ref.split('/').pop();
    return resolveSchema(SPEC.components?.schemas?.[name], depth + 1);
  }
  if (schema.allOf) {
    const merged = { type: 'object', properties: {}, required: [] };
    for (const part of schema.allOf) {
      const r = resolveSchema(part, depth + 1) || part;
      Object.assign(merged.properties, r.properties || {});
      if (r.required) merged.required.push(...r.required);
    }
    return merged;
  }
  return schema;
}

function exampleFromSchema(schema, fieldName = '') {
  const s = resolveSchema(schema);
  if (!s) return null;

  if (s.example !== undefined) return s.example;
  if (s.default !== undefined) return s.default;
  if (s.enum?.length) return s.enum[0];

  const t = Array.isArray(s.type) ? s.type[0] : s.type;

  if (t === 'string' || (!t && s.format)) {
    if (s.format === 'uuid' || /_id$|Id$/.test(fieldName)) return '{{UUID}}';
    if (s.format === 'email' || /email/i.test(fieldName)) return 'test@example.com';
    if (s.format === 'date') return '2026-07-11';
    if (s.format === 'date-time') return '2026-07-11T10:00:00.000Z';
    if (/password/i.test(fieldName)) return 'Welcome@123';
    if (/slug/i.test(fieldName)) return 'kingfisher';
    if (/phone/i.test(fieldName)) return '+971501234567';
    if (s.minLength || s.maxLength) return 'SAMPLE';
    return 'string';
  }
  if (t === 'number' || t === 'integer') return s.minimum ?? 1;
  if (t === 'boolean') return true;
  if (t === 'array') {
    const item = exampleFromSchema(s.items || {}, fieldName);
    return item === undefined ? [] : [item];
  }
  if (t === 'object' || s.properties) {
    const obj = {};
    const props = s.properties || {};
    const required = new Set(s.required || []);
    for (const [k, v] of Object.entries(props)) {
      // Prefer required fields; also include common optional useful ones
      if (required.has(k) || ['code', 'name', 'email', 'password', 'job_type', 'party_type', 'currency_code', 'mode'].includes(k)) {
        obj[k] = exampleFromSchema(v, k);
      }
    }
    // If nothing required, include first 5 props so body isn't empty
    if (!Object.keys(obj).length) {
      for (const [k, v] of Object.entries(props).slice(0, 8)) {
        obj[k] = exampleFromSchema(v, k);
      }
    }
    return obj;
  }
  return null;
}

function getRequestBodyExample(op) {
  const content = op.requestBody?.content;
  if (!content) return null;
  const json = content['application/json'] || content['multipart/form-data'] || Object.values(content)[0];
  if (!json?.schema) return null;
  return exampleFromSchema(json.schema);
}

function getQueryExample(op) {
  const params = (op.parameters || []).filter((p) => p.in === 'query');
  if (!params.length) return null;
  const q = {};
  for (const p of params.slice(0, 6)) {
    q[p.name] = exampleFromSchema(p.schema || { type: 'string' }, p.name);
  }
  return q;
}

function concretePath(template) {
  return template
    .replace(/\{tenantId\}/g, '{{TENANT_ID}}')
    .replace(/\{filename\}/g, 'sample.pdf')
    .replace(/\{documentType\}/g, 'QUOTATION')
    .replace(/\{currencyId\}/g, '{{CURRENCY_ID}}')
    .replace(/\{chargeCodeId\}/g, '{{CHARGE_CODE_ID}}')
    .replace(/\{jobId\}/g, '{{JOB_ID}}')
    .replace(/\{sessionId\}/g, '{{SESSION_ID}}')
    .replace(/\{milestoneId\}/g, '{{MILESTONE_ID}}')
    .replace(/\{lineId\}/g, '{{LINE_ID}}')
    .replace(/\{chargeId\}/g, '{{CHARGE_ID}}')
    .replace(/\{noteId\}/g, '{{NOTE_ID}}')
    .replace(/\{documentId\}/g, '{{DOCUMENT_ID}}')
    .replace(/\{containerId\}/g, '{{CONTAINER_ID}}')
    .replace(/\{contactId\}/g, '{{CONTACT_ID}}')
    .replace(/\{addressId\}/g, '{{ADDRESS_ID}}')
    .replace(/\{id\}/g, '{{ID}}')
    .replace(/\{[^}]+\}/g, '{{ID}}');
}

function expectedPassStatus(method, op) {
  const codes = Object.keys(op.responses || {});
  const success = codes.find((c) => c.startsWith('2'));
  if (success) return Number(success);
  if (method === 'POST') return 201;
  if (method === 'DELETE') return 204;
  return 200;
}

function loadOps() {
  const ops = [];
  for (const [p, methods] of Object.entries(SPEC.paths || {})) {
    for (const [m, op] of Object.entries(methods)) {
      if (!['get', 'post', 'put', 'patch', 'delete'].includes(m)) continue;
      const key = `${m.toUpperCase()} ${p}`;
      ops.push({
        method: m.toUpperCase(),
        path: p,
        key,
        summary: op.summary || op.operationId || '',
        tag: (op.tags && op.tags[0]) || 'Untagged',
        isPublic: PUBLIC.has(key),
        op,
        body: getRequestBodyExample(op),
        query: getQueryExample(op),
        expected: expectedPassStatus(m.toUpperCase(), op),
      });
    }
  }
  // Stable order by tag then path then method
  ops.sort((a, b) => a.tag.localeCompare(b.tag) || a.path.localeCompare(b.path) || a.method.localeCompare(b.method));
  return ops;
}

function jsonBlock(obj) {
  if (obj === null || obj === undefined) return '_none_';
  return '```json\n' + JSON.stringify(obj, null, 2) + '\n```';
}

function writePassDoc(ops) {
  const lines = [];
  lines.push('# API PASS Cases — Complete Catalog');
  lines.push('');
  lines.push(`**Base URL:** \`${BASE}\``);
  lines.push(`**Swagger:** ${BASE}/docs`);
  lines.push(`**Total APIs:** ${ops.length} (every OpenAPI operation — none skipped)`);
  lines.push(`**Generated:** ${new Date().toISOString()}`);
  lines.push('');
  lines.push('## How to use');
  lines.push('');
  lines.push('1. Create Super Admin → create Tenant → `POST /auth/tenant-login` → save `{{TOKEN}}`.');
  lines.push('2. Replace placeholders: `{{TOKEN}}`, `{{ID}}`, `{{JOB_ID}}`, `{{UUID}}`, etc. with real IDs from earlier responses.');
  lines.push('3. Password for all sample auth bodies: `Welcome@123`.');
  lines.push('4. Header for secured routes:');
  lines.push('');
  lines.push('```http');
  lines.push('Authorization: Bearer {{TOKEN}}');
  lines.push('Content-Type: application/json');
  lines.push('```');
  lines.push('');
  lines.push('| # | Method | Path | Tag | Expected |');
  lines.push('|---|--------|------|-----|----------|');
  ops.forEach((o, i) => {
    lines.push(`| ${i + 1} | ${o.method} | \`${o.path}\` | ${o.tag} | ${o.expected} |`);
  });
  lines.push('');

  let n = 0;
  let currentTag = null;
  for (const o of ops) {
    if (o.tag !== currentTag) {
      currentTag = o.tag;
      lines.push(`## ${currentTag}`);
      lines.push('');
    }
    n += 1;
    const url = concretePath(o.path);
    const qs = o.query
      ? '?' +
        Object.entries(o.query)
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
          .join('&')
      : '';

    lines.push(`### PASS-${String(n).padStart(3, '0')}: \`${o.method} ${o.path}\``);
    if (o.summary) lines.push(`**Purpose:** ${o.summary}`);
    lines.push('');
    lines.push(`| Field | Value |`);
    lines.push(`|-------|-------|`);
    lines.push(`| Case type | **PASS** |`);
    lines.push(`| Auth | ${o.isPublic ? 'Not required (@Public)' : 'Bearer `{{TOKEN}}` (or Super-Admin token for /tenants)'} |`);
    lines.push(`| Expected HTTP | **${o.expected}** |`);
    lines.push(`| Concrete URL | \`${BASE}${url}${qs}\` |`);
    lines.push('');
    lines.push('**Request**');
    lines.push('');
    lines.push('```http');
    lines.push(`${o.method} ${url}${qs} HTTP/1.1`);
    lines.push(`Host: kingfisherwings.onrender.com`);
    if (!o.isPublic) lines.push('Authorization: Bearer {{TOKEN}}');
    if (o.body && ['POST', 'PUT', 'PATCH'].includes(o.method)) {
      lines.push('Content-Type: application/json');
      lines.push('');
      lines.push(JSON.stringify(o.body, null, 2));
    }
    lines.push('```');
    lines.push('');
    if (o.body && ['POST', 'PUT', 'PATCH'].includes(o.method)) {
      lines.push('**Body (copy-paste)**');
      lines.push('');
      lines.push(jsonBlock(o.body));
      lines.push('');
    }
    if (o.query) {
      lines.push('**Query params**');
      lines.push('');
      lines.push(jsonBlock(o.query));
      lines.push('');
    }
    lines.push('**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).');
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  lines.push(`## Coverage check`);
  lines.push('');
  lines.push(`- OpenAPI operations: **${ops.length}**`);
  lines.push(`- PASS cases written: **${n}**`);
  lines.push(`- Missing: **${ops.length - n}**`);
  lines.push('');

  const out = path.join(ROOT, 'docs', 'API_PASS_CASES.md');
  fs.writeFileSync(out, lines.join('\n'));
  return { out, count: n };
}

function writeFailDoc(ops) {
  const lines = [];
  lines.push('# API FAIL Cases — Complete Catalog');
  lines.push('');
  lines.push(`**Base URL:** \`${BASE}\``);
  lines.push(`**Swagger:** ${BASE}/docs`);
  lines.push(`**Total APIs:** ${ops.length} (every OpenAPI operation — none skipped)`);
  lines.push(`**Generated:** ${new Date().toISOString()}`);
  lines.push('');
  lines.push('## How to use');
  lines.push('');
  lines.push('Each API has **at least one primary FAIL case**. Secured routes also list secondary fails.');
  lines.push('');
  lines.push('| Expected | Meaning |');
  lines.push('|----------|---------|');
  lines.push('| **401** | Missing/invalid JWT |');
  lines.push('| **400** | Validation / bad body |');
  lines.push('| **403** | Authenticated but missing permission/role |');
  lines.push('| **404** | Unknown id or cross-tenant id |');
  lines.push('| **409** | Duplicate unique key |');
  lines.push('');
  lines.push('| # | Method | Path | Tag | Primary fail |');
  lines.push('|---|--------|------|-----|--------------|');
  ops.forEach((o, i) => {
    const primary = o.isPublic ? '400' : '401';
    lines.push(`| ${i + 1} | ${o.method} | \`${o.path}\` | ${o.tag} | ${primary} |`);
  });
  lines.push('');

  let n = 0;
  let currentTag = null;
  for (const o of ops) {
    if (o.tag !== currentTag) {
      currentTag = o.tag;
      lines.push(`## ${currentTag}`);
      lines.push('');
    }
    n += 1;
    const url = concretePath(o.path);

    lines.push(`### FAIL-${String(n).padStart(3, '0')}: \`${o.method} ${o.path}\``);
    if (o.summary) lines.push(`**Purpose:** ${o.summary}`);
    lines.push('');

    if (o.isPublic) {
      lines.push('#### Primary FAIL — invalid / incomplete body');
      lines.push('');
      lines.push('| Field | Value |');
      lines.push('|-------|-------|');
      lines.push('| Case type | **FAIL** |');
      lines.push('| Expected HTTP | **400** (or 401 for bad credentials on login) |');
      lines.push('');
      lines.push('```http');
      lines.push(`${o.method} ${url} HTTP/1.1`);
      lines.push('Host: kingfisherwings.onrender.com');
      lines.push('Content-Type: application/json');
      lines.push('');
      if (o.key.includes('login') || o.key.includes('signup')) {
        lines.push(JSON.stringify({ email: 'not-an-email', password: 'x' }, null, 2));
      } else if (o.key.includes('refresh')) {
        lines.push(JSON.stringify({ refresh_token: 'invalid-token' }, null, 2));
      } else {
        lines.push(JSON.stringify({ __invalid__: true }, null, 2));
      }
      lines.push('```');
      lines.push('');
      lines.push('**Fail criteria:** Request is rejected; no resource created/updated.');
      lines.push('');
    } else {
      lines.push('#### Primary FAIL — no Authorization header');
      lines.push('');
      lines.push('| Field | Value |');
      lines.push('|-------|-------|');
      lines.push('| Case type | **FAIL** |');
      lines.push('| Expected HTTP | **401 Unauthorized** |');
      lines.push('');
      lines.push('```http');
      lines.push(`${o.method} ${url} HTTP/1.1`);
      lines.push('Host: kingfisherwings.onrender.com');
      if (['POST', 'PUT', 'PATCH'].includes(o.method)) {
        lines.push('Content-Type: application/json');
        lines.push('');
        lines.push('{}');
      }
      lines.push('```');
      lines.push('');
      lines.push('**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).');
      lines.push('');

      lines.push('#### Secondary FAIL — authenticated but invalid input / unknown id');
      lines.push('');
      lines.push('| Field | Value |');
      lines.push('|-------|-------|');
      lines.push('| Auth | Bearer `{{TOKEN}}` |');
      if (['POST', 'PUT', 'PATCH'].includes(o.method)) {
        lines.push('| Expected HTTP | **400** (validation) or **404**/**403**/**409** |');
        lines.push('');
        lines.push('```http');
        lines.push(`${o.method} ${url} HTTP/1.1`);
        lines.push('Authorization: Bearer {{TOKEN}}');
        lines.push('Content-Type: application/json');
        lines.push('');
        lines.push(JSON.stringify({ email: 'bad', password: 'x', __invalid__: true }, null, 2));
        lines.push('```');
      } else if (o.path.includes('{')) {
        lines.push('| Expected HTTP | **404** (random UUID) or **403** |');
        lines.push('');
        lines.push('```http');
        lines.push(`${o.method} ${url.replace(/\{\{[^}]+\}\}/g, '00000000-0000-0000-0000-000000000099')} HTTP/1.1`);
        lines.push('Authorization: Bearer {{TOKEN}}');
        lines.push('```');
      } else {
        lines.push('| Expected HTTP | **403** if role lacks permission |');
        lines.push('');
        lines.push('Use a staff token without the required permission (e.g. READ_ONLY / limited role).');
      }
      lines.push('');
      lines.push('**Fail criteria:** Operation does not succeed; error status as above.');
      lines.push('');
    }

    lines.push('---');
    lines.push('');
  }

  lines.push(`## Coverage check`);
  lines.push('');
  lines.push(`- OpenAPI operations: **${ops.length}**`);
  lines.push(`- FAIL case sections written: **${n}**`);
  lines.push(`- Missing: **${ops.length - n}**`);
  lines.push('');

  const out = path.join(ROOT, 'docs', 'API_FAIL_CASES.md');
  fs.writeFileSync(out, lines.join('\n'));
  return { out, count: n };
}

const ops = loadOps();
const pass = writePassDoc(ops);
const fail = writeFailDoc(ops);

// Machine-readable index proving 1:1 coverage
const index = {
  generatedAt: new Date().toISOString(),
  baseUrl: BASE,
  totalOperations: ops.length,
  passCases: pass.count,
  failCases: fail.count,
  missing: ops.length - pass.count,
  operations: ops.map((o, i) => ({
    index: i + 1,
    method: o.method,
    path: o.path,
    tag: o.tag,
    passId: `PASS-${String(i + 1).padStart(3, '0')}`,
    failId: `FAIL-${String(i + 1).padStart(3, '0')}`,
    isPublic: o.isPublic,
    expectedPassStatus: o.expected,
  })),
};
fs.writeFileSync(path.join(ROOT, 'docs', 'API_TEST_COVERAGE_INDEX.json'), JSON.stringify(index, null, 2));

console.log(JSON.stringify({ total: ops.length, pass: pass.count, fail: fail.count, passFile: pass.out, failFile: fail.out }, null, 2));
