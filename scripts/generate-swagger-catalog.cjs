/**
 * Generate swagger catalog + realistic dummy bodies from openapi-live.json
 * Usage: node scripts/generate-swagger-catalog.cjs
 *
 * Also writes:
 *  - docs/generated/swagger-live-catalog.md / .json  (every live API)
 *  - docs/generated/number-formats-all-payloads.md   (all document_type variants)
 */
const fs = require("fs");
const path = require("path");

const openapiPath = path.join(process.cwd(), "openapi-live.json");
const outDir = path.join(process.cwd(), "docs", "generated");
fs.mkdirSync(outDir, { recursive: true });

const j = JSON.parse(fs.readFileSync(openapiPath, "utf8"));
const schemas = j.components?.schemas || {};

const FIELD_EXAMPLES = {
  password: "Welcome@123",
  current_password: "Welcome@123",
  new_password: "Welcome@123",
  confirm_password: "Welcome@123",
  email: "demo@kfw-demo.com",
  phone: "+971501234567",
  slug: "kfw-demo",
  code: "KFWD-001",
  name: "Kingfisher Demo Entity",
  first_name: "Ahmed",
  last_name: "Khan",
  full_name: "Ahmed Khan",
  short_name: "KFW Demo",
  display_name: "Kingfisher Demo",
  company_name: "Kingfisher Demo Freight LLC",
  company_code: "KFWD",
  company_legal_name: "Kingfisher Demo Freight LLC",
  company_registration_number: "REG-998877",
  admin_first_name: "Tenant",
  admin_last_name: "Admin",
  domain: "demo.kingfisherwings.com",
  website: "https://kingfisherwings.com",
  logo_url: "https://kingfisherwings.com/logo.png",
  avatar_url: "https://kingfisherwings.com/avatar.png",
  primary_color: "#0B3D5C",
  language: "en",
  base_currency: "AED",
  currency_code: "AED",
  timezone: "Asia/Dubai",
  country_code: "AE",
  preferred_country_code: "AE",
  city: "Dubai",
  address: "Office 1201, Business Bay, Dubai",
  vat_number: "100000000000003",
  cr_number: "CR-1234567",
  prefix: "KFWD",
  separator: "/",
  device_name: "Swagger-Chrome",
  tenant_slug: "kfw-demo",
  mac_address: "00:1A:2B:3C:4D:5E",
  totp_code: "123456",
  backup_code: "ABCD-EFGH",
  token: "invite-or-reset-token-hex",
  notes: "Swagger dummy test note",
  description: "Swagger dummy description",
  iata_code: "EK",
  icao_code: "UAE",
  prefix_code: "176",
  un_locode: "AEDXB",
  iso_code: "AE",
  iso3_code: "ARE",
  dial_code: "+971",
  region: "Middle East",
  symbol: "د.إ",
  office_hours_start: "09:00",
  office_hours_end: "18:00",
  office_hours_timezone: "Asia/Dubai",
  search: "al noor",
  module: "wms",
  submodule: "module",
  access: "write",
};

function exampleFromSchema(schema, depth = 0, propName = "") {
  if (!schema || depth > 8) return null;
  if (schema.$ref) {
    const name = schema.$ref.split("/").pop();
    return exampleFromSchema(schemas[name], depth + 1, propName);
  }
  if (schema.example !== undefined) return schema.example;
  if (schema.enum?.length) {
    const n = propName.toLowerCase();
    if (n === "document_type" && schema.enum.includes("QUOTATION")) {
      return "QUOTATION";
    }
    if (n === "party_type" && schema.enum.includes("CUSTOMER")) {
      return "CUSTOMER";
    }
    if (n === "job_type" && schema.enum.includes("AIR_EXPORT")) {
      return "AIR_EXPORT";
    }
    if (n === "role" && schema.enum.includes("WAREHOUSE_STAFF")) {
      return "WAREHOUSE_STAFF";
    }
    if (n === "status" && schema.enum.includes("ACTIVE")) {
      return "ACTIVE";
    }
    if (n === "access" && schema.enum.includes("write")) {
      return "write";
    }
    return schema.enum[0];
  }
  if (schema.allOf) {
    const merged = {};
    for (const s of schema.allOf) {
      const e = exampleFromSchema(s, depth + 1, propName);
      if (e && typeof e === "object" && !Array.isArray(e)) Object.assign(merged, e);
      else if (e != null && typeof e !== "object") return e;
    }
    return Object.keys(merged).length ? merged : null;
  }
  if (schema.oneOf?.length) {
    return exampleFromSchema(schema.oneOf[0], depth + 1, propName);
  }
  if (schema.anyOf?.length) {
    return exampleFromSchema(schema.anyOf[0], depth + 1, propName);
  }

  const t = schema.type;
  if (t === "object" || schema.properties) {
    const out = {};
    for (const [k, v] of Object.entries(schema.properties || {})) {
      out[k] = exampleFromSchema(v, depth + 1, k);
    }
    if (schema.additionalProperties && typeof schema.additionalProperties === "object") {
      out.extra_key = exampleFromSchema(schema.additionalProperties, depth + 1, "extra_key");
    }
    return out;
  }
  if (t === "array") {
    return [exampleFromSchema(schema.items || {}, depth + 1, propName)];
  }
  if (t === "string") {
    if (schema.format === "uuid") return "00000000-0000-4000-8000-000000000001";
    if (schema.format === "date") return "2026-09-14";
    if (schema.format === "date-time") return "2026-09-14T10:00:00.000Z";
    if (schema.format === "email") return "demo@kfw-demo.com";
    if (schema.format === "password") return "Welcome@123";
    if (schema.format === "uri" || schema.format === "url") {
      return "https://kingfisherwings.com";
    }
    const n = propName.toLowerCase();
    if (FIELD_EXAMPLES[n] !== undefined) return FIELD_EXAMPLES[n];
    if (n.includes("password") || n.includes("secret")) return "Welcome@123";
    if (n.includes("email")) return "demo@kfw-demo.com";
    if (n.includes("phone") || n.includes("mobile")) return "+971501234567";
    if (n.endsWith("_url") || n.includes("logo")) {
      return "https://kingfisherwings.com/asset.png";
    }
    if (n.includes("currency")) return "AED";
    if (n.includes("country")) return "AE";
    if (n.includes("city")) return "Dubai";
    if (n.includes("address")) return "Business Bay, Dubai";
    if (n.includes("timezone")) return "Asia/Dubai";
    if (n.includes("color")) return "#0B3D5C";
    if (n.includes("slug")) return "kfw-demo";
    if (n === "code" || n.endsWith("_code")) return "KFWD-001";
    if (n.includes("name")) return "Demo Name";
    if (n.includes("note") || n.includes("remark") || n.includes("comment")) {
      return "Swagger dummy note";
    }
    if (n.includes("token")) return "dummy-token-replace-me";
    if (schema.default !== undefined) return schema.default;
    return `demo-${n || "value"}`;
  }
  if (t === "number" || t === "integer") {
    if (propName.toLowerCase().includes("rate")) return 5;
    if (propName.toLowerCase().includes("limit")) return 50;
    if (propName.toLowerCase().includes("days")) return 30;
    if (propName.toLowerCase().includes("decimal")) return 2;
    return schema.default ?? 1;
  }
  if (t === "boolean") return schema.default ?? true;
  return null;
}

function enrichBody(pathKey, method, body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return body;
  const clone = JSON.parse(JSON.stringify(body));
  // Prefer realistic create-user / tenant shapes
  if (pathKey === "/tenants" && method === "post") {
    Object.assign(clone, {
      slug: "kfw-demo",
      code: "KFWD",
      name: "Kingfisher Demo Freight LLC",
      display_name: "Kingfisher Demo",
      password: "Welcome@123",
      email: "admin@kfw-demo.com",
      subscription_plan: "TRIAL",
      status: "ACTIVE",
    });
  }
  if (pathKey === "/parties" && method === "post") {
    Object.assign(clone, {
      party_type: "CUSTOMER",
      code: "CUST-001",
      name: "Al Noor Trading LLC",
      short_name: "Al Noor",
      email: "ops@alnoor.ae",
      phone: "+971501234567",
      country_code: "AE",
      city: "Dubai",
      currency_code: "AED",
      credit_limit: 50000,
      credit_days: 30,
      is_active: true,
    });
  }
  if (pathKey === "/organization/number-formats" && method === "post") {
    Object.assign(clone, {
      document_type: "QUOTATION",
      prefix: "KFWD",
      include_year: true,
      include_month: true,
      year_digits: 2,
      sequence_length: 5,
      separator: "/",
      reset_frequency: "YEARLY",
      is_active: true,
    });
  }
  return clone;
}

const rows = [];
for (const [p, methods] of Object.entries(j.paths || {})) {
  for (const [m, op] of Object.entries(methods)) {
    if (!["get", "post", "put", "patch", "delete"].includes(m)) continue;
    const tag = (op.tags && op.tags[0]) || "untagged";
    let body = null;
    const rb = op.requestBody?.content;
    let contentType = null;
    if (rb) {
      contentType =
        (rb["application/json"] && "application/json") ||
        (rb["multipart/form-data"] && "multipart/form-data") ||
        Object.keys(rb)[0];
      const json = rb[contentType];
      body = enrichBody(p, m, exampleFromSchema(json?.schema));
    }
    const params = (op.parameters || []).map((pr) => ({
      name: pr.name,
      in: pr.in,
      required: !!pr.required,
      example: exampleFromSchema(pr.schema, 0, pr.name) ?? pr.example ?? null,
      description: pr.description || undefined,
    }));
    const required =
      op.requestBody?.required ||
      (op.requestBody?.content &&
        Object.values(op.requestBody.content)[0]?.schema?.required) ||
      [];
    rows.push({
      tag,
      method: m.toUpperCase(),
      path: p,
      summary: op.summary || "",
      operationId: op.operationId || "",
      contentType,
      required_body_fields: Array.isArray(required) ? required : [],
      params,
      body,
    });
  }
}

rows.sort(
  (a, b) =>
    a.tag.localeCompare(b.tag) ||
    a.path.localeCompare(b.path) ||
    a.method.localeCompare(b.method),
);

fs.writeFileSync(
  path.join(outDir, "swagger-live-catalog.json"),
  JSON.stringify(
    {
      generated_at: new Date().toISOString(),
      base: "https://kingfisherwings-backend.onrender.com",
      count: rows.length,
      endpoints: rows,
    },
    null,
    2,
  ),
);

let md = `# Live Swagger — complete dummy payloads (every API)

Base: \`https://kingfisherwings-backend.onrender.com\`

Operations: **${rows.length}**

Password everywhere: \`Welcome@123\`

Replace UUID placeholders \`00000000-0000-4000-8000-000000000001\` with IDs from your run sequence (\`{{COMPANY_ID}}\`, \`{{CUSTOMER_ID}}\`, etc.).

---

`;

let cur = "";
for (const r of rows) {
  if (r.tag !== cur) {
    cur = r.tag;
    md += `\n## ${cur}\n\n`;
  }
  md += `### ${r.method} \`${r.path}\`\n\n`;
  if (r.summary) md += `_${r.summary}_\n\n`;
  if (r.contentType) md += `Content-Type: \`${r.contentType}\`\n\n`;
  if (r.required_body_fields?.length) {
    md += `Required body fields: ${r.required_body_fields.map((f) => `\`${f}\``).join(", ")}\n\n`;
  }
  if (r.params?.length) {
    md += `**Params (every field)**\n\n\`\`\`json\n${JSON.stringify(r.params, null, 2)}\n\`\`\`\n\n`;
  } else {
    md += `_No path/query params._\n\n`;
  }
  if (r.body) {
    md += `**Body (every field)**\n\n\`\`\`json\n${JSON.stringify(r.body, null, 2)}\n\`\`\`\n\n`;
  } else {
    md += `_No request body._\n\n`;
  }
  md += `---\n\n`;
}

fs.writeFileSync(path.join(outDir, "swagger-live-catalog.md"), md);

// Explicit number-format variants (user asked for complete data, not "also create X")
const nfBase = {
  prefix: "KFWD",
  include_branch_code: false,
  include_year: true,
  year_digits: 2,
  include_month: true,
  sequence_length: 5,
  separator: "/",
  reset_frequency: "YEARLY",
  is_active: true,
};
const docTypes = [
  "QUOTATION",
  "JOB_NUMBER",
  "INVOICE",
  "CREDIT_NOTE",
  "PURCHASE_INVOICE",
  "VOUCHER",
];
let nfMd = `# Number formats — complete dummy body for each document_type

\`POST /organization/number-formats\`  
Authorization: Bearer \`{{ADMIN_TOKEN}}\`

`;
for (const document_type of docTypes) {
  nfMd += `## ${document_type}\n\n\`\`\`json\n${JSON.stringify({ document_type, ...nfBase }, null, 2)}\n\`\`\`\n\n`;
}
fs.writeFileSync(path.join(outDir, "number-formats-all-payloads.md"), nfMd);

console.log(`Wrote ${rows.length} endpoints + number-formats variants to docs/generated/`);
