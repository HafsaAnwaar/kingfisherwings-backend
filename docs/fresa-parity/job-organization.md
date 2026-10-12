# Job Organization tab

Fresa: [Add organization after job created](https://blog.fresatechnologies.com/how-to-add-organization-name-after-the-job-is-created/)

## Behaviour

- Empty tab → `empty: true`, `actions.add_organization: true`
- Add by selecting existing party (`party_id`) or inline `create_party`
- Org types: `CLIENT`, `SHIPPER`, `CONSIGNEE`, `NOTIFY`, `BILLING_PARTY`, `AGENT`
- `CLIENT` / primary customer syncs `Job.billing_party_id` (customer name on job header)
- Shipper / consignee / agent sync matching job FKs
- Full party card returned on each org row

## Routes

| Method | Path |
|--------|------|
| GET | `/jobs/:id/detail/organization` |
| GET | `/jobs/:id/organizations` |
| POST | `/jobs/:id/organizations` |
| PUT | `/jobs/:id/organizations/:orgType` |
| DELETE | `/jobs/:id/organizations/:orgType` |
| POST | `/jobs/:id/organizations/copy-from` |
| POST | `/jobs/:id/organizations/refresh-snapshots` |
| PATCH | `/jobs/:id/organization/client-reference` (PO Number) |

Party search: `GET /parties?search=`

## Party snapshot (freeze at link)

On add/replace, a `party_snapshot` JSON is stored (name, address, city, country, phone, email, VAT, etc.). Tab responses include:
- `party` — live master
- `party_snapshot` — frozen at link time
- `party_display` — snapshot preferred for documents/UI

`POST .../refresh-snapshots` re-freezes from current master party.
