# Week 14 API — FAIL Test Results

**Base URL:** `http://localhost:3000`  
**Generated:** 2026-08-15T09:35:05.540Z  
**Scope:** Negative / validation / auth isolation for VPP + CRM  

## Summary

| Metric | Count |
|--------|------:|
| FAIL cases executed | 64 |
| FAIL cases correctly rejected | 64 |
| FAIL cases unexpected | 0 |

A FAIL **case** is a deliberate negative test. Status **PASS** means the API correctly rejected the request. Status **FAIL** means the API did not reject as expected.

## Categories covered

- Missing / wrong Authorization (401/403)  
- Staff token on vendor routes  
- Vendor token not used on staff CRM (staff routes require staff JWT — unauth tested)  
- Invalid / incomplete bodies (400)  
- Unknown UUIDs (404)  
- Business rule conflicts (400 duplicate dispute, re-convert, re-send campaign)  

## FAIL cases

| # | Group | Result | Method | Path | Title | Expected | HTTP | Notes |
|---|-------|--------|--------|------|-------|----------|------|-------|
| 1 | P1 Identity | PASS | GET | `/parties/9c61b492-4ba7-4d03-9369-173050c11024/vendor-users` | List vendor-users without auth | 401/403 | 401 | Correctly rejected (401) |
| 2 | P1 Identity | PASS | POST | `/parties/9c61b492-4ba7-4d03-9369-173050c11024/vendor-users` | Create vendor-user without auth | 401/403 | 401 | Correctly rejected (401) |
| 3 | P1 Identity | PASS | GET | `/parties/9c61b492-4ba7-4d03-9369-173050c11024/vendor-permissions` | Vendor permissions without auth | 401/403 | 401 | Correctly rejected (401) |
| 4 | P1 Identity | PASS | POST | `/vendor/auth/login` | Vendor login bad password | 401/400 | 401 | Correctly rejected (401) |
| 5 | P1 Identity | PASS | POST | `/vendor/auth/login` | Vendor login missing fields | 400/401 | 400 | Correctly rejected (400) |
| 6 | P1 Identity | PASS | POST | `/vendor/auth/accept-invite` | Accept invite invalid token | 400/401 | 400 | Correctly rejected (400) |
| 7 | P1 Identity | PASS | POST | `/vendor/auth/refresh` | Refresh with garbage token | 401/400 | 401 | Correctly rejected (401) |
| 8 | P1 Identity | PASS | GET | `/vendor/auth/me` | Me without vendor token | 401/403 | 401 | Correctly rejected (401) |
| 9 | P1 Identity | PASS | GET | `/vendor/auth/me` | Staff token rejected on vendor me | 401/403 | 401 | Correctly rejected (401) |
| 10 | P1 Identity | PASS | POST | `/parties/9c61b492-4ba7-4d03-9369-173050c11024/vendor-users` | Create vendor user invalid email | 400 | 400 | Correctly rejected (400) |
| 11 | P1 Identity | PASS | GET | `/parties/00000000-0000-0000-0000-000000000099/vendor-permissions` | Permissions for unknown party | 404 | 404 | Correctly rejected (404) |
| 12 | P2 Reads | PASS | GET | `/vendor/invoices` | Unauth /vendor/invoices | 401/403 | 401 | Correctly rejected (401) |
| 13 | P2 Reads | PASS | GET | `/vendor/invoices` | Staff token on /vendor/invoices | 401/403 | 401 | Correctly rejected (401) |
| 14 | P2 Reads | PASS | GET | `/vendor/invoices/summary` | Unauth /vendor/invoices/summary | 401/403 | 401 | Correctly rejected (401) |
| 15 | P2 Reads | PASS | GET | `/vendor/invoices/summary` | Staff token on /vendor/invoices/summary | 401/403 | 401 | Correctly rejected (401) |
| 16 | P2 Reads | PASS | GET | `/vendor/invoices/export.csv` | Unauth /vendor/invoices/export.csv | 401/403 | 401 | Correctly rejected (401) |
| 17 | P2 Reads | PASS | GET | `/vendor/invoices/export.csv` | Staff token on /vendor/invoices/export.csv | 401/403 | 401 | Correctly rejected (401) |
| 18 | P2 Reads | PASS | GET | `/vendor/payments` | Unauth /vendor/payments | 401/403 | 401 | Correctly rejected (401) |
| 19 | P2 Reads | PASS | GET | `/vendor/payments` | Staff token on /vendor/payments | 401/403 | 401 | Correctly rejected (401) |
| 20 | P2 Reads | PASS | GET | `/vendor/credit-notes` | Unauth /vendor/credit-notes | 401/403 | 401 | Correctly rejected (401) |
| 21 | P2 Reads | PASS | GET | `/vendor/credit-notes` | Staff token on /vendor/credit-notes | 401/403 | 401 | Correctly rejected (401) |
| 22 | P2 Reads | PASS | GET | `/vendor/advances` | Unauth /vendor/advances | 401/403 | 401 | Correctly rejected (401) |
| 23 | P2 Reads | PASS | GET | `/vendor/advances` | Staff token on /vendor/advances | 401/403 | 401 | Correctly rejected (401) |
| 24 | P2 Reads | PASS | GET | `/vendor/credit/aging` | Unauth /vendor/credit/aging | 401/403 | 401 | Correctly rejected (401) |
| 25 | P2 Reads | PASS | GET | `/vendor/credit/aging` | Staff token on /vendor/credit/aging | 401/403 | 401 | Correctly rejected (401) |
| 26 | P2 Reads | PASS | GET | `/vendor/credit/statement` | Unauth /vendor/credit/statement | 401/403 | 401 | Correctly rejected (401) |
| 27 | P2 Reads | PASS | GET | `/vendor/credit/statement` | Staff token on /vendor/credit/statement | 401/403 | 401 | Correctly rejected (401) |
| 28 | P2 Reads | PASS | GET | `/vendor/credit/statement.pdf` | Unauth /vendor/credit/statement.pdf | 401/403 | 401 | Correctly rejected (401) |
| 29 | P2 Reads | PASS | GET | `/vendor/credit/statement.pdf` | Staff token on /vendor/credit/statement.pdf | 401/403 | 401 | Correctly rejected (401) |
| 30 | P2 Reads | PASS | GET | `/vendor/schedule` | Unauth /vendor/schedule | 401/403 | 401 | Correctly rejected (401) |
| 31 | P2 Reads | PASS | GET | `/vendor/schedule` | Staff token on /vendor/schedule | 401/403 | 401 | Correctly rejected (401) |
| 32 | P2 Reads | PASS | GET | `/vendor/payment-requests` | Unauth /vendor/payment-requests | 401/403 | 401 | Correctly rejected (401) |
| 33 | P2 Reads | PASS | GET | `/vendor/payment-requests` | Staff token on /vendor/payment-requests | 401/403 | 401 | Correctly rejected (401) |
| 34 | P2 Reads | PASS | GET | `/vendor/documents/tds` | Unauth /vendor/documents/tds | 401/403 | 401 | Correctly rejected (401) |
| 35 | P2 Reads | PASS | GET | `/vendor/documents/tds` | Staff token on /vendor/documents/tds | 401/403 | 401 | Correctly rejected (401) |
| 36 | P2 Reads | PASS | GET | `/vendor/invoices/00000000-0000-0000-0000-000000000099` | Vendor get other invoice id | 404 | 404 | Correctly rejected (404) |
| 37 | P2 Reads | PASS | GET | `/vendor/invoices/dfe05889-f3c0-43c4-820c-f171054606c2/pdf` | Vendor invoice PDF (available or correctly 404) | 200 or 404 | 404 | No PDF yet (expected for draft without generate) |
| 38 | P2 Reads | PASS | GET | `/vendor/payments/00000000-0000-0000-0000-000000000099/remittance.pdf` | Remittance PDF unknown payment | 404 | 404 | Correctly rejected (404) |
| 39 | P3 Writes | PASS | POST | `/vendor/invoices/submit` | Submit invoice without auth | 401/403 | 401 | Correctly rejected (401) |
| 40 | P3 Writes | PASS | POST | `/vendor/invoices/submit` | Submit invoice invalid payload | 400 | 400 | Correctly rejected (400) |
| 41 | P3 Writes | PASS | POST | `/vendor/disputes` | Create dispute without auth | 401/403 | 401 | Correctly rejected (401) |
| 42 | P3 Writes | PASS | POST | `/vendor/disputes` | Create dispute invalid body | 400 | 400 | Correctly rejected (400) |
| 43 | P3 Writes | PASS | POST | `/vendor/disputes` | Duplicate open dispute | 400 | 400 | Correctly rejected (400) |
| 44 | P3 Writes | PASS | GET | `/vendor/disputes/00000000-0000-0000-0000-000000000099` | Get unknown dispute | 404 | 404 | Correctly rejected (404) |
| 45 | P3 Writes | PASS | GET | `/vendor-admin/disputes` | Staff disputes without auth | 401/403 | 401 | Correctly rejected (401) |
| 46 | P3 Writes | PASS | PATCH | `/vendor-admin/disputes/39701962-473c-494f-b347-cf503e1fb373` | Staff review invalid status body | 400 | 400 | Correctly rejected (400) |
| 47 | P4 Leads | PASS | GET | `/crm/leads` | List leads without auth | 401/403 | 401 | Correctly rejected (401) |
| 48 | P4 Leads | PASS | POST | `/crm/leads` | Create lead invalid | 400 | 400 | Correctly rejected (400) |
| 49 | P4 Leads | PASS | GET | `/crm/leads/00000000-0000-0000-0000-000000000099` | Get unknown lead | 404 | 404 | Correctly rejected (404) |
| 50 | P4 Leads | PASS | POST | `/crm/leads/fc055ac8-9b31-408d-b017-a72b53b0de8a/convert` | Convert already converted lead | 400 | 400 | Correctly rejected (400) |
| 51 | P5 Activity | PASS | POST | `/crm/call-logs` | Create call without auth | 401/403 | 401 | Correctly rejected (401) |
| 52 | P5 Activity | PASS | POST | `/crm/call-logs` | Create call missing lead/party | 400 | 400 | Correctly rejected (400) |
| 53 | P5 Activity | PASS | POST | `/crm/follow-ups` | Create follow-up invalid | 400 | 400 | Correctly rejected (400) |
| 54 | P5 Activity | PASS | PATCH | `/crm/follow-ups/00000000-0000-0000-0000-000000000099` | Patch unknown follow-up | 404 | 404 | Correctly rejected (404) |
| 55 | P5 Activity | PASS | POST | `/crm/enquiries` | Create enquiry invalid | 400 | 400 | Correctly rejected (400) |
| 56 | P5 Activity | PASS | POST | `/crm/enquiries/16d3bfc5-a844-42a1-82bf-f4818f35a2b7/convert-to-quote` | Convert enquiry again | 400 | 400 | Correctly rejected (400) |
| 57 | P6 Dashboard | PASS | GET | `/crm/dashboard` | Dashboard without auth | 401/403 | 401 | Correctly rejected (401) |
| 58 | P6 Dashboard | PASS | GET | `/crm/reports/not_a_report` | Unknown report type | 400 | 400 | Correctly rejected (400) |
| 59 | P6 Dashboard | PASS | POST | `/crm/budgets` | Create budget invalid | 400 | 400 | Correctly rejected (400) |
| 60 | P7 Email | PASS | GET | `/crm/subscribers` | Subscribers without auth | 401/403 | 401 | Correctly rejected (401) |
| 61 | P7 Email | PASS | POST | `/crm/subscribers` | Create subscriber invalid email | 400 | 400 | Correctly rejected (400) |
| 62 | P7 Email | PASS | POST | `/crm/campaign-templates` | Create template invalid | 400 | 400 | Correctly rejected (400) |
| 63 | P7 Email | PASS | POST | `/crm/campaigns/0c3da328-0b6f-4a86-89df-7412244e4473/schedule` | Schedule without scheduled_at | 400 | 400 | Correctly rejected (400) |
| 64 | P7 Email | PASS | POST | `/crm/campaigns/4ae21c2a-95dd-4c58-b11a-197fe1b5d5e1/send` | Send already-sent campaign | 400 | 400 | Correctly rejected (400) |
