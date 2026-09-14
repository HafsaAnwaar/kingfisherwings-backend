/**
 * Generate swagger catalog + example bodies from openapi-live.json
 * Usage: node scripts/generate-swagger-catalog.cjs
 */
const fs = require("fs");
const path = require("path");

const openapiPath = path.join(process.cwd(), "openapi-live.json");
const outDir = path.join(process.cwd(), "docs", "generated");
fs.mkdirSync(outDir, { recursive: true });

const j = JSON.parse(fs.readFileSync(openapiPath, "utf8"));
const schemas = j.components?.schemas || {};

function exampleFromSchema(schema, depth = 0) {
  if (!schema || depth > 6) return null;
  if (schema.$ref) {
    const name = schema.$ref.split("/").pop();
    return exampleFromSchema(schemas[name], depth + 1);
  }
  if (schema.example !== undefined) return schema.example;
  if (schema.enum) return schema.enum[0];
  if (schema.allOf) {
    const merged = {};
    for (const s of schema.allOf) {
      const e = exampleFromSchema(s, depth + 1);
      if (e && typeof e === "object" && !Array.isArray(e)) Object.assign(merged, e);
      else if (e != null && typeof e !== "object") return e;
    }
    return Object.keys(merged).length ? merged : null;
  }
  const t = schema.type;
  if (t === "object" || schema.properties) {
    const out = {};
    for (const [k, v] of Object.entries(schema.properties || {})) {
      out[k] = exampleFromSchema(v, depth + 1);
    }
    return out;
  }
  if (t === "array") return [exampleFromSchema(schema.items || {}, depth + 1)];
  if (t === "string") {
    if (schema.format === "uuid") return "00000000-0000-4000-8000-000000000001";
    if (schema.format === "date") return "2026-09-14";
    if (schema.format === "date-time") return "2026-09-14T10:00:00.000Z";
    if (schema.format === "email") return "demo@example.com";
    if (schema.format === "password") return "Welcome@123";
    const desc = `${schema.description || ""}`.toLowerCase();
    if (desc.includes("password") || desc.includes("secret")) return "Welcome@123";
    return schema.default ?? "string";
  }
  if (t === "number" || t === "integer") return schema.default ?? 1;
  if (t === "boolean") return schema.default ?? true;
  return null;
}

const rows = [];
for (const [p, methods] of Object.entries(j.paths || {})) {
  for (const [m, op] of Object.entries(methods)) {
    if (!["get", "post", "put", "patch", "delete"].includes(m)) continue;
    const tag = (op.tags && op.tags[0]) || "untagged";
    let body = null;
    const rb = op.requestBody?.content;
    if (rb) {
      const json =
        rb["application/json"] ||
        rb["multipart/form-data"] ||
        Object.values(rb)[0];
      body = exampleFromSchema(json?.schema);
    }
    const params = (op.parameters || []).map((pr) => ({
      name: pr.name,
      in: pr.in,
      required: !!pr.required,
      example: exampleFromSchema(pr.schema) ?? pr.example ?? null,
    }));
    rows.push({
      tag,
      method: m.toUpperCase(),
      path: p,
      summary: op.summary || "",
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

let md = `# Live Swagger endpoint catalog (auto-generated)

Base: \`https://kingfisherwings-backend.onrender.com\`

Operations: **${rows.length}**

> Schema-derived examples — replace UUIDs with IDs from your sequence. Password fields use \`Welcome@123\`.

`;

let cur = "";
for (const r of rows) {
  if (r.tag !== cur) {
    cur = r.tag;
    md += `\n## ${cur}\n\n`;
  }
  md += `### ${r.method} \`${r.path}\`\n\n`;
  if (r.summary) md += `_${r.summary}_\n\n`;
  if (r.params?.length) {
    md += `**Params**\n\n\`\`\`json\n${JSON.stringify(r.params, null, 2)}\n\`\`\`\n\n`;
  }
  if (r.body) {
    md += `**Body**\n\n\`\`\`json\n${JSON.stringify(r.body, null, 2)}\n\`\`\`\n\n`;
  }
}

fs.writeFileSync(path.join(outDir, "swagger-live-catalog.md"), md);
console.log(`Wrote ${rows.length} endpoints to docs/generated/`);
