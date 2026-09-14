/**
 * Map Nest controllers → method/path + @RequirePermissions codes.
 * Usage: node scripts/generate-api-permission-map.cjs
 */
const fs = require("fs");
const path = require("path");

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === "node_modules" || ent.name === "dist") continue;
      walk(p, out);
    } else if (ent.name.endsWith(".controller.ts")) out.push(p);
  }
  return out;
}

const files = walk(path.join(process.cwd(), "src"));
const rows = [];

for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  const ctrlMatch = text.match(/@Controller\(([^)]+)\)/);
  if (!ctrlMatch) continue;
  let bases = [];
  const raw = ctrlMatch[1].trim();
  if (raw.startsWith("[")) {
    const arr = raw.match(/["'`]([^"'`]+)["'`]/g) || [];
    bases = arr.map((s) => s.replace(/["'`]/g, ""));
  } else {
    bases = [raw.replace(/["'`]/g, "")];
  }

  // Split into method blocks roughly by decorators
  const methodRe =
    /@(Get|Post|Put|Patch|Delete)\(([^)]*)\)[\s\S]*?(?:@RequirePermissions\(([^)]*)\))?[\s\S]*?(?:async\s+)?(\w+)\s*\(/g;
  // Better: find each HTTP decorator then look ahead for RequirePermissions before method name
  const httpRe = /@(Get|Post|Put|Patch|Delete)\(([^)]*)\)/g;
  let m;
  const indices = [];
  while ((m = httpRe.exec(text))) {
    indices.push({
      method: m[1].toUpperCase(),
      pathArg: m[2].trim(),
      index: m.index,
    });
  }
  for (let i = 0; i < indices.length; i++) {
    const cur = indices[i];
    const end = i + 1 < indices.length ? indices[i + 1].index : text.length;
    const chunk = text.slice(cur.index, end);
    const permM = chunk.match(/@RequirePermissions\(([^)]*)\)/);
    let perms = [];
    if (permM) {
      const rawP = permM[1];
      // Capture string literals and CONST.REF patterns
      const lit = [...rawP.matchAll(/["'`]([^"'`]+)["'`]/g)].map((x) => x[1]);
      const refs = [
        ...rawP.matchAll(/([A-Z][A-Z0-9_]*)\.([A-Z0-9_]+)/g),
      ].map((x) => `${x[1]}.${x[2]}`);
      perms = lit.length ? lit : refs;
    }
    let sub = cur.pathArg.replace(/["'`]/g, "").trim();
    if (sub.startsWith("[")) {
      // first path only for map
      const first = sub.match(/["'`]([^"'`]+)["'`]/);
      sub = first ? first[1] : "";
    }
    for (const base of bases) {
      const full =
        "/" +
        [base, sub]
          .filter(Boolean)
          .join("/")
          .replace(/\/+/g, "/")
          .replace(/^\//, "");
      rows.push({
        file: path.relative(process.cwd(), file).replace(/\\/g, "/"),
        method: cur.method,
        path: full.startsWith("/") ? full : `/${full}`,
        permissions: perms,
      });
    }
  }
}

rows.sort(
  (a, b) =>
    a.path.localeCompare(b.path) || a.method.localeCompare(b.method),
);

const outDir = path.join(process.cwd(), "docs", "generated");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, "api-permission-map.json"),
  JSON.stringify({ generated_at: new Date().toISOString(), count: rows.length, endpoints: rows }, null, 2),
);

let md = `# API → required permissions (from source)

Generated from Nest controllers. Live Swagger may lag; use this for RBAC testing.

| Method | Path | Required permissions |
|--------|------|----------------------|
`;
for (const r of rows) {
  md += `| ${r.method} | \`${r.path}\` | ${r.permissions.length ? r.permissions.join(", ") : "_(none / public / role-only)_"} |\n`;
}
fs.writeFileSync(path.join(outDir, "api-permission-map.md"), md);
console.log(`Mapped ${rows.length} routes from ${files.length} controllers`);
