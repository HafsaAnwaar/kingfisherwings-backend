# Email setup — Gmail (kingfisherwings@gmail.com)

KingFisher Wings uses **Gmail SMTP** with an App Password for outbound document share emails (invoices, statements, remittance, vendor→admin shares).

## 1. Create / prepare the mailbox

1. Create or sign in to Google account: **`kingfisherwings@gmail.com`**.
2. Enable **2-Step Verification** (Google Account → Security).
3. Create an **App Password**: Security → App passwords → Mail → generate.
4. Copy the 16-character password into `SMTP_PASS` (never commit it to git).

## 2. Environment variables

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=kingfisherwings@gmail.com
SMTP_PASS=<gmail-app-password>
SMTP_FROM_NAME=KingFisher Wings
SMTP_FROM_EMAIL=kingfisherwings@gmail.com
SMTP_FROM="KingFisher Wings <kingfisherwings@gmail.com>"
VENDOR_NOTIFY_EMAIL=   # optional override for vendor→admin default inbox
```

`smtp.config.ts` builds `From` from `SMTP_FROM_NAME` + `SMTP_FROM_EMAIL` when `SMTP_FROM` is empty.

## 3. Smoke checklist

With SMTP configured and app restarted:

1. `POST /invoices/:id/send` `{ "to_email": "you@example.com" }` — PDF attached, real inbox delivery.
2. `POST /quotations/:id/send-email` — same.
3. `POST /gl/ar/statement/:partyId/send-email` — AR statement PDF.
4. `POST /gl/ap/statement/:partyId/send-email` — AP statement PDF.
5. `POST /gl/payments/:id/remittance/send-email` — remittance to vendor.
6. `POST /parties/:id/credit/summary/send-email` — credit summary.
7. Vendor JWT: `POST /vendor/invoices/:id/send-email` — arrives at tenant admin / `VENDOR_NOTIFY_EMAIL`.
8. Misconfigured SMTP → share endpoints return **503** (not fake success).

## 4. Share endpoints (summary)

### Staff → customer / vendor

| Method | Path |
|--------|------|
| POST | `/invoices/:id/send` |
| POST | `/quotations/:id/send-email` |
| POST | `/gl/ar/statement/:partyId/send-email` |
| POST | `/gl/ap/statement/:partyId/send-email` |
| POST | `/gl/payments/:id/remittance/send-email` |
| POST | `/parties/:id/credit/summary/send-email` |

### Vendor → admin

| Method | Path |
|--------|------|
| POST | `/vendor/invoices/:id/send-email` |
| POST | `/vendor/invoices/:id/payment-proofs/:proofId/send-email` |
| POST | `/vendor/disputes/:id/send-email` |
| POST | `/vendor/payments/:id/remittance/send-email` |

Body (share DTO): `{ "to": [], "cc": [], "message": "", "include_pdf": true }` — if `to` omitted, recipients are resolved from party contacts or tenant admin emails.

## 5. Notes

- Document share calls use `requireDelivery: true` (fail loudly without SMTP).
- Optional alerts without `requireDelivery` may still log-only when SMTP is off.
- PDF download APIs are unchanged; share is additive.
- Vendor shares are rate-limited to **20/hour** per vendor user.
