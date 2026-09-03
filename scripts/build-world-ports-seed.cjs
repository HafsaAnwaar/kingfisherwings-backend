/**
 * Builds compact world sea-port + airport JSON seeds from open datasets.
 * Sea: UNECE UN/LOCODE (function position 1 = port)
 * Air: OurAirports (large/medium with IATA)
 *
 * Run: node scripts/build-world-ports-seed.cjs
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DATA = path.join(ROOT, "prisma", "seed", "data");

function parseCsv(text) {
  const rows = [];
  let i = 0;
  let field = "";
  let row = [];
  let inQuotes = false;
  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += ch;
      i++;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (ch === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
      continue;
    }
    field += ch;
    i++;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function cleanName(name) {
  return String(name || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
}

function buildSeaPorts() {
  const raw = fs.readFileSync(path.join(DATA, "unlocode_raw.csv"), "utf8");
  const rows = parseCsv(raw);
  const header = rows[0].map((h) => h.trim());
  const idx = Object.fromEntries(header.map((h, i) => [h, i]));

  const out = [];
  const seen = new Set();

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length < 8) continue;
    const country = (row[idx.Country] || "").trim().toUpperCase();
    const location = (row[idx.Location] || "").trim().toUpperCase();
    const name = cleanName(row[idx.NameWoDiacritics] || row[idx.Name]);
    const fn = row[idx.Function] || "";
    if (!country || !location || country.length !== 2 || location.length !== 3)
      continue;
    // Position 1 = port (sea/river). Accept '1' in first char.
    if (!fn.startsWith("1")) continue;
    if (!/^[A-Z]{2}$/.test(country) || !/^[A-Z0-9]{3}$/.test(location))
      continue;
    const un_locode = `${country}${location}`;
    if (seen.has(un_locode)) continue;
    seen.add(un_locode);
    if (!name) continue;
    out.push({
      un_locode,
      name,
      country_code: country,
      mode: "SEA",
    });
  }

  out.sort((a, b) => a.un_locode.localeCompare(b.un_locode));
  return out;
}

function buildAirports() {
  const raw = fs.readFileSync(path.join(DATA, "airports_raw.csv"), "utf8");
  const rows = parseCsv(raw);
  const header = rows[0].map((h) => h.replace(/^"|"$/g, "").trim());
  const idx = Object.fromEntries(header.map((h, i) => [h, i]));

  const allowedTypes = new Set(["large_airport", "medium_airport"]);
  const out = [];
  const seen = new Set();

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length < 14) continue;
    const type = (row[idx.type] || "").replace(/^"|"$/g, "");
    const iata = (row[idx.iata_code] || "").replace(/^"|"$/g, "").trim().toUpperCase();
    const icao = (row[idx.icao_code] || "").replace(/^"|"$/g, "").trim().toUpperCase();
    const name = cleanName((row[idx.name] || "").replace(/^"|"$/g, ""));
    const city = cleanName(
      (row[idx.municipality] || "").replace(/^"|"$/g, ""),
    ).slice(0, 100);
    const country = (row[idx.iso_country] || "")
      .replace(/^"|"$/g, "")
      .trim()
      .toUpperCase();

    if (!allowedTypes.has(type)) continue;
    if (!/^[A-Z]{3}$/.test(iata)) continue;
    if (!/^[A-Z]{2}$/.test(country)) continue;
    if (!name) continue;
    if (seen.has(iata)) continue;
    seen.add(iata);

    const entry = {
      iata_code: iata,
      name,
      country_code: country,
    };
    if (city) entry.city = city;
    if (/^[A-Z0-9]{4}$/.test(icao)) entry.icao_code = icao;
    out.push(entry);
  }

  out.sort((a, b) => a.iata_code.localeCompare(b.iata_code));
  return out;
}

function main() {
  console.log("Building sea ports from UN/LOCODE...");
  const sea = buildSeaPorts();
  const seaPath = path.join(DATA, "default-sea-ports.json");
  fs.writeFileSync(seaPath, JSON.stringify(sea));
  console.log(`  Wrote ${sea.length} sea ports -> ${seaPath}`);

  console.log("Building airports from OurAirports...");
  const air = buildAirports();
  const airPath = path.join(DATA, "default-airports.json");
  fs.writeFileSync(airPath, JSON.stringify(air));
  console.log(`  Wrote ${air.length} airports -> ${airPath}`);

  // Keep raw CSVs out of git if huge — leave them for rebuild; commit JSON only.
  console.log("Done.");
}

main();
