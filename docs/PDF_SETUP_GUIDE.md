# PDF / Chromium Setup Guide

KingFisher Wings generates PDFs (quotations, HAWB/MAWB, invoices, BLs) with **Puppeteer + Chromium**.  
If Chromium is missing or misconfigured, PDF endpoints return **503** (or previously **500**).

This guide covers **local Windows**, **Docker/Render**, and **env vars**.

---

## What the code expects

| Variable | Purpose | Example |
|----------|---------|---------|
| `PUPPETEER_EXECUTABLE_PATH` | Absolute path to Chromium/Chrome | `/usr/bin/chromium` or `C:\Program Files\Google\Chrome\Application\chrome.exe` |
| `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD` | Skip Puppeteer’s bundled download (use system Chrome) | `true` |
| `PUPPETEER_TIMEOUT` | Page load timeout (ms) | `30000` |
| `STORAGE_PATH` | Where PDFs are saved locally | `./storage/uploads` |
| `STORAGE_PUBLIC_BASE_URL` | Public URL prefix for downloads | `/files` |
| `STORAGE_USE_S3` | Use S3 instead of disk | `true` / `false` |

`PdfService` also auto-detects common Linux paths if the env var is unset:
- `/usr/bin/chromium`
- `/usr/bin/chromium-browser`
- `/usr/bin/google-chrome`
- `/usr/bin/google-chrome-stable`

---

## 1. Local development (Windows)

### Option A — Use installed Google Chrome (recommended)

1. Install [Google Chrome](https://www.google.com/chrome/) if not already installed.
2. Add to `.env`:

```env
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe
PUPPETEER_TIMEOUT=30000
STORAGE_PATH=./storage/uploads
STORAGE_PUBLIC_BASE_URL=/files
STORAGE_USE_S3=false
```

3. Restart the API:

```powershell
npm run start:dev
```

4. Verify:

```powershell
# After auth + creating a quotation, call:
# POST /quotations/{id}/pdf
# POST /invoices/{id}/pdf
```

### Option B — Let Puppeteer download Chromium

```env
# Leave PUPPETEER_EXECUTABLE_PATH unset
# Leave PUPPETEER_SKIP_CHROMIUM_DOWNLOAD unset or false
```

Then:

```powershell
npx puppeteer browsers install chrome
npm run start:dev
```

---

## 2. Docker / Render (production)

The repo `Dockerfile` already:

- Installs Alpine **chromium** + fonts
- Sets `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true`
- Sets `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium`
- Creates `/app/storage/uploads`
- Runs `node dist/src/main.js`

### Render Dashboard checklist

1. **Deploy** from this Dockerfile (Docker runtime), not a plain Node build that skips Chromium.
2. In **Environment**, set (or confirm):

```env
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
PUPPETEER_TIMEOUT=60000
STORAGE_PATH=/app/storage/uploads
STORAGE_PUBLIC_BASE_URL=/files
NODE_OPTIONS=--max-old-space-size=1024
```

3. If you use **S3** for files (recommended on Render — ephemeral disk):

```env
STORAGE_USE_S3=true
AWS_REGION=me-south-1
AWS_S3_BUCKET=your-bucket
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

4. Optional email for invoice send:

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM_EMAIL=noreply@yourdomain.com
SMTP_FROM_NAME=KingFisher Wings
```

5. After deploy, hit:

- `POST /quotations/{id}/pdf`
- `POST /jobs/{id}/documents/hawb`
- `POST /invoices/{id}/pdf`

Success → `2xx` with file metadata.  
Failure → `503` with a message pointing at Chromium (not a silent 500).

### If Chromium still fails on Render

- Confirm the service uses the **Dockerfile** (not `npm run build` only).
- In a Render shell: `ls -la /usr/bin/chromium*`
- If only `chromium-browser` exists, set:

```env
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

- Increase instance memory (PDF + Chromium needs ≥512MB; 1GB preferred).
- Prefer async PDF via the existing Bull queue under load.

---

## 3. Quick smoke test (any environment)

```bash
# 1) Login → get token
# 2) Create/post an invoice
# 3) Generate PDF
curl -X POST "https://YOUR_HOST/invoices/INVOICE_UUID/pdf" \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{}"
```

Expected:

- **200/201** — PDF generated and stored  
- **503** — Chromium not configured (follow this guide)  
- **401** — bad/missing token  

---

## 4. Related API behaviour after these fixes

| Endpoint | Behaviour |
|----------|-----------|
| `POST /quotations/{id}/pdf` | Uses hardened Puppeteer launch |
| `POST /jobs/{id}/documents/hawb` (and other docs) | Same PDF pipeline |
| `POST /invoices/{id}/pdf` | Same; clear 503 if Chromium missing |
| `POST /invoices/{id}/send` | Still sends email if PDF fails; response includes `pdf_warning` |
| `POST /credit-notes` | Auto number format + default company |
| `POST /purchase-invoices` | Auto number format + default company |

---

## 5. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `fetch failed` / timeout on PDF | Chromium hang or cold start | Raise `PUPPETEER_TIMEOUT`, use Docker image with Chromium, more RAM |
| `Could not find browser` | Wrong/missing executable | Set `PUPPETEER_EXECUTABLE_PATH` |
| PDF works locally, fails on Render | Render not using Dockerfile | Switch to Docker deploy |
| Email send fails | SMTP not set | Configure SMTP_* vars |
| Files disappear after redeploy | Ephemeral disk | Enable `STORAGE_USE_S3=true` |

---

## 6. Deploy command reminder

```bash
# After pulling these fixes
git add -A
git commit -m "fix: PDF Chromium setup, credit/purchase invoices, live test suite"
git push   # triggers Render rebuild if connected
```

Then re-run the live suite:

```powershell
$env:BASE_URL="https://kingfisherwings.onrender.com"
node scripts/live-api-test-suite.cjs
```
