# Job Dimension tab

Fresa: [Upload dimensions under a job](https://blog.fresatechnologies.com/how-to-upload-dimensions-under-a-job-in-the-fresa-application/)

## Grid columns

line_no, length, width, height, no_of_pcs, g_weight, v_weight, n_weight, total_weight, volume, commodity, commodity_description, remarks

## Full edit fields

All grid fields plus: length_unit, package_type, weight units, volume_unit, hs_code, dimension_type, COD, total_inner_city, quantity, currency_code, goods_value, container_no, total_value

Auto-calc: volume (CBM), v_weight using tenant `volumetric_divisor_cm` (default 6000), total_weight (g_weight × pcs). Auto-links `container_no` → job container when matched.

Tenant setting: `GET/PATCH /organization/settings/dimensions` (`volumetric_divisor_cm`).

Sync to cargo: `POST /jobs/:id/dimensions/sync-to-cargo` or `sync_to_cargo: true` on add/update/bulk. Links via `synced_cargo_id`.

## Routes

| Method | Path |
|--------|------|
| GET | `/jobs/:id/detail/dimensions` |
| GET/POST | `/jobs/:id/dimensions` |
| PATCH/DELETE | `/jobs/:id/dimensions/:lineId` |
| PUT | `/jobs/:id/dimensions/bulk` |
| GET | `/jobs/:id/dimensions/upload-sample` |
| GET | `/jobs/:id/dimensions/export` |
| POST | `/jobs/:id/dimensions/upload?confirm=&replace_all=` |
| POST | `/jobs/:id/dimensions/upload/paste` |
| POST | `/jobs/:id/dimensions/upload/confirm` |
| POST | `/jobs/:id/dimensions/sync-to-cargo` |
| PATCH | `/jobs/:id/dimensions` (legacy header commodity/hs only) |

Upload accepts `.xlsx`, `.xls`, `.csv`, `.txt`, or pasted EDI (`L\|W\|H\|PCS\|GWT\|UNIT…`).
