# Email setup — Gmail on local + Render

## Why Render returns `503 Connection timeout`

[Render free web services block outbound SMTP](https://render.com/changelog/free-web-services-will-no-longer-allow-outbound-traffic-to-smtp-ports) on ports **25 / 465 / 587**.

So this always fails on free Render, even with a perfect Gmail App Password:

```text
Email delivery failed: Connection timeout
```

`GET /health` will show `provider: "smtp"`, `smtp_reachable: false`, and `last_verify_error` with the timeout.

**Fix (pick one):**

| Option | Works on Render free? | Keeps Gmail From? |
|--------|----------------------|-------------------|
| **A. `EMAIL_PROVIDER=gmail_api`** (HTTPS Gmail API + OAuth) | Yes | Yes |
| **B. `EMAIL_PROVIDER=resend`** (HTTPS Resend API) | Yes | Needs verified Resend domain / `RESEND_FROM` |
| **C. Upgrade Render to paid** + keep SMTP | Yes (SMTP allowed) | Yes |

---

## Option A — Gmail API (recommended for your Gmail mailbox)

### 1. Google Cloud (once)

1. [Google Cloud Console](https://console.cloud.google.com/) → create/select project  
2. Enable **Gmail API**  
3. **APIs & Services → Credentials → Create OAuth client ID**  
   - Application type: **Desktop app** (or Web with redirect `http://127.0.0.1:53682/oauth2callback`)  
4. OAuth consent screen: External → add `kingfisherwingserp@gmail.com` as test user  
5. Copy **Client ID** and **Client Secret**

### 2. Get refresh token (local machine)

```bash
set GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
set GMAIL_CLIENT_SECRET=your-secret
node scripts/gmail-oauth-setup.cjs
```

Sign in as `kingfisherwingserp@gmail.com`, allow send mail. Terminal prints `GMAIL_REFRESH_TOKEN=...`.

### 3. Render → Environment

```env
EMAIL_PROVIDER=gmail_api
GMAIL_CLIENT_ID=...
GMAIL_CLIENT_SECRET=...
GMAIL_REFRESH_TOKEN=...
GMAIL_USER=kingfisherwingserp@gmail.com
SMTP_FROM_NAME=KingFisher Wings
SMTP_FROM_EMAIL=kingfisherwingserp@gmail.com
SMTP_FROM="KingFisher Wings <kingfisherwingserp@gmail.com>"
```

Redeploy. Health should show `"provider":"gmail_api"` and `configured: true` (no SMTP timeout).

---

## Option B — Resend HTTPS

1. Create API key at [resend.com](https://resend.com)  
2. Verify a domain (or use `beth.t@example.com` for smoke tests only)

```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_...
RESEND_FROM=KingFisher Wings <beth.t@example.com>
```

---

## Option C — Local / paid Render SMTP (App Password)

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=kingfisherwingserp@gmail.com
SMTP_PASS=<gmail-app-password>
SMTP_FROM_NAME=KingFisher Wings
SMTP_FROM_EMAIL=kingfisherwingserp@gmail.com
```

`EMAIL_PROVIDER=auto` (default) picks `gmail_api` if OAuth env is present, else `resend` if `RESEND_API_KEY` is set, else `smtp`.

Restart Nest after `.env` changes (watch mode does not reload env).

---

## Confirm

1. `GET https://kingfisherwings-backend.onrender.com/health`  
   - `smtp.provider` = `gmail_api` or `resend`  
   - `smtp.configured` = `true`  
   - `last_verify_error` = `null`  
2. Send invoice/quotation share from UI or Swagger — expect **200**, not 503.

## Share endpoints

Staff: invoices / quotations / AR·AP statement / remittance / credit summary.  
Vendor→admin: invoice / payment-proof / dispute / remittance.  
Share uses `requireDelivery: true` (real 503 on failure).
