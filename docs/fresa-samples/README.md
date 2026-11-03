# Fresa sample references

Visual QA references for catalogue report packs. Source:
[https://fresatechnologies.com/sample-report-formats/](https://fresatechnologies.com/sample-report-formats/)

## Phase 1 samples

| Pack | Sample name | Local file | Status |
|------|-------------|------------|--------|
| `sea.hbl_draft` | HBL Draft | `hbl-draft.pdf` (or `.png`) | Fetch from Fresa sample site when available |
| `air.hawb_draft` | HAWB Draft | `hawb-draft.pdf` | Same |
| `commercial.invoice_tax_india_1` | Invoice Format-1 Tax India | `invoice-format-1-tax-india.pdf` | Same |
| `ops.list_generic` | MY REPORTS XLSX | `my-reports-list.xlsx` | Same |

Binaries are gitignored (or LFS). Record SHA-256 here after download:

```
# checksums — fill after download
# hbl-draft.pdf  <sha256>
# hawb-draft.pdf  <sha256>
# invoice-format-1-tax-india.pdf  <sha256>
# my-reports-list.xlsx  <sha256>
```

If a sample cannot be fetched, mark the pack `blocked_missing_sample` and do **not** activate until a reference exists. Phase-1 packs were rebuilt against known Fresa form geometry (black nested BL/AWB grids, DRAFT watermark, MY REPORTS `#1F4E79` header band) when the public sample site returned 502 during implementation.

## QA checklist

See [QA.md](./QA.md).

## Rule

Templates only swap **identity/logo** slots from tenant branding. Body colors and layout stay Fresa sample chrome — no KingFisher purple/blue theme inside form bodies.
