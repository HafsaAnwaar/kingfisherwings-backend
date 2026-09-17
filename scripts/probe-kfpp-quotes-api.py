#!/usr/bin/env python3
"""Probe KingFisher Wings KFPP Quote Requests API. Key via KFPP_API_KEY env."""
from __future__ import annotations

import json
import os
import ssl
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

BASE = "https://kingfisherwingsgroup.com/wp-json/kfpp/v1/quotes"
KEY = os.environ.get("KFPP_API_KEY") or (sys.argv[1] if len(sys.argv) > 1 else "")
OUT = Path("docs/generated")
OUT.mkdir(parents=True, exist_ok=True)

# Prefer system certs; fall back to unverified only if needed (document if used)
CTX = ssl.create_default_context()


def redact(s: str) -> str:
    return s.replace(KEY, "***REDACTED***") if KEY else s


def req(name: str, method: str, url: str, headers: dict | None = None, body: Any = None) -> dict:
    h = dict(headers or {})
    data = None
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        h.setdefault("Content-Type", "application/json")
    started = time.time()
    status = 0
    raw = ""
    resp_headers: dict[str, str] = {}
    err = None
    try:
        request = urllib.request.Request(url, data=data, headers=h, method=method)
        with urllib.request.urlopen(request, context=CTX, timeout=45) as resp:
            status = resp.status
            raw = resp.read().decode("utf-8", errors="replace")
            resp_headers = {k.lower(): v for k, v in resp.headers.items()}
    except urllib.error.HTTPError as e:
        status = e.code
        raw = e.read().decode("utf-8", errors="replace")
        resp_headers = {k.lower(): v for k, v in (e.headers.items() if e.headers else [])}
        err = f"HTTPError {e.code}"
    except Exception as e:  # noqa: BLE001
        err = str(e)
    body_json = None
    try:
        body_json = json.loads(raw) if raw else None
    except json.JSONDecodeError:
        body_json = None
    return {
        "name": name,
        "method": method,
        "url": redact(url),
        "status": status,
        "elapsed_ms": int((time.time() - started) * 1000),
        "headers": resp_headers,
        "body_raw": redact(raw),
        "body_json": json.loads(redact(json.dumps(body_json))) if body_json is not None else None,
        "error": err,
    }


def summarize_shape(payload: Any) -> dict:
    if payload is None:
        return {"type": "null"}
    if isinstance(payload, list):
        return {
            "type": "array",
            "length": len(payload),
            "item_keys": list(payload[0].keys()) if payload and isinstance(payload[0], dict) else [],
        }
    if isinstance(payload, dict):
        return {
            "type": "object",
            "keys": list(payload.keys()),
            "data_len": len(payload["data"]) if isinstance(payload.get("data"), list) else None,
        }
    return {"type": type(payload).__name__}


def pick_sample(payload: Any):
    sample_id = None
    sample_status = None
    rows = None
    if isinstance(payload, list):
        rows = payload
    elif isinstance(payload, dict):
        for k in ("data", "quotes", "items", "results"):
            if isinstance(payload.get(k), list):
                rows = payload[k]
                break
    if rows:
        row = rows[0]
        if isinstance(row, dict):
            sample_id = row.get("id") or row.get("ID") or row.get("quote_id")
            sample_status = row.get("status")
    return sample_id, sample_status


def main() -> int:
    if not KEY:
        print("Missing KFPP_API_KEY", file=sys.stderr)
        return 1

    results: list[dict] = []
    results.append(req("01_no_auth", "GET", BASE))
    results.append(req("02_bad_key_header", "GET", BASE, {"X-KFPP-Api-Key": "invalid-key-000"}))
    results.append(req("03_bad_key_query", "GET", f"{BASE}?api_key=invalid-key-000"))
    results.append(req("04_list_header", "GET", BASE, {"X-KFPP-Api-Key": KEY}))
    results.append(req("05_list_query", "GET", f"{BASE}?api_key={KEY}"))
    results.append(req("06_list_page_per_page", "GET", f"{BASE}?page=1&per_page=5", {"X-KFPP-Api-Key": KEY}))
    results.append(req("07_list_status_new", "GET", f"{BASE}?status=new", {"X-KFPP-Api-Key": KEY}))
    results.append(req("08_list_status_pending", "GET", f"{BASE}?status=pending", {"X-KFPP-Api-Key": KEY}))
    results.append(req("09_get_missing_id", "GET", f"{BASE}/99999999", {"X-KFPP-Api-Key": KEY}))
    results.append(req("10_get_invalid_id", "GET", f"{BASE}/not-an-id", {"X-KFPP-Api-Key": KEY}))
    results.append(req("11_post_collection", "POST", BASE, {"X-KFPP-Api-Key": KEY}, {"status": "new"}))
    results.append(req("12_put_collection", "PUT", BASE, {"X-KFPP-Api-Key": KEY}, {"status": "new"}))
    results.append(req("13_delete_collection", "DELETE", BASE, {"X-KFPP-Api-Key": KEY}))
    results.append(
        req(
            "14_options_cors",
            "OPTIONS",
            BASE,
            {
                "X-KFPP-Api-Key": KEY,
                "Origin": "https://example.com",
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "X-KFPP-Api-Key",
            },
        )
    )
    results.append(req("15_wp_json_root", "GET", "https://kingfisherwingsgroup.com/wp-json/"))
    results.append(req("16_kfpp_namespace", "GET", "https://kingfisherwingsgroup.com/wp-json/kfpp/v1"))

    list_payload = next((r["body_json"] for r in results if r["name"] == "04_list_header"), None)
    sample_id, sample_status = pick_sample(list_payload)
    results.append(
        {
            "name": "17_discover_sample_id",
            "method": "META",
            "url": BASE,
            "status": 200 if sample_id is not None else 204,
            "elapsed_ms": 0,
            "headers": {},
            "body_raw": "",
            "body_json": {
                "sampleId": sample_id,
                "sampleStatus": sample_status,
                "list_shape": summarize_shape(list_payload),
            },
            "error": None,
        }
    )

    if sample_id is not None:
        results.append(req("18_get_by_id", "GET", f"{BASE}/{sample_id}", {"X-KFPP-Api-Key": KEY}))
        patch_status = sample_status or "pending"
        results.append(
            req(
                "19_patch_same_status",
                "PATCH",
                f"{BASE}/{sample_id}",
                {"X-KFPP-Api-Key": KEY},
                {"status": patch_status},
            )
        )
        results.append(
            req("20_patch_empty_body", "PATCH", f"{BASE}/{sample_id}", {"X-KFPP-Api-Key": KEY}, {})
        )
        results.append(
            req(
                "21_patch_invalid_status",
                "PATCH",
                f"{BASE}/{sample_id}",
                {"X-KFPP-Api-Key": KEY},
                {"status": "not_a_real_status_xyz"},
            )
        )
        results.append(
            req("22_patch_no_auth", "PATCH", f"{BASE}/{sample_id}", None, {"status": patch_status})
        )
    else:
        results.append(
            req(
                "18_patch_missing_id",
                "PATCH",
                f"{BASE}/99999999",
                {"X-KFPP-Api-Key": KEY},
                {"status": "pending"},
            )
        )

    results.append(req("23_alt_bearer", "GET", BASE, {"Authorization": f"Bearer {KEY}"}))
    results.append(req("24_alt_header_lower", "GET", BASE, {"x-kfpp-api-key": KEY}))

    out_path = OUT / "kfpp-quotes-api-probe.json"
    out_path.write_text(json.dumps(results, indent=2), encoding="utf-8")
    print(f"Wrote {out_path}")
    for r in results:
        preview = (r.get("body_raw") or "")[:140].replace("\n", " ")
        print(f"{r['name']:<36} {r['status']:>3} {r['elapsed_ms']:>5}ms  {preview}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
