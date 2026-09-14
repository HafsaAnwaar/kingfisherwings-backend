/**
 * Extra payload packs for the testing guide.
 * Run after generate-swagger-catalog.cjs
 */
const fs = require("fs");
const path = require("path");

const j = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), "docs", "generated", "swagger-live-catalog.json"),
    "utf8",
  ),
);
const outDir = path.join(process.cwd(), "docs", "generated");

const masters = j.endpoints.filter(
  (e) => e.tag.startsWith("Masters") && e.method === "POST" && e.body,
);
let mastersMd = `# Masters — complete POST bodies (every field)

Use with \`Authorization: Bearer {{ADMIN_TOKEN}}\`. Replace UUIDs with your IDs.

`;
for (const e of masters) {
  mastersMd += `#### ${e.method} \`${e.path}\`\n\n`;
  if (e.summary) mastersMd += `_${e.summary}_\n\n`;
  mastersMd += "```json\n" + JSON.stringify(e.body, null, 2) + "\n```\n\n";
}
fs.writeFileSync(path.join(outDir, "masters-create-payloads.md"), mastersMd);

const corePaths = [
  "/quotations",
  "/jobs",
  "/invoices",
  "/parties",
  "/users",
  "/organization/number-formats",
  "/companies",
  "/auth/login",
  "/auth/tenant-login",
  "/auth/super-admin/login",
  "/auth/super-admin/signup",
  "/tenants",
];
let coreMd = `# Core APIs — complete dummy bodies (every field)

`;
for (const p of corePaths) {
  const matches = j.endpoints.filter((x) => x.path === p);
  for (const e of matches) {
    coreMd += `## ${e.method} \`${e.path}\`\n\n`;
    if (e.summary) coreMd += `_${e.summary}_\n\n`;
    if (e.params?.length) {
      coreMd +=
        "**Params**\n\n```json\n" +
        JSON.stringify(e.params, null, 2) +
        "\n```\n\n";
    }
    if (e.body) {
      coreMd +=
        "**Body**\n\n```json\n" + JSON.stringify(e.body, null, 2) + "\n```\n\n";
    } else {
      coreMd += "_No body._\n\n";
    }
  }
}
fs.writeFileSync(path.join(outDir, "core-create-payloads.md"), coreMd);

// Every mutating endpoint in one file for copy-paste
const mutating = j.endpoints.filter((e) =>
  ["POST", "PUT", "PATCH"].includes(e.method),
);
let mutMd = `# Every POST/PUT/PATCH — complete dummy payloads

Operations: **${mutating.length}**

`;
let tag = "";
for (const e of mutating) {
  if (e.tag !== tag) {
    tag = e.tag;
    mutMd += `\n## ${tag}\n\n`;
  }
  mutMd += `### ${e.method} \`${e.path}\`\n\n`;
  if (e.summary) mutMd += `_${e.summary}_\n\n`;
  if (e.params?.length) {
    mutMd +=
      "**Params**\n\n```json\n" +
      JSON.stringify(e.params, null, 2) +
      "\n```\n\n";
  }
  if (e.body) {
    mutMd +=
      "**Body (every field)**\n\n```json\n" +
      JSON.stringify(e.body, null, 2) +
      "\n```\n\n";
  } else {
    mutMd += "_No body._\n\n";
  }
  mutMd += "---\n\n";
}
fs.writeFileSync(path.join(outDir, "all-mutating-api-payloads.md"), mutMd);

console.log({
  masters: masters.length,
  mutating: mutating.length,
  written: [
    "masters-create-payloads.md",
    "core-create-payloads.md",
    "all-mutating-api-payloads.md",
  ],
});
