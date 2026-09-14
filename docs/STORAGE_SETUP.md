# Durable file storage (Render)

Render’s container disk is **ephemeral** — anything under `/app/storage` is wiped on redeploy.  
PDFs, payment proofs, and report downloads must use **object storage**.

## Recommendation

| Option | Verdict |
|--------|---------|
| **Cloudflare R2** | **Best fit** — S3 API, free tier, no egress fees, works with existing AWS SDK |
| AWS S3 | Solid; already supported |
| Supabase Storage | Fine if you already use Supabase (S3-compatible endpoint) |
| Cloudinary | Better for images; awkward for PDF reports |
| DB BLOBs | Avoid — large PDFs bloat Postgres |
| Local folder / Render disk | Only with a **paid persistent disk** mount |

This app uses the **S3 API** for R2, AWS S3, and Supabase Storage.

---

## Option A — Cloudflare R2 (recommended)

1. Cloudflare Dashboard → **R2** → Create bucket (e.g. `kingfisher-files`)
2. **Manage R2 API Tokens** → Create API token (Object Read & Write)
3. Copy **Access Key ID**, **Secret Access Key**, **Account ID**

### Render Environment

```env
STORAGE_PROVIDER=r2
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=kingfisher-files
# optional public CDN/custom domain for direct links:
# R2_PUBLIC_BASE_URL=https://files.yourdomain.com
```

Aliases also accepted: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`, `STORAGE_*`.

Redeploy. Boot log should show:

```text
Storage: durable provider=r2 bucket=kingfisher-files ...
Storage: bucket reachable (...)
```

(No ephemeral warning.)

---

## Option B — AWS S3

```env
STORAGE_PROVIDER=s3
STORAGE_USE_S3=true
AWS_REGION=me-south-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=kingfisher-files
```

---

## Option C — Supabase Storage (S3-compatible)

Enable S3 access in Supabase Storage settings, then:

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

## Health check

`GET /health` → `storage.durable: true` when object storage is active.

## Notes

- Metadata (keys/URLs) stays in Postgres; **file bytes** live in the bucket.
- After enabling R2/S3, **regenerate** old reports — files created on local disk before this change are gone.
- Local `STORAGE_PATH` remains fine for **development only**.
