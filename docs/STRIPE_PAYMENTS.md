# Stripe payment gateway

Stripe is an **external processor only**. The ERP ledger (invoices, `payments`,
`payment_allocations`, `vouchers`) stays the source of truth: a successful Stripe
payment on a customer invoice becomes an ordinary posted ERP receipt created by the
existing `gl/PaymentsService.create()` + `post()` — the same code path as a manual
receipt — so vouchers, AR, allocations, invoice balances, portal payment history and
reports all see it with no second accounting system.

Code: `src/modules/payments/` · Migration: `prisma/migrations/20260930120000_stripe_payment_gateway`

## Flows

| Flow | Who pays | Stripe account | Ledger |
|---|---|---|---|
| Customer invoice (Tenant → Customer) | Customer (portal, Pay Now link) or staff-initiated checkout | Tenant's own Stripe account, or the platform account if `use_platform_account` | ERP receipt via GL (`STRIPE:<payment_intent>`) |
| Platform invoice (Super Admin → Tenant) | Tenant admin | Platform account | `platform_invoices` (platform receivables) |
| Manual payment / proof | Customer, vendor, staff, or tenant (platform) | — | Customer/vendor: proof **approve** posts an ERP receipt/payment (`PROOF:<proof id>`). Platform: Super Admin verifies |
| Vendor (AP) | Tenant pays vendor | — (no Stripe Connect) | Existing payment requests / proofs; approving a vendor proof posts an AP payment |
| SaaS subscription | Tenant | Platform account (Stripe Billing) | Tenant subscription fields synced from webhooks |

```
ERP invoice ─▶ PaymentTransaction (attempt, PENDING) ─▶ Stripe Checkout Session
      ▲                                                        │
      │        Stripe webhook (signature verified, stored, deduped)
      │                                                        ▼
 invoice balance ◀─ GL post() ◀─ GL create(RECEIPT, allocation) ◀─ attempt PAID
      └─ voucher (BRV), notifications, receipt email, audit_logs
```

### Payment states (`OnlinePaymentStatus`)
`PENDING → REQUIRES_ACTION | PROCESSING → PAID → PARTIALLY_REFUNDED | REFUNDED`,
or `FAILED | CANCELLED | EXPIRED` (retryable — a retry is a new attempt on the same
invoice). Manual platform payments: `PENDING_VERIFICATION → PAID | REJECTED`.
Customer/vendor proofs keep the existing `PaymentProofStatus`
(`SUBMITTED`≈pending verification, `ACKNOWLEDGED`≈approved, `REJECTED`).
Invoices keep `InvoiceStatus` (`PARTIALLY_PAID`, `PAID`, …).

### Refunds
`POST /payments/:id/refund` (staff, `payments.refund`) or a refund issued in the Stripe
dashboard (picked up by webhook). Once Stripe reports the refund succeeded, the posted
ERP receipt is cancelled with the existing `cancel()` (reversal voucher, invoice balance
restored) and any net remainder is re-posted — so the invoice reopens by the refunded
amount. Issue a credit note through the normal flow if the customer no longer owes it.

## Endpoints (new)

Staff (JWT + permissions): `GET/PUT /payments/stripe/settings`, `GET /payments/stripe/status|config`,
`POST /invoices/:id/pay`, `GET /invoices/:id/payment-status`, `GET /invoices/:id/payments`,
`POST /invoices/:id/payment-link`, `GET /invoices/:id/payment-links`,
`GET /payments`, `GET /payments/:id`, `GET /payments/:id/checkout-status?sync=true`,
`POST /payments/:id/retry|checkout|cancel|refund`, `GET /payments/:id/refunds`,
`GET /payments/refunds/:id`, `GET /payments/history[/customer/:id|/vendor/:id|/invoice/:id]`,
`POST /invoices/:id/payment-proofs` (staff upload), `PATCH /payment-proofs/:id/approve`,
`GET /payment-proofs/:id/file`, `DELETE /payment-proofs/:id`.

Customer portal: `POST /portal/invoices/:id/pay|checkout`, `GET /portal/invoices/:id/payment-status`,
`GET /portal/payments/online[/:id]`, `POST /portal/payments/online/:id/retry|cancel`,
`GET /portal/payments/stripe/config`, `GET /portal/invoices/:id/payment-proofs/:proofId/file`.

Vendor portal: `GET /vendor/invoices/:id/payment-status`.

Public: `GET /pay/:token`, `POST /pay/:token/checkout` (payment links),
`POST /payments/stripe/webhook`, `POST /payments/stripe/webhook/:token`.

Super Admin (`/platform/...`): invoices CRUD, `send`, `payment-link`, `cancel`, `pdf`,
`payment-status`, `payments`, `manual-payments`; `payments/:id/verify|reject|refund|proof`;
`billing/plans` CRUD; `tenants/:id/subscription[/change-plan|/cancel]`;
`tenants/:id/payment-gateway`; `billing/stripe/status`; `billing/webhook-events[/:id/replay]`.

Tenant (`/tenant/...`, `platform_billing.*`): `platform-invoices[/:id][/pdf|/payment-status]`,
`platform-invoices/:id/pay|checkout|payment-proof`, `platform-payments[/:id][/proof]`,
`billing/plans`, `subscription`, `subscription/checkout|change-plan|cancel`.

Existing endpoints reused unchanged: `/gl/payments/*` (manual receipts/payments),
`/payment-requests/*`, `/portal/payments`, `/vendor/payments`, `/invoices/:id/send`
(now adds a "Pay Now" link when online payments are enabled; opt out with
`include_payment_link: false`).

## Setup

1. `npm run prisma:migrate:deploy`
2. Env (see `.env.example`): `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`,
   `STRIPE_WEBHOOK_SECRET`, `PAYMENT_GATEWAY_ENCRYPTION_KEY`, `FRONTEND_URL`
   (optional `PORTAL_FRONTEND_URL`, `PAYMENT_LINK_BASE_URL`).
3. Existing tenants: run `POST /tenants/sync-permissions` (Super Admin) so roles get the new
   `payments.*` / `platform_billing.*` permissions.
4. Platform webhook in the Stripe dashboard → `POST {PUBLIC_API_URL}/payments/stripe/webhook`, events:
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
   `checkout.session.async_payment_failed`, `checkout.session.expired`,
   `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.processing`,
   `payment_intent.canceled`, `payment_intent.requires_action`, `charge.refunded`,
   `refund.created`, `refund.updated`, `refund.failed`,
   `customer.subscription.created|updated|deleted`, `invoice.paid`, `invoice.payment_failed`.
5. Each company collecting with its own Stripe account: `PUT /payments/stripe/settings` with
   `secret_key`, `publishable_key`, `webhook_secret`, `is_enabled: true`; create a webhook in
   *their* Stripe account pointing at the returned `webhook_url` (same events, minus
   subscription/invoice). Or set `use_platform_account: true` to collect via the platform.
6. Optional: set `bank_account_id` (a bank account linked to a GL account) so Stripe receipts
   post to your Stripe clearing/bank account instead of the default bank account (1200).
7. Frontend routes used for Checkout return / links: `{FRONTEND_URL}/invoices/:id`,
   `{PORTAL}/portal/invoices/:id`, `{FRONTEND_URL}/billing/invoices/:id`,
   `{FRONTEND_URL}/billing/subscription`, `{PORTAL}/pay/:token` — each receives
   `?payment=success&session_id=…` or `?payment=cancelled`; call the matching
   status endpoint (with `sync=true` where available) rather than trusting the redirect.

## Security

- Webhook: `Stripe-Signature` verified over the raw body (`rawBody: true` in `main.ts`);
  events stored with a unique `(account_ref, stripe_event_id)` and claimed atomically;
  failures are recorded and return 5xx so Stripe retries; `POST /platform/billing/webhook-events/:id/replay`.
- A tenant's own endpoint can only affect that tenant (metadata must match the endpoint's
  tenant); attempts must belong to the Stripe account the event came from; Stripe's
  amount/currency must equal the ERP attempt or nothing is posted.
- Amounts always come from the ERP (`balance_due`); partial amounts only when the company
  enables them, capped at the balance. Money uses `Decimal` → integer minor units.
- Duplicate accounting guarded three ways: attempt row lock + posting claim, `payment_id`
  unique link, and a partial unique index on `payments(tenant_id, reference_number)` for
  live `STRIPE:%` / `PROOF:%` references.
- Tenant/customer/vendor identity only from JWTs; every query filters by tenant (and party
  for portals). `payment_transactions`, `payment_refunds`, `stripe_customers` are under RLS.
- Per-tenant Stripe secrets encrypted (AES-256-GCM), write-only in the API. Frontend gets
  publishable keys only. Payment-link tokens are 192-bit, stored as SHA-256, expiring,
  revocable, and never carry an amount. Proof uploads: PDF/JPEG/PNG/WebP, 8 MB, stored via
  `StorageService` (S3/R2), never in Postgres.

## Limitations / follow-ups

- No Stripe Connect: paying vendors online is out of scope; vendor payments stay manual
  (bank transfer/cheque + proof) through the existing AP flow.
- Platform invoices are platform receivables; they are not auto-booked as purchase invoices
  in the tenant's own ledger.
- Tenant suspension on unpaid subscriptions is left to the Super Admin (status is synced,
  tenants are only auto-promoted to ACTIVE).
- Frontend (ERP, portal, pay page) is a separate project; this repo exposes the APIs above.

## Known risks and how they are handled

| # | Risk | Status | How |
|---|---|---|---|
| 1 | Stripe fees / net payouts don't match the bank | **Handled** | Fee read from Stripe's balance transaction per payment. Set `fee_gl_account_id` in payment settings → journal `STRIPE-FEE:<pi>` (Dr fees / Cr the receipt's bank account), so the account nets to Stripe's payout. Point `bank_account_id` at a "Stripe clearing" account and transfer payouts to the real bank. Fees settled in another currency are recorded only. |
| 2 | Chargebacks / disputes | **Handled** | `charge.dispute.*` webhooks: opened → attempt `DISPUTED` (refunds blocked) + finance alert with the evidence deadline; won → back to `PAID`; lost → ERP receipt reversed exactly like a refund (idempotent `dispute:<id>` key), invoice reopens. Platform payments follow the same rules. |
| 3 | Refund reverses an already bank-reconciled voucher | **Handled (alert)** | Refund still posts (the reversal is a new unreconciled entry matching the bank withdrawal); finance gets a `PAYMENT_ACTION_REQUIRED` alert naming the voucher. |
| 4 | Overpayment (balance dropped before the customer paid) | **Handled (alert)** | Excess is posted on account; finance is alerted with the amount and receipt to allocate or refund. |
| 5 | Staff cancelled a Stripe receipt by hand, then a refund arrives | **Handled** | Net amount is not re-posted; finance is alerted. |
| 6 | Missed / misconfigured webhooks → paid but not recorded | **Handled** | Reconciliation job every 15 min re-reads stale attempts from Stripe, retries ERP posting, fee journals and refund accounting, and replays FAILED webhook events (max 5). Manual: `POST /platform/billing/reconcile`, `POST /payments/stripe/reconcile`. Disable with `PAYMENT_RECONCILE_ENABLED=false`. |
| 7 | Webhook endpoint on a different Stripe API version | **Handled (warning)** | Mismatch logged once per version; SDK version shown in `GET /platform/billing/stripe/status`. Code reads both old/new subscription & invoice shapes. |
| 8 | Slow responses get the webhook endpoint disabled | **Handled** | Receipt email and fee lookup run after the response path. |
| 9 | Encryption key rotation breaks stored keys | **Handled** | Production requires a dedicated `PAYMENT_GATEWAY_ENCRYPTION_KEY` (no fallback to the 2FA key); undecryptable keys return a clear "re-enter your Stripe keys" error. |
| 10 | Existing tenants lack the new permissions | Ops | Run `POST /tenants/sync-permissions`; users log in again (permissions live in the JWT). |
| 11 | Frontend links / redirects point to the wrong host | **Handled (config check)** | No fallback to `APP_URL` (the API host); falls back to the first `CORS_ORIGINS` entry. Missing `FRONTEND_URL` is reported at startup and in the readiness report. The frontend must implement `/pay/:token`, `/portal/invoices/:id`, `/invoices/:id`, `/billing/invoices/:id`, `/billing/subscription`. |
| 12 | Amount below Stripe's minimum / unsupported currency | **Handled** | Minimums for common currencies checked before Stripe is called, with a clear message. |
| 13 | Platform collecting tenants' customer money (compliance) | **Handled (guarded)** | Only the Super Admin can enable `use_platform_account` (`PUT /platform/tenants/:id/payment-gateway`); tenants get 403. |
| 14 | DB role must bypass RLS (existing auth design) | Ops | Unchanged; RLS on the new tables is defence in depth. |
| 15 | Migration prerequisites | Ops | PostgreSQL ≥ 12; partial unique index needs no duplicate live `STRIPE:%`/`PROOF:%` references (none expected). |

Health check: `GET /platform/billing/stripe/status` returns `ready`, a `problems` list (missing keys,
FRONTEND_URL, encryption key, gateways without webhook secret, failed webhooks in 24h, stuck
platform payments), the last processed webhook time and the SDK API version.

Still not covered: Stripe Connect / paying vendors online; posting Stripe **payout** transfers
automatically (fees are posted; moving the payout from the clearing account to the bank is a
normal bank transfer entry).
