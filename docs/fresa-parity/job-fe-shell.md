# Job FE shell — OpenAPI contract checklist

Backend for job detail tabs is complete in this Nest repo. FE (separate app) should consume:

## Shell

| Concern | API |
|---------|-----|
| Detail header + action flags + tab list | `GET /jobs/:id/detail` |
| Per-tab payload | `GET /jobs/:id/detail/:tab` |

Tabs: `show_all`, `info`, `organization`, `dimensions`, `planned_container`, `actual_container`, `ex_rate`, `costing`, `department`, `shipping_bill_boe`, `routing`, `customs`, `history`, `booking_form`, `shipments`.

### Detail `actions` + `path_hints` (Wave 1+)

`GET /jobs/:id/detail` → `data.actions` / `data.actions.path_hints` must drive the Fresa-like job shell:

| FE control | Hint / flag | Backend |
|------------|-------------|---------|
| Job Not Invoiced vs DO | `job_not_invoiced_do` | `GET/POST /operations/job-not-invoiced-do` |
| Job Finance Report | `job_finance_report` | `GET/POST /operations/job-finance-report` |
| Push routing → houses | `routing_push_to_subjobs` | `POST /jobs/:id/routing-legs/push-to-subjobs` |
| Sync containers ← houses | `containers_sync_from_sub_jobs` | `POST /jobs/:id/containers/sync-from-sub-jobs` |
| Push containers → houses | `containers_push_to_sub_jobs` | `POST /jobs/:id/containers/push-to-sub-jobs` |
| Public track URL | `path_hints.tracking` | `/track?ref=…` |
| Docs upload | `path_hints.docs_upload` | `POST /jobs/:id/documents/upload` |
| Email To/CC suggest | `path_hints.email_recipients_suggest` | `GET /jobs/:id/email-recipients/suggest` |
| Closed overrides | `path_hints.closed_overrides` | `PATCH /jobs/:id/closed-overrides` |
| Typed refs | `path_hints.references` | `GET/PUT /jobs/:id/references` |

Routing tab `actions.push_to_subjobs` and containers tab `actions.sync_from_sub_jobs` / `push_to_sub_jobs` mirror the same endpoints.

## Thin tabs (now write-capable)

| Tab | Write routes |
|-----|----------------|
| department | `PATCH /jobs/:id/department` |
| ex_rate | `POST /jobs/:id/exchange-rates`, `DELETE .../exchange-rates/:rateId` |
| routing | `POST/PATCH/DELETE /jobs/:id/routing-legs[/:legId]`, `POST .../push-to-subjobs` |
| customs / shipping_bill_boe | `POST/PATCH/DELETE /jobs/:id/customs-refs[/:refId]` |
| booking_form | Tab returns `form` summary + `is_complete` + `path_hints.get` for mode form |

## Full tabs (existing)

Organization, dimensions, containers, costing — see [job-organization.md](./job-organization.md), [job-dimensions.md](./job-dimensions.md), [job-containers.md](./job-containers.md), [costing.md](./costing.md).

## Costing toolbar (FE forms)

Composite add, sale/cost PATCH, get-charges, get-job-charges, profit-share, vouchers (`auto_post` optional), sale/purchase invoices, custom-duty P&L — paths under `data.path_hints` on costing tab.

## Portal / vendor

| Audience | Path |
|----------|------|
| Customer | `GET /portal/jobs/:id/costing` (sale only) |
| Vendor | `GET /vendor/jobs/:id/costing` (cost only) |

## FE implementation status

Tracked as separate frontend repo work. Backend contracts above are the definition of done for this checklist.

## “Feels like Fresa” FE must-ship checklist

- [ ] Job shell reads `GET /jobs/:id/detail` for tabs + action flags (no hard-coded tab list)
- [ ] Routing toolbar shows **Push to sub-jobs** when `actions.routing_push_to_subjobs`
- [ ] Containers toolbar shows **Sync from sub-jobs** / **Push to sub-jobs**
- [ ] Ops menu links to DO-not-invoiced + Job Finance report screens via path_hints
- [ ] Track button uses `path_hints.tracking`
- [ ] Document upload uses typed upload + visibility (see [docs-reports.md](./docs-reports.md))
- [ ] Email compose pre-fills To/CC from `email-recipients/suggest`
