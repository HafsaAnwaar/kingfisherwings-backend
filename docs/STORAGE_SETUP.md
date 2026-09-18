# Durable file storage setup (Cloudflare R2 recommended)

## Why this matters

On **Render**, the container disk is **ephemeral**. Files under `/app/storage` are wiped on every redeploy/restart.

That breaks:

- Invoice / quotation PDFs
- Report catalog downloads
- Payment proofs
- Documentation uploads
- HR letters / payroll PDFs

**Object storage** keeps file **bytes** in a bucket. Postgres only stores keys/URLs/metadata.

| Option | Fit for KingFisher |
|--------|---------------------|
| **Cloudflare R2** | **Best** — S3 API (already in the app), cheap, **no egress fees** |
| AWS S3 | Fine if you already live in AWS |
| Supabase Storage | OK if you already use Supabase (S3-compatible API) |
| Cloudinary | Poor fit for PDF reports |
| Local folder / Render disk | Avoid (ephemeral) unless you pay for a persistent disk |
| Files in Postgres | Avoid — bloated DB |

This app already speaks the **S3 API**. R2 / S3 / Supabase all work through the same `StorageService`.

---

## Part 1 — Create Cloudflare R2 (step by step)

### 1.1 Account

1. Open [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Sign in (or create an account).
3. Note: R2 has a free tier; you need R2 enabled on the account (Dashboard → **R2**).

### 1.2 Create a bucket

1. Left sidebar → **R2 Object Storage** → **Overview**.
2. Click **Create bucket**.
3. **Bucket name:** e.g. `kingfisher-files`  
   - Lowercase, numbers, hyphens only.  
   - Globally unique within your account naming rules.
4. **Location:** leave default (automatic) unless you have a compliance need.
5. Create the bucket.

Keep the bucket **private** (default). The app downloads via:

- API route `/reports/jobs/:id/download` (and similar), and/or  
- Short-lived **presigned URLs** generated with your R2 API keys  

You do **not** need a public bucket for normal ERP use.

### 1.3 Find your Account ID

1. R2 Overview (or any Cloudflare page right sidebar / account home).
2. Copy **Account ID** (32-character hex).  
   This becomes `R2_ACCOUNT_ID`.

The S3 endpoint the app builds is:

```text
https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com
```

### 1.4 Create an R2 API token

1. R2 → **Manage R2 API Tokens** (or Account → **Manage Account** → **API Tokens** → R2 token flow).
2. **Create API token**.
3. Permissions:
   - **Object Read & Write** on the bucket `kingfisher-files`  
     (or “All buckets” if you prefer one token for staging + prod — less ideal).
4. Optionally restrict by IP (usually skip for Render).
5. Create → **copy immediately**:
   - **Access Key ID** → `R2_ACCESS_KEY_ID`
   - **Secret Access Key** → `R2_SECRET_ACCESS_KEY` (shown once)

If you lose the secret, create a new token and update Render.

### 1.5 (Optional) Custom domain / public CDN

Only if you want browser-direct links like `https://files.yourdomain.com/...`:

1. R2 bucket → **Settings** → **Custom Domains** (or Cloudflare public bucket URL).
2. Attach a domain you control.
3. Set in Render:

```env
R2_PUBLIC_BASE_URL=https://files.yourdomain.com
```

**Not required** for reports/invoices — the app works with private buckets + app download routes / presigned URLs.

---

## Part 2 — Configure Render (production)

### 2.1 Open your web service

1. [Render Dashboard](https://dashboard.render.com/) → your **KingFisher** web service.
2. **Environment** → **Environment Variables**.

### 2.2 Add these variables

| Key | Example / value | Required |
|-----|-----------------|----------|
| `STORAGE_PROVIDER` | `r2` | Yes |
| `R2_ACCOUNT_ID` | Cloudflare Account ID | Yes |
| `R2_ACCESS_KEY_ID` | R2 token Access Key ID | Yes |
| `R2_SECRET_ACCESS_KEY` | R2 token Secret | Yes |
| `R2_BUCKET` | `kingfisher-files` | Yes |
| `R2_PUBLIC_BASE_URL` | `https://files.yourdomain.com` | Optional |
| `R2_REGION` | `auto` (default) | Optional |
| `STORAGE_PRESIGNED_URL_EXPIRES` | `3600` (seconds) | Optional |

Example block to paste (fill secrets yourself):

```env
STORAGE_PROVIDER=r2
R2_ACCOUNT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
R2_ACCESS_KEY_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
R2_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
R2_BUCKET=kingfisher-files
```

**Aliases also accepted** by the app (same meaning):

- `STORAGE_ACCESS_KEY_ID` / `AWS_ACCESS_KEY_ID`
- `STORAGE_SECRET_ACCESS_KEY` / `AWS_SECRET_ACCESS_KEY`
- `STORAGE_BUCKET` / `AWS_S3_BUCKET`

Prefer the `R2_*` names for clarity.

### 2.3 Leave local path alone (or keep for fallback)

These can remain for local fallback if R2 creds are incomplete (app falls back to **local**):

```env
STORAGE_PATH=/app/storage/uploads
STORAGE_PUBLIC_BASE_URL=/files
```

When R2 is correctly configured, durable object storage is used instead of disk.

### 2.4 Save and redeploy

1. Save environment changes.
2. **Manual Deploy** → **Deploy latest commit** (or wait for auto-deploy).
3. Wait until the service is **Live**.

---

## Part 3 — Verify it worked

### 3.1 Boot logs (Render → Logs)

Look for:

```text
Storage: durable provider=r2 bucket=kingfisher-files endpoint=https://....r2.cloudflarestorage.com
Storage: bucket reachable (kingfisher-files)
```

You should **not** see the ephemeral / local-disk warning.

If you see **bucket not reachable**:

- Wrong Account ID / bucket name
- Token lacks Read & Write on that bucket
- Typo in secret (recreate token)

### 3.2 Health endpoint

```http
GET https://<your-render-host>/health
```

Expect JSON similar to:

```json
{
  "success": true,
  "storage": {
    "provider": "r2",
    "durable": true,
    "bucket": "kingfisher-files",
    "region": "auto",
    "endpoint": "https://<account_id>.r2.cloudflarestorage.com",
    "local_root": null
  }
}
```

**Success = `storage.durable: true`.**

If `durable: false` and `provider: "local"`, credentials are incomplete — the app intentionally falls back to disk.

### 3.3 Functional smoke

1. Generate any invoice PDF or catalog report.
2. Confirm download works after a minute.
3. In Cloudflare R2 → bucket → **Objects**, you should see keys under a tenant-prefixed path.
4. Redeploy the Render service once → old R2 files should **still** download (that is the whole point).

### 3.4 Regenerate old files

Anything created **before** R2 was enabled lived on ephemeral disk and is **already gone**.

- Regenerate invoice PDFs / reports after switching.
- Payment proofs uploaded before R2 cannot be recovered from disk.

---

## Part 4 — Local development

For laptop/dev you can keep local disk:

```env
STORAGE_PROVIDER=local
# or omit STORAGE_PROVIDER and leave R2_* empty
STORAGE_PATH=./storage/uploads
```

Or point local `.env` at a **dev** R2 bucket (recommended if you test uploads often):

```env
STORAGE_PROVIDER=r2
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=kingfisher-files-dev
```

Never commit secrets to git.

---

## Part 5 — Alternatives (same app code)

### B) AWS S3

```env
STORAGE_PROVIDER=s3
STORAGE_USE_S3=true
AWS_REGION=me-south-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=kingfisher-files
```

Create an IAM user with `s3:PutObject`, `s3:GetObject`, `s3:HeadBucket` (and List if needed) on that bucket.

### C) Supabase Storage (S3-compatible)

1. Supabase project → Storage → create bucket `kingfisher-files`.
2. Enable **S3 access** / create S3 keys in Supabase Storage settings.
3. Env:

```env
STORAGE_PROVIDER=supabase
STORAGE_S3_ENDPOINT=https://<project-ref>.storage.supabase.co/storage/v1/s3
STORAGE_ACCESS_KEY_ID=...
STORAGE_SECRET_ACCESS_KEY=...
STORAGE_BUCKET=kingfisher-files
STORAGE_REGION=us-east-1
STORAGE_FORCE_PATH_STYLE=true
```

---

## Part 6 — How the app uses storage (mental model)

```text
Feature (invoice PDF / report / proof)
        │
        ▼
  StorageService.saveBuffer(tenantId, bytes, filename)
        │
        ├── durable (R2/S3/Supabase) → PutObject → s3Key + URL
        └── local → write under STORAGE_PATH (lost on Render redeploy)
        │
        ▼
  Postgres stores file_url / s3_key / metadata only
```

Code: `src/config/storage.config.ts`, `src/shared/storage/storage.service.ts`.  
Health: `GET /health` → `storage` object.

---

## Part 7 — Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `storage.durable: false` | Missing any of Account ID / keys / bucket / `STORAGE_PROVIDER=r2` | Fill all four R2 vars + provider; redeploy |
| Boot: bucket not reachable | Bad secret, wrong bucket name, token scope | New API token; confirm bucket name |
| Report download 404 after redeploy | Still on local disk | Enable R2; regenerate report |
| Works locally, fails on Render | Env vars only in local `.env` | Add same vars in Render Environment |
| AccessDenied from S3 client | Token read-only or wrong bucket | Object Read & Write on that bucket |
| App still says `provider: local` | Incomplete creds → intentional fallback | Check all required env names (no typos) |

---

## Part 8 — Security checklist

- [ ] Bucket stays **private**
- [ ] R2 API token scoped to this bucket when possible
- [ ] Secrets only in Render env (not in GitHub, not in chat logs)
- [ ] Rotate token if it was ever pasted into a ticket/chat
- [ ] Separate `kingfisher-files-dev` vs `kingfisher-files` buckets if multiple environments
- [ ] Do not make the whole bucket public “to fix downloads” — use app routes / presigned URLs

---

## Quick checklist (copy)

1. Cloudflare → R2 → create bucket `kingfisher-files`  
2. Create R2 API token (Object Read & Write) → copy Access Key + Secret  
3. Copy Account ID  
4. Render → Environment → set `STORAGE_PROVIDER`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`  
5. Redeploy  
6. Logs: `Storage: durable provider=r2` + `bucket reachable`  
7. `GET /health` → `storage.durable: true`  
8. Regenerate any PDFs/reports created before the switch  

Canonical file in repo: [`docs/STORAGE_SETUP.md`](./STORAGE_SETUP.md) (this document).
