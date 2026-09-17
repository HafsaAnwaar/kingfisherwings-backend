# KFPP Quote Requests API — live test results (General Trading discovery)

**Target:** KingFisher Wings Group WordPress Quote Requests API  
**Base URL:** `https://kingfisherwingsgroup.com/wp-json/kfpp/v1/quotes`  
**Relation:** Discovery input for [`docs/GENERAL_TRADING_PLAN.md`](../GENERAL_TRADING_PLAN.md) (external system bridge for one tenant).  
**Raw artifacts:** `docs/generated/kfpp/` (response bodies; API key redacted where present).

> **Security:** The WordPress admin UI exposes a live API key. That key was used for this probe and has appeared in chat/screenshots. **Rotate/generate a new key** in WP after testing, prefer header auth only, and store the secret in encrypted tenant settings — never in git or docs.

---

## 1. Executive verdict

| Question | Result |
|----------|--------|
| Is the documented API reachable? | **Yes** |
| Does API-key auth work? | **Yes** (`X-KFPP-Api-Key` and `?api_key=`) |
| Does unauthenticated access work? | **No** → `401 rest_forbidden` |
| Can we list quote requests? | **Yes** → `200` with shape `{ "total": 0, "items": [] }` |
| Are there records to map today? | **No** — empty inventory |
| Can we exercise real GET/:id + successful PATCH? | **Not fully** — no existing numeric IDs; missing id → `404 kfpp_not_found` |
| Is this a full general-trading invoices/quotes ERP API? | **No** — WordPress **inquiry / quote-request** endpoint only (`kfpp/v1` exposes quotes collection + item) |
| Fit for KingFisher bridge Option A (live proxy)? | **Feasible for quote-requests** once data exists |
| Fit for invoices + merchandise trading docs? | **Not covered by this API** — need another system or more WP routes |

**Bottom line:** The connector shape is usable (auth + list + documented get/patch by numeric id). Right now there is **no payload to design field mapping or UI columns**. Submit at least one website inquiry (or seed a request) and re-run GET list / GET id / PATCH status.

---

## 2. Published contract vs observed routes

### Documented (WP plugin UI)

| Operation | Method | Path |
|-----------|--------|------|
| List all requests | `GET` | `/wp-json/kfpp/v1/quotes` |
| Single request | `GET` | `/wp-json/kfpp/v1/quotes/{id}` |
| Update status | `PATCH` | `/wp-json/kfpp/v1/quotes/{id}` body `{ "status": "..." }` |

Auth (either):

- Header: `X-KFPP-Api-Key: <key>`
- Query: `?api_key=<key>`

### Observed from `GET /wp-json/kfpp/v1`

```text
/kfpp/v1/quotes              methods: GET
/kfpp/v1/quotes/(?P<id>\d+)  methods: GET, PATCH
```

Notes:

- Item `id` must be **digits only**. Non-numeric path → WordPress `rest_no_route` (404).
- Collection does **not** register POST/PUT/DELETE (confirmed 404 `rest_no_route`).
- Namespace index args for list/detail are empty in the schema (`"args": []`) — query filters are undocumented.

---

## 3. Test matrix (executed)

| # | Perspective | Request | HTTP | Outcome |
|---|-------------|---------|------|---------|
| 01 | No auth | `GET /quotes` | **401** | `rest_forbidden` / “Sorry, you are not allowed to do that.” |
| 02 | Bad key (header) | `GET /quotes` + `X-KFPP-Api-Key: bad-key` | **401** | Same forbidden body |
| 03 | Good key (header) | `GET /quotes` + valid header | **200** | `{"total":0,"items":[]}` |
| 04 | Good key (query) | `GET /quotes?api_key=…` | **200** | Same empty list |
| 05 | Pagination guess | `?page=1&per_page=5` | **200** | Empty list (params appear ignored or noop when empty) |
| 06 | Status filter guess | `?status=new` | **200** | Empty list |
| 07 | Status `all` | `?status=all` | **200** | Empty list |
| 08 | Search guess | `?search=test` | **200** | Empty list |
| 09 | Order guess | `?orderby=date&order=desc` | **200** | Empty list |
| 10 | Missing numeric id | `GET /quotes/99999999` | **404** | `kfpp_not_found` / “Quote request not found” |
| 11 | Invalid id shape | `GET /quotes/not-an-id` | **404** | `rest_no_route` (route regex `\d+`) |
| 12 | Create via POST | `POST /quotes` | **404** | `rest_no_route` |
| 13 | Delete collection | `DELETE /quotes` | **404** | `rest_no_route` |
| 14 | Bearer token style | `Authorization: Bearer <key>` | **401** | Not accepted |
| 15 | Lowercase header | `x-kfpp-api-key` | **200** | Accepted (HTTP headers case-insensitive) |
| 16 | OPTIONS / CORS preflight | `OPTIONS /quotes` | **200** | Returns route metadata; **no** `Access-Control-Allow-Origin` for arbitrary origin observed on GET |
| 17 | PATCH missing id | `PATCH /quotes/99999999` `{status:pending}` | **404** | `kfpp_not_found` |
| 18 | PATCH without auth | `PATCH /quotes/1` | **401** | `rest_forbidden` |
| 19 | GET id `1` | `GET /quotes/1` | **404** | `kfpp_not_found` (no row) |
| 20 | PATCH id `1` invalid/empty body | with auth | **404** | Not found before body validation can be observed |
| 21 | WP root | `GET /wp-json/` | **200** | Site name “KingFisher Wings Group”, Hostinger/PHP 8.3 |
| 22 | Namespace index | `GET /wp-json/kfpp/v1` | **200** | Routes as above |

Latency (successful authenticated GETs): roughly **0.5–1.6 s** round-trip from this environment (Hostinger CDN `DYNAMIC`).

---

## 4. Response shapes observed

### Auth failure

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": { "status": 401 }
}
```

### Empty list (success)

```json
{
  "total": 0,
  "items": []
}
```

### Not found (plugin)

```json
{
  "code": "kfpp_not_found",
  "message": "Quote request not found",
  "data": { "status": 404 }
}
```

### Wrong route (core WP)

```json
{
  "code": "rest_no_route",
  "message": "No route was found matching the URL and request method.",
  "data": { "status": 404 }
}
```

### List response headers of interest

- `Content-Type: application/json; charset=UTF-8`
- `allow: GET` (collection)
- `access-control-allow-headers: Authorization, X-WP-Nonce, Content-Disposition, Content-MD5, Content-Type`  
  — **does not advertise `X-KFPP-Api-Key`**, so browser SPA calls from another origin may need a backend proxy (which matches KingFisher’s planned server-side connector).
- No `X-WP-Total` / `X-WP-TotalPages` on the empty list response (pagination may be custom via `total` in JSON).

### Item field schema

**Unknown.** List is empty; no sample item returned. Re-test after creating an inquiry on the WordPress site to capture keys (expected candidates from typical inquiry forms: name, email, phone, message, status, created_at, etc.).

---

## 5. Perspectives summary

### Security / auth

- API key required for list/detail/patch.
- Query-string auth works but **leaks into logs, proxies, browser history** — KingFisher connector should use **header only**.
- Bearer/JWT style not supported.
- Key rotation UI exists (“Generate New Key”) — use it after this research.

### Functional completeness vs docs

- Docs match registered routes for GET list, GET id, PATCH id.
- No write-create of quotes via this API (inquiries likely created by the public website form, not REST POST).

### Data readiness for General Trading bridge

- **Quote requests ≠ trading sales invoices.** This API alone does **not** satisfy “show trading invoices and quotes from their merchandise system” unless that business *is* this WordPress inquiry funnel.
- Empty `items` means we cannot validate status enums, PATCH semantics, or PDF/line-item needs yet.

### Reliability / ops

- Hosted on Hostinger (`platform: hostinger`, `Server: hcdn`), PHP 8.3.
- Sub-second to ~1.5s latency acceptable for admin list proxy; for heavy sync, still prefer mirror (Option B in the trading plan) if volume grows.

### Integration recommendation (update to plan)

| Plan option | Fit with KFPP API |
|-------------|-------------------|
| **A — Live proxy** | Good for staff list of **website quote requests** once data exists |
| **B — Sync mirror** | Still recommended if ERP needs search/history while WP is down |
| **C — Hybrid** | List from mirror; detail/status from live PATCH |
| **D — Deep link** | Possible today (open WP admin) but weaker UX |
| Invoices | **Not available** on `kfpp/v1` — separate discovery required |

Suggested KingFisher mapping (when building):

1. SuperAdmin enables `trading_bridge` **or** a narrower `wp_quote_requests` feature for the one tenant.  
2. Store base URL + API key encrypted.  
3. `GET /trading/quote-requests` → proxy/mirror of KFPP list.  
4. `PATCH /trading/quote-requests/:externalId/status` → KFPP PATCH.  
5. Do **not** merge into freight `/quotations` or `/invoices`.

---

## 6. Gaps / follow-ups

1. **Create one real quote request** on kingfisherwingsgroup.com and re-run:
   - `GET /quotes` (capture item schema)
   - `GET /quotes/{id}`
   - `PATCH /quotes/{id}` with a documented status, then restore previous status
2. Ask WP plugin owner for **allowed `status` values** and whether list supports filters (`status`, date range, pagination).
3. Confirm whether **invoices** exist in another plugin/namespace or a different trading system entirely.
4. **Rotate API key** after this probe; never commit secrets.
5. Optional: add automated smoke script `scripts/probe-kfpp-quotes-api.py` (DNS from some sandboxes failed; `curl.exe` from this machine worked).

---

## 7. Pass / fail scorecard

| Area | Score | Notes |
|------|-------|-------|
| Reachability | **PASS** | HTTPS REST live |
| Auth enforce | **PASS** | 401 without/invalid key |
| Auth success | **PASS** | Header + query |
| List contract | **PASS** | Stable `{total,items}` |
| Detail contract | **PARTIAL** | Route works; no data to assert body |
| PATCH contract | **PARTIAL** | Auth + 404 path verified; success path untested |
| Create/delete via API | **N/A / FAIL vs naive expectation** | Not in contract; correctly 404 |
| Invoice coverage | **FAIL** for full trading goal | Quotes/inquiries only |
| Ready to build freight-side mirror | **BLOCKED on sample payload** | Need ≥1 real item |

---

*Generated from live probes against `kingfisherwingsgroup.com` for General Trading research. Not a production KingFisher feature.*
