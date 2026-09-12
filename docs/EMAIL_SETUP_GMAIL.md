# Email setup — Gmail SMTP

KingFisher Wings sends document-share emails (invoices, statements, remittance, vendor→admin) via **Gmail SMTP + App Password**.

## 1. Create App Password

1. Sign in to the mailbox (e.g. `kingfisherwingserp@gmail.com`).
2. Enable **2-Step Verification**.
3. Google Account → Security → **App passwords** → Mail → generate.
4. Paste the 16-character password into `SMTP_PASS` (spaces are OK; backend strips them).

## 2. Environment variables

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=kingfisherwingserp@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
SMTP_FROM_NAME=KingFisher Wings
SMTP_FROM_EMAIL=kingfisherwingserp@gmail.com
SMTP_FROM="KingFisher Wings <kingfisherwingserp@gmail.com>"
VENDOR_NOTIFY_EMAIL=
# Optional timeouts (ms)
SMTP_CONNECTION_TIMEOUT_MS=20000
SMTP_GREETING_TIMEOUT_MS=20000
SMTP_SOCKET_TIMEOUT_MS=60000
```

**Do not** put the mailbox address in `SMTP_HOST` — that must stay `smtp.gmail.com` (wrong host → `queryA EBADNAME`).

| Port | `SMTP_SECURE` | Notes |
|------|---------------|--------|
| **587** | `false` | STARTTLS — **recommended** (local + Render) |
| **465** | `true` | Implicit TLS |
| **25** | — | **Blocked** on Render / most clouds — backend auto-rewrites to 587 |

Restart the API after changing `.env` (`nest start --watch` does **not** reload env).

## 3. Confirm

1. Boot log: `SMTP ready (smtp.gmail.com:587 → …)`.
2. `GET /health` → `smtp.configured: true`, `last_verify_error: null`.
3. Send a share email from the UI or `POST /invoices/:id/send`.

## 4. If FE shows “Connection timeout”

| Cause | Fix |
|-------|-----|
| API pointing at Render free / blocked egress | Test against **local** API first; on Render use 587/465 (not 25). Some hosts block SMTP — use a relay (SendGrid/Resend SMTP) over allowed ports |
| `SMTP_HOST` = email address | Set `SMTP_HOST=smtp.gmail.com` |
| Wrong / normal password | Use **App Password** only |
| Env not reloaded | Restart Nest after `.env` change |
| Spaces / bad `SMTP_pass` casing | Use `SMTP_PASS`; spaces are stripped automatically |

## 5. Share endpoints

Staff: invoices / quotations / AR·AP statement / remittance / credit summary `…/send-email`.  
Vendor→admin: invoice / payment-proof / dispute / remittance share.  
Share calls use `requireDelivery: true` (503 on SMTP failure, not silent success).
