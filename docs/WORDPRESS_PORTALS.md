# WordPress PORTALS → FreightNest (link mode)

KingFisher Wings Group WordPress (`kingfisherwingsgroup.com`) shows **Employee / Customer / Vendor / Tracking**. Each button should **only redirect** into FreightNest. Visitors coming from the website must **not** type the workspace slug — it is carried in the URL as `tenant_slug`.

**API sign-in on WordPress** (POST username/password to Nest from the WP plugin) is **not** implemented. Use **Link to my software's login page** only. Leave API base URL and API key empty.

---

## KingFisher paste-ready URLs

Tenant slug: `kingfisher-tech`  
Frontend origin: `https://freightnest.kingfishertec.com`

| Portal | Software login URL (WordPress field) |
|--------|--------------------------------------|
| Employee | `https://freightnest.kingfishertec.com/login?tenant_slug=kingfisher-tech` |
| Customer | `https://freightnest.kingfishertec.com/portal/login?tenant_slug=kingfisher-tech` |
| Vendor | `https://freightnest.kingfishertec.com/vendor/login?tenant_slug=kingfisher-tech` |
| Tracking | `https://freightnest.kingfishertec.com/track?tenant_slug=kingfisher-tech` |

Tracking works without a slug (public ref lookup). Including `tenant_slug` is optional branding/hint only.

Staff admins can also copy live URLs for their tenant:

```http
GET /organization/settings/website-links
Authorization: Bearer <TENANT_ADMIN JWT>
```

---

## Frontend contract (required)

Login pages (**staff** `/login`, **customer** `/portal/login`, **vendor** `/vendor/login`) must:

1. On load, read `tenant_slug` (or `tenantSlug`) from the query string.
2. If present (2–100 chars): **prefill** the workspace/slug field and **hide or disable** it for that visit.
3. Submit existing APIs unchanged (slug still in JSON body):
   - Staff: `POST /auth/login` `{ tenant_slug, email, password }`
   - Customer: `POST /portal/auth/login`
   - Vendor: `POST /vendor/auth/login`
4. If the query param is **absent**, keep today’s UX (user enters slug manually).

Direct visits / bookmarks without `?tenant_slug=` are unchanged.

---

## Other tenants

Same WordPress plugin settings; replace slug and host:

`{FRONTEND}/login?tenant_slug={Tenant.slug}`  
`{FRONTEND}/portal/login?tenant_slug={Tenant.slug}`  
`{FRONTEND}/vendor/login?tenant_slug={Tenant.slug}`  
`{FRONTEND}/track?tenant_slug={Tenant.slug}`

Use `GET /organization/settings/website-links` after login as that tenant to avoid typos.

---

## Path overrides (env)

| Env | Default |
|-----|---------|
| `FRONTEND_URL` | `https://freightnest.kingfishertec.com` |
| `STAFF_LOGIN_URL` | `{FRONTEND}/login` |
| `PORTAL_LOGIN_URL` | `{FRONTEND}/portal/login` |
| `VENDOR_LOGIN_URL` | `{FRONTEND}/vendor/login` |
| `PUBLIC_TRACK_URL` | `{FRONTEND}/track` |

Backend helpers: `staffLoginUrlForTenant`, `portalLoginUrlForTenant`, `vendorLoginUrlForTenant`, `publicTrackUrlForTenant`, `websitePortalLinksForTenant` in `src/modules/payments/utils/frontend-url.util.ts`.
