# Email setup — Hostinger, Gmail, Resend, Render

## Why send fails with `Greeting never received` / `Connection timeout`

Two different problems look the same in the UI:

| Cause | Typical host | Fix |
|--------|----------------|-----|
| **Wrong SSL for port 465** (`SMTP_SECURE=false`) | Local + Hostinger | Set `SMTP_PORT=465` and `SMTP_SECURE=true` (code also auto-corrects this) |
| **Render free blocks SMTP** (25 / 465 / 587) | Render free | Use `EMAIL_PROVIDER=resend` or `gmail_api` (HTTPS) — SMTP cannot work on free tier |
| Bad mailbox password | Any | Fix `SMTP_USER` / `SMTP_PASS` (Hostinger = full mailbox + mailbox password) |

`GET /health` can show `smtp.configured: true` and still fail on send (PDF + mail under load, or blocked ports). Trust send errors and `last_verify_error`, not configured alone.

**Code hardening (deploy this build):**

- Port **465** forces SSL; port **587** forces STARTTLS
- Default SMTP timeouts raised (45s / 45s / 90s)
- One automatic retry after transient greeting / `ETIMEDOUT` errors
- Clearer 503 messages pointing at Render vs Hostinger misconfig

---

## Option A — Hostinger SMTP (local / VPS / **paid** Render)

Works when the host allows outbound SMTP.

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=inquiry@yourdomain.com
SMTP_PASS=<mailbox-password>
SMTP_FROM_NAME=KingFisher Tech
SMTP_FROM_EMAIL=inquiry@yourdomain.com
SMTP_FROM="KingFisher Tech <inquiry@yourdomain.com>"
SMTP_CONNECTION_TIMEOUT_MS=45000
SMTP_GREETING_TIMEOUT_MS=45000
SMTP_SOCKET_TIMEOUT_MS=90000
```

Alternate: `SMTP_PORT=587` + `SMTP_SECURE=false` (STARTTLS).

Restart Nest after `.env` changes (watch mode does not reload env).

---

## Option B — Resend HTTPS (recommended on **Render free**)

Keep your Hostinger address as the From (after verifying the domain in Resend).

1. Create API key at [resend.com](https://resend.com)
2. Verify `kingfishertec.com` (or your domain) DNS in Resend
3. Render → Environment:

```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_...
RESEND_FROM="KingFisher Tech <inquiry@kingfishertec.com>"
SMTP_FROM_NAME=KingFisher Tech
SMTP_FROM_EMAIL=inquiry@kingfishertec.com
```

Redeploy. Health should show `"provider":"resend"` and `configured: true`.

Smoke-only (not production From): `RESEND_FROM=KingFisher Tech <beth.t@example.com>`.

---

## Option C — Gmail API (HTTPS on Render free)

### 1. Google Cloud (once)

1. [Google Cloud Console](https://console.cloud.google.com/) → create/select project  
2. Enable **Gmail API**  
3. **APIs & Services → Credentials → Create OAuth client ID**  
   - Application type: **Desktop app** (or Web with redirect `http://127.0.0.1:53682/oauth2callback`)  
4. OAuth consent screen: External → add your Gmail as test user  
5. Copy **Client ID** and **Client Secret**

### 2. Get refresh token (local machine)

```bash
set GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
set GMAIL_CLIENT_SECRET=your-secret
node scripts/gmail-oauth-setup.cjs
```

Sign in, allow send mail. Terminal prints `GMAIL_REFRESH_TOKEN=...`.

### 3. Render → Environment

```env
EMAIL_PROVIDER=gmail_api
GMAIL_CLIENT_ID=...
GMAIL_CLIENT_SECRET=...
GMAIL_REFRESH_TOKEN=...
GMAIL_USER=you@gmail.com
SMTP_FROM_NAME=KingFisher Wings
SMTP_FROM_EMAIL=you@gmail.com
SMTP_FROM="KingFisher Wings <you@gmail.com>"
```

---

## Option D — Gmail SMTP (local / paid Render only)

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=you@gmail.com
SMTP_PASS=<gmail-app-password>
SMTP_FROM_NAME=KingFisher Wings
SMTP_FROM_EMAIL=you@gmail.com
```

---

## Provider auto-detect

`EMAIL_PROVIDER=auto` (default) picks:

1. `gmail_api` if OAuth env is complete  
2. else `resend` if `RESEND_API_KEY` is set  
3. else `smtp`

On Render free, set `EMAIL_PROVIDER=resend` (or `gmail_api`) explicitly so you never fall through to blocked SMTP.

---

## Confirm after deploy

1. `GET /health`  
   - `smtp.provider` = `resend` | `gmail_api` | `smtp`  
   - `smtp.configured` = `true`  
   - `last_verify_error` = `null` (for SMTP, `smtp_reachable` should be `true`)  
2. Share invoice/quotation from UI or Swagger — expect **200**, not 503.

Share uses `requireDelivery: true` (real 503 on failure).
