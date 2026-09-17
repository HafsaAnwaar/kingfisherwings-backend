/**
 * Live probe of KingFisher Wings WordPress Quote Requests API (KFPP).
 * Usage: set KFPP_API_KEY env, or pass as argv[2].
 * node scripts/probe-kfpp-quotes-api.cjs [apiKey]
 */
const fs = require("fs");
const path = require("path");

const BASE = "https://kingfisherwingsgroup.com/wp-json/kfpp/v1/quotes";
const KEY =
  process.env.KFPP_API_KEY ||
  process.argv[2] ||
  "";
const OUT_DIR = path.join(process.cwd(), "docs", "generated");
fs.mkdirSync(OUT_DIR, { recursive: true });

if (!KEY) {
  console.error("Missing API key. Set KFPP_API_KEY or pass as argv.");
  process.exit(1);
}

async function req(name, method, url, { headers = {}, body } = {}) {
  const started = Date.now();
  const init = { method, headers: { ...headers }, redirect: "manual" };
  if (body !== undefined) {
    init.headers["Content-Type"] = "application/json";
    init.body = typeof body === "string" ? body : JSON.stringify(body);
  }
  let status = 0;
  let text = "";
  let hdrs = {};
  let err = null;
  try {
    const res = await fetch(url, init);
    status = res.status;
    text = await res.text();
    res.headers.forEach((v, k) => {
      hdrs[k] = v;
    });
  } catch (e) {
    err = String(e && e.message ? e.message : e);
  }
  return {
    name,
    method,
    url: url.replace(KEY, "***"),
    status,
    elapsed_ms: Date.now() - started,
    headers: hdrs,
    body_raw: text,
    body_json: (() => {
      try {
        return JSON.parse(text);
      } catch {
        return null;
      }
    })(),
    error: err,
  };
}

function redact(obj) {
  const s = JSON.stringify(obj);
  return JSON.parse(s.split(KEY).join("***REDACTED***"));
}

(async () => {
  const results = [];

  results.push(await req("01_no_auth", "GET", BASE));
  results.push(
    await req("02_bad_key_header", "GET", BASE, {
      headers: { "X-KFPP-Api-Key": "invalid-key-000" },
    }),
  );
  results.push(
    await req("03_bad_key_query", "GET", `${BASE}?api_key=invalid-key-000`),
  );
  results.push(
    await req("04_list_header", "GET", BASE, {
      headers: { "X-KFPP-Api-Key": KEY },
    }),
  );
  results.push(
    await req("05_list_query", "GET", `${BASE}?api_key=${encodeURIComponent(KEY)}`),
  );
  results.push(
    await req("06_list_page_per_page", "GET", `${BASE}?page=1&per_page=5`, {
      headers: { "X-KFPP-Api-Key": KEY },
    }),
  );
  results.push(
    await req("07_list_status_new", "GET", `${BASE}?status=new`, {
      headers: { "X-KFPP-Api-Key": KEY },
    }),
  );
  results.push(
    await req("08_list_status_pending", "GET", `${BASE}?status=pending`, {
      headers: { "X-KFPP-Api-Key": KEY },
    }),
  );
  results.push(
    await req("09_get_missing_id", "GET", `${BASE}/99999999`, {
      headers: { "X-KFPP-Api-Key": KEY },
    }),
  );
  results.push(
    await req("10_get_invalid_id", "GET", `${BASE}/not-an-id`, {
      headers: { "X-KFPP-Api-Key": KEY },
    }),
  );
  results.push(
    await req("11_post_collection", "POST", BASE, {
      headers: { "X-KFPP-Api-Key": KEY },
      body: { status: "new" },
    }),
  );
  results.push(
    await req("12_put_collection", "PUT", BASE, {
      headers: { "X-KFPP-Api-Key": KEY },
      body: { status: "new" },
    }),
  );
  results.push(
    await req("13_delete_collection", "DELETE", BASE, {
      headers: { "X-KFPP-Api-Key": KEY },
    }),
  );
  results.push(
    await req("14_options_cors", "OPTIONS", BASE, {
      headers: {
        "X-KFPP-Api-Key": KEY,
        Origin: "https://example.com",
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "X-KFPP-Api-Key",
      },
    }),
  );
  results.push(await req("15_wp_json_root", "GET", "https://kingfisherwingsgroup.com/wp-json/"));
  results.push(
    await req("16_kfpp_namespace", "GET", "https://kingfisherwingsgroup.com/wp-json/kfpp/v1"),
  );

  // Discover first quote id from list (if any)
  const list = results.find((r) => r.name === "04_list_header");
  let sampleId = null;
  let sampleStatus = null;
  const payload = list && list.body_json;
  if (Array.isArray(payload) && payload.length) {
    sampleId = payload[0].id ?? payload[0].ID ?? payload[0].quote_id;
    sampleStatus = payload[0].status;
  } else if (payload && Array.isArray(payload.data) && payload.data.length) {
    sampleId = payload.data[0].id ?? payload.data[0].ID;
    sampleStatus = payload.data[0].status;
  } else if (payload && Array.isArray(payload.quotes) && payload.quotes.length) {
    sampleId = payload.quotes[0].id;
    sampleStatus = payload.quotes[0].status;
  }

  results.push({
    name: "17_discover_sample_id",
    method: "META",
    url: BASE,
    status: sampleId ? 200 : 204,
    elapsed_ms: 0,
    headers: {},
    body_raw: "",
    body_json: { sampleId, sampleStatus, list_shape: summarizeShape(payload) },
    error: null,
  });

  if (sampleId != null) {
    results.push(
      await req("18_get_by_id", "GET", `${BASE}/${sampleId}`, {
        headers: { "X-KFPP-Api-Key": KEY },
      }),
    );
    // Non-mutating PATCH probe: set same status back if present
    const patchStatus = sampleStatus || "pending";
    results.push(
      await req("19_patch_same_status", "PATCH", `${BASE}/${sampleId}`, {
        headers: { "X-KFPP-Api-Key": KEY },
        body: { status: patchStatus },
      }),
    );
    results.push(
      await req("20_patch_empty_body", "PATCH", `${BASE}/${sampleId}`, {
        headers: { "X-KFPP-Api-Key": KEY },
        body: {},
      }),
    );
    results.push(
      await req("21_patch_invalid_status", "PATCH", `${BASE}/${sampleId}`, {
        headers: { "X-KFPP-Api-Key": KEY },
        body: { status: "not_a_real_status_xyz" },
      }),
    );
    results.push(
      await req("22_patch_no_auth", "PATCH", `${BASE}/${sampleId}`, {
        body: { status: patchStatus },
      }),
    );
  } else {
    // Still probe PATCH against missing id
    results.push(
      await req("18_patch_missing_id", "PATCH", `${BASE}/99999999`, {
        headers: { "X-KFPP-Api-Key": KEY },
        body: { status: "pending" },
      }),
    );
  }

  // Auth header name variants
  results.push(
    await req("23_alt_header_Authorization_Bearer", "GET", BASE, {
      headers: { Authorization: `Bearer ${KEY}` },
    }),
  );
  results.push(
    await req("24_alt_header_lowercase", "GET", BASE, {
      headers: { "x-kfpp-api-key": KEY },
    }),
  );

  const redacted = redact(results);
  const outJson = path.join(OUT_DIR, "kfpp-quotes-api-probe.json");
  fs.writeFileSync(outJson, JSON.stringify(redacted, null, 2));
  console.log("Wrote", outJson);
  for (const r of results) {
    const preview =
      (r.body_raw || "").slice(0, 120).replace(/\s+/g, " ") ||
      JSON.stringify(r.body_json || {}).slice(0, 120);
    console.log(
      `${r.name.padEnd(36)} ${String(r.status).padStart(3)} ${String(r.elapsed_ms).padStart(5)}ms  ${preview}`,
    );
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

function summarizeShape(payload) {
  if (payload == null) return { type: "null" };
  if (Array.isArray(payload)) {
    return {
      type: "array",
      length: payload.length,
      item_keys: payload[0] ? Object.keys(payload[0]) : [],
    };
  }
  if (typeof payload === "object") {
    return {
      type: "object",
      keys: Object.keys(payload),
      data_len: Array.isArray(payload.data) ? payload.data.length : undefined,
    };
  }
  return { type: typeof payload };
}
