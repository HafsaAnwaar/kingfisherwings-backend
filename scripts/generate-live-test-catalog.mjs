const fs = require('fs');

const ops = JSON.parse(fs.readFileSync('openapi-ops.json', 'utf8'));
const PUBLIC = new Set([
  'POST /auth/login',
  'POST /auth/tenant-login',
  'POST /auth/super-admin/signup',
  'POST /auth/super-admin/login',
  'POST /auth/refresh',
  'POST /quotations/online-quote',
]);

const lines = [];
lines.push('# Live API Test Cases Catalog (Pass + Fail)');
lines.push('');
lines.push('**Target:** https://kingfisherwings.onrender.com');
lines.push('**Swagger:** https://kingfisherwings.onrender.com/docs');
lines.push(`**Total operations:** ${ops.length}`);
lines.push('');
lines.push('## How to run automated suite');
lines.push('');
lines.push('```bash');
lines.push('npm run test:live:fetch-spec   # refresh OpenAPI from Render');
lines.push('npm run test:live             # execute pass + fail against live');
lines.push('```');
lines.push('');
lines.push('Reports:');
lines.push('- `docs/live-api-test-report.md`');
lines.push('- `docs/live-api-test-results.json`');
lines.push('');
lines.push('Default strong password used in positive auth tests: `Welcome@123`');
lines.push('');
lines.push('## Legend');
lines.push('');
lines.push('| Case | Meaning |');
lines.push('|------|---------|');
lines.push('| **PASS** | Valid auth + valid data → expect 2xx |');
lines.push('| **FAIL (401)** | Missing Bearer token → expect Unauthorized |');
lines.push('| **FAIL (400)** | Invalid/missing body fields → expect Bad Request |');
lines.push('| **FAIL (403)** | Authenticated but missing permission → Forbidden |');
lines.push('| **FAIL (404)** | Unknown UUID / other tenant → Not Found |');
lines.push('');

let n = 0;
const byTag = {};
for (const o of ops) {
  const tag = o.tags || 'Other';
  (byTag[tag] = byTag[tag] || []).push(o);
}

for (const [tag, list] of Object.entries(byTag).sort()) {
  lines.push(`## ${tag}`);
  lines.push('');
  for (const o of list) {
    n += 1;
    const key = `${o.method} ${o.path}`;
    const isPublic = PUBLIC.has(key);
    lines.push(`### ${n}. \`${key}\``);
    if (o.summary) lines.push(`_${o.summary}_`);
    lines.push('');
    lines.push('| Case | Expected | How to test |');
    lines.push('|------|----------|-------------|');
    if (isPublic) {
      lines.push('| PASS | 2xx | Valid body (see `docs/api-complete-testing-guide.md`) |');
      lines.push('| FAIL | 400 | Omit required fields / wrong types |');
    } else {
      lines.push('| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |');
      lines.push('| FAIL | 401 | Call with no Authorization header |');
      lines.push('| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |');
    }
    lines.push('');
  }
}

fs.mkdirSync('docs', { recursive: true });
fs.writeFileSync('docs/live-api-test-cases-catalog.md', lines.join('\n'));
console.log(`Wrote docs/live-api-test-cases-catalog.md with ${n} endpoints`);
