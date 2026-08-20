# Week 14 API — PASS Test Results

**Base URL:** `http://localhost:3000`  
**Generated:** 2026-08-15T09:35:05.540Z  
**Scope:** Vendor Payment Portal (P1–P3) + CRM (P4–P7) — every planned endpoint  

## Summary

| Metric | Count |
|--------|------:|
| PASS cases executed | 90 |
| PASS cases succeeded | 89 |
| PASS cases failed | 1 |
| Endpoint coverage (unique planned) | 69 / 69 |

### Coverage

All planned Week 14 endpoints were exercised at least once (pass and/or fail case).


## Flow order

1. Bootstrap (health → SuperAdmin → tenant → sync-permissions → tenant login → parties)  
2. P1 Vendor identity / invite / JWT  
3. P2 Vendor AP reads  
4. P3 Submit PI + disputes + staff review  
5. P4 Leads  
6. P5 Calls / follow-ups / enquiries→quote  
7. P6 Budgets + 14 reports  
8. P7 Subscribers / campaigns  

## PASS cases

| # | Group | Result | Method | Path | Title | Expected | HTTP | Notes |
|---|-------|--------|--------|------|-------|----------|------|-------|
| 1 | Bootstrap | PASS | GET | `/health` | Health check | 2xx | 200 | API up |
| 2 | Bootstrap | PASS | POST | `/auth/super-admin/login` | SuperAdmin authenticated | 2xx | 200 | OK |
| 3 | Bootstrap | PASS | POST | `/tenants` | Create tenant | 2xx | 201 | 2bc66e13-9e66-4241-852c-48702955ffc4 |
| 4 | Bootstrap | PASS | POST | `/auth/tenant-login` | Tenant admin login | 2xx | 200 | OK |
| 5 | Bootstrap | PASS | POST | `/parties` | Party fixtures (SUPPLIER + CUSTOMER) | 2xx | 201 | vendor=9c61b492-4ba7-4d03-9369-173050c11024 customer=08cc1739-e355-45b6-8eee-3e18038e0f46 |
| 6 | P1 Identity | PASS | POST | `/parties/9c61b492-4ba7-4d03-9369-173050c11024/vendor-users` | Create vendor user (invite) | 2xx | 201 | OK |
| 7 | P1 Identity | PASS | POST | `/parties/9c61b492-4ba7-4d03-9369-173050c11024/vendor-users` | Create ACTIVE vendor user with password | 2xx | 201 | OK |
| 8 | P1 Identity | PASS | GET | `/parties/9c61b492-4ba7-4d03-9369-173050c11024/vendor-users` | List vendor users for party | 2xx | 200 | OK |
| 9 | P1 Identity | PASS | GET | `/vendor-users` | List tenant vendor-users directory | 2xx | 200 | OK |
| 10 | P1 Identity | PASS | GET | `/parties/9c61b492-4ba7-4d03-9369-173050c11024/vendor-permissions` | Get vendor permissions | 2xx | 200 | OK |
| 11 | P1 Identity | PASS | PUT | `/parties/9c61b492-4ba7-4d03-9369-173050c11024/vendor-permissions` | Upsert vendor permissions | 2xx | 200 | OK |
| 12 | P1 Identity | PASS | POST | `/vendor/auth/login` | Vendor login | 2xx | 201 | OK |
| 13 | P1 Identity | PASS | GET | `/vendor/auth/me` | Vendor me | 2xx | 200 | OK |
| 14 | P1 Identity | PASS | POST | `/vendor/auth/refresh` | Vendor refresh | 2xx | 201 | OK |
| 15 | P1 Identity | PASS | POST | `/vendor/auth/logout` | Vendor logout | 200,201 | 200 | OK |
| 16 | P1 Identity | PASS | POST | `/vendor/auth/login` | Vendor re-login after logout | 2xx | 201 | OK |
| 17 | P1 Identity | PASS | POST | `/parties/9c61b492-4ba7-4d03-9369-173050c11024/vendor-users/04d224bf-36c6-4601-bf6c-5e97ebc55ef2/resend-invite` | Resend invite | 2xx | 201 | OK |
| 18 | P1 Identity | PASS | POST | `/parties/9c61b492-4ba7-4d03-9369-173050c11024/vendor-users/04d224bf-36c6-4601-bf6c-5e97ebc55ef2/reset-password` | Reset vendor password | 2xx | 201 | OK |
| 19 | P1 Identity | PASS | PATCH | `/parties/9c61b492-4ba7-4d03-9369-173050c11024/vendor-users/04d224bf-36c6-4601-bf6c-5e97ebc55ef2/status` | Update vendor status ACTIVE | 2xx | 200 | OK |
| 20 | P2 Reads | PASS | GET | `/vendor/invoices` | Vendor /vendor/invoices | 2xx | 200 | OK |
| 21 | P2 Reads | PASS | GET | `/vendor/invoices/summary` | Vendor /vendor/invoices/summary | 2xx | 200 | OK |
| 22 | P2 Reads | PASS | GET | `/vendor/invoices/export.csv` | Vendor /vendor/invoices/export.csv | 2xx | 200 | OK |
| 23 | P2 Reads | PASS | GET | `/vendor/payments` | Vendor /vendor/payments | 2xx | 200 | OK |
| 24 | P2 Reads | PASS | GET | `/vendor/credit-notes` | Vendor /vendor/credit-notes | 2xx | 200 | OK |
| 25 | P2 Reads | PASS | GET | `/vendor/advances` | Vendor /vendor/advances | 2xx | 200 | OK |
| 26 | P2 Reads | PASS | GET | `/vendor/credit/aging` | Vendor /vendor/credit/aging | 2xx | 200 | OK |
| 27 | P2 Reads | PASS | GET | `/vendor/credit/statement` | Vendor /vendor/credit/statement | 2xx | 200 | OK |
| 28 | P2 Reads | FAIL | GET | `/vendor/credit/statement.pdf` | Vendor /vendor/credit/statement.pdf | 2xx | 503 | {"message":"PDF generation is unavailable. Could not find Chrome (ver. 127.0.6533.88). This can occur if either\n 1. you did not perform an installation before  |
| 29 | P2 Reads | PASS | GET | `/vendor/schedule` | Vendor /vendor/schedule | 2xx | 200 | OK |
| 30 | P2 Reads | PASS | GET | `/vendor/payment-requests` | Vendor /vendor/payment-requests | 2xx | 200 | OK |
| 31 | P2 Reads | PASS | GET | `/vendor/documents/tds` | Vendor /vendor/documents/tds | 2xx | 200 | OK |
| 32 | P2 Reads | PASS | GET | `/vendor/invoices/dfe05889-f3c0-43c4-820c-f171054606c2` | Vendor get invoice by id | 2xx | 200 | OK |
| 33 | P3 Writes | PASS | POST | `/vendor/invoices/submit` | Vendor submit DRAFT PI | 2xx | 201 | OK |
| 34 | P3 Writes | PASS | POST | `/vendor/disputes` | Vendor create dispute | 2xx | 201 | OK |
| 35 | P3 Writes | PASS | GET | `/vendor/disputes` | List my disputes | 2xx | 200 | OK |
| 36 | P3 Writes | PASS | GET | `/vendor/disputes/39701962-473c-494f-b347-cf503e1fb373` | Get my dispute | 2xx | 200 | OK |
| 37 | P3 Writes | PASS | GET | `/vendor-admin/disputes` | Staff list vendor disputes | 2xx | 200 | OK |
| 38 | P3 Writes | PASS | GET | `/vendor-admin/disputes/39701962-473c-494f-b347-cf503e1fb373` | Staff get dispute | 2xx | 200 | OK |
| 39 | P3 Writes | PASS | PATCH | `/vendor-admin/disputes/39701962-473c-494f-b347-cf503e1fb373` | Staff resolve dispute | 2xx | 200 | OK |
| 40 | P4 Leads | PASS | POST | `/crm/leads` | Create lead | 2xx | 201 | OK |
| 41 | P4 Leads | PASS | GET | `/crm/leads` | List leads | 2xx | 200 | OK |
| 42 | P4 Leads | PASS | GET | `/crm/leads/pipeline` | Lead pipeline | 2xx | 200 | OK |
| 43 | P4 Leads | PASS | POST | `/crm/leads/import` | Import leads CSV | 2xx | 201 | OK |
| 44 | P4 Leads | PASS | GET | `/crm/leads/fc055ac8-9b31-408d-b017-a72b53b0de8a` | Get lead | 2xx | 200 | OK |
| 45 | P4 Leads | PASS | PATCH | `/crm/leads/fc055ac8-9b31-408d-b017-a72b53b0de8a` | Update lead status | 2xx | 200 | OK |
| 46 | P4 Leads | PASS | POST | `/crm/leads/fc055ac8-9b31-408d-b017-a72b53b0de8a/convert` | Convert lead to customer | 2xx | 201 | OK |
| 47 | P4 Leads | PASS | POST | `/crm/leads` | Create lead for delete | 2xx | 201 | OK |
| 48 | P4 Leads | PASS | DELETE | `/crm/leads/c9bf8229-2ecf-4f4e-a671-a96137aaf121` | Delete lead | 200,204 | 200 | OK |
| 49 | P5 Activity | PASS | POST | `/crm/leads` | Create lead for call | 2xx | 201 | OK |
| 50 | P5 Activity | PASS | POST | `/crm/call-logs` | Create call log with follow-up | 2xx | 201 | OK |
| 51 | P5 Activity | PASS | GET | `/crm/call-logs` | List call logs | 2xx | 200 | OK |
| 52 | P5 Activity | PASS | GET | `/crm/call-logs/daily?date=2026-08-15` | Daily call sheet | 2xx | 200 | OK |
| 53 | P5 Activity | PASS | POST | `/crm/follow-ups` | Create follow-up | 2xx | 201 | OK |
| 54 | P5 Activity | PASS | GET | `/crm/follow-ups` | List follow-ups | 2xx | 200 | OK |
| 55 | P5 Activity | PASS | GET | `/crm/follow-ups?team=true` | List follow-ups team | 2xx | 200 | OK |
| 56 | P5 Activity | PASS | GET | `/crm/follow-ups/calendar` | Follow-ups calendar | 2xx | 200 | OK |
| 57 | P5 Activity | PASS | PATCH | `/crm/follow-ups/e56a9953-cd5d-4c85-8779-b858233291fd` | Complete follow-up | 2xx | 200 | OK |
| 58 | P5 Activity | PASS | POST | `/crm/enquiries` | Create enquiry | 2xx | 201 | OK |
| 59 | P5 Activity | PASS | GET | `/crm/enquiries` | List enquiries | 2xx | 200 | OK |
| 60 | P5 Activity | PASS | GET | `/crm/enquiries/16d3bfc5-a844-42a1-82bf-f4818f35a2b7` | Get enquiry | 2xx | 200 | OK |
| 61 | P5 Activity | PASS | PATCH | `/crm/enquiries/16d3bfc5-a844-42a1-82bf-f4818f35a2b7` | Update enquiry | 2xx | 200 | OK |
| 62 | P5 Activity | PASS | POST | `/crm/enquiries/16d3bfc5-a844-42a1-82bf-f4818f35a2b7/convert-to-quote` | Convert enquiry to quote | 2xx | 201 | OK |
| 63 | P6 Dashboard | PASS | GET | `/crm/dashboard` | CRM dashboard overview | 2xx | 200 | OK |
| 64 | P6 Dashboard | PASS | GET | `/crm/reports/weekly_sales` | Report weekly_sales | 2xx | 200 | OK |
| 65 | P6 Dashboard | PASS | GET | `/crm/reports/monthly_sales` | Report monthly_sales | 2xx | 200 | OK |
| 66 | P6 Dashboard | PASS | GET | `/crm/reports/salesman_revenue` | Report salesman_revenue | 2xx | 200 | OK |
| 67 | P6 Dashboard | PASS | GET | `/crm/reports/customer_revenue` | Report customer_revenue | 2xx | 200 | OK |
| 68 | P6 Dashboard | PASS | GET | `/crm/reports/top_customers` | Report top_customers | 2xx | 200 | OK |
| 69 | P6 Dashboard | PASS | GET | `/crm/reports/top_salesmen` | Report top_salesmen | 2xx | 200 | OK |
| 70 | P6 Dashboard | PASS | GET | `/crm/reports/trade_lane` | Report trade_lane | 2xx | 200 | OK |
| 71 | P6 Dashboard | PASS | GET | `/crm/reports/service_type` | Report service_type | 2xx | 200 | OK |
| 72 | P6 Dashboard | PASS | GET | `/crm/reports/win_loss` | Report win_loss | 2xx | 200 | OK |
| 73 | P6 Dashboard | PASS | GET | `/crm/reports/call_log_summary` | Report call_log_summary | 2xx | 200 | OK |
| 74 | P6 Dashboard | PASS | GET | `/crm/reports/lead_pipeline` | Report lead_pipeline | 2xx | 200 | OK |
| 75 | P6 Dashboard | PASS | GET | `/crm/reports/budget_vs_actual` | Report budget_vs_actual | 2xx | 200 | OK |
| 76 | P6 Dashboard | PASS | GET | `/crm/reports/enquiry_conversion` | Report enquiry_conversion | 2xx | 200 | OK |
| 77 | P6 Dashboard | PASS | GET | `/crm/reports/follow_up_overdue` | Report follow_up_overdue | 2xx | 200 | OK |
| 78 | P6 Dashboard | PASS | POST | `/crm/budgets` | Create salesperson budget | 2xx | 201 | OK |
| 79 | P6 Dashboard | PASS | GET | `/crm/budgets` | List budgets | 2xx | 200 | OK |
| 80 | P7 Email | PASS | POST | `/crm/subscribers` | Create subscriber | 2xx | 201 | OK |
| 81 | P7 Email | PASS | GET | `/crm/subscribers` | List subscribers | 2xx | 200 | OK |
| 82 | P7 Email | PASS | POST | `/crm/subscribers/import` | Import subscribers CSV | 2xx | 201 | OK |
| 83 | P7 Email | PASS | POST | `/crm/subscribers/2757af1d-9c60-419b-bf47-5499e6d6b9f3/unsubscribe` | Unsubscribe | 2xx | 201 | OK |
| 84 | P7 Email | PASS | POST | `/crm/campaign-templates` | Create campaign template | 2xx | 201 | OK |
| 85 | P7 Email | PASS | GET | `/crm/campaign-templates` | List campaign templates | 2xx | 200 | OK |
| 86 | P7 Email | PASS | POST | `/crm/campaigns` | Create campaign | 2xx | 201 | OK |
| 87 | P7 Email | PASS | GET | `/crm/campaigns` | List campaigns | 2xx | 200 | OK |
| 88 | P7 Email | PASS | POST | `/crm/campaigns/0c3da328-0b6f-4a86-89df-7412244e4473/schedule` | Schedule campaign | 2xx | 201 | OK |
| 89 | P7 Email | PASS | POST | `/crm/campaigns` | Create campaign for send-now | 2xx | 201 | OK |
| 90 | P7 Email | PASS | POST | `/crm/campaigns/4ae21c2a-95dd-4c58-b11a-197fe1b5d5e1/send` | Send campaign now | 2xx | 201 | OK |

## Notes

- Vendor JWT is isolated from staff JWT (staff token on `/vendor/*` must fail).  
- Vendor submit creates **DRAFT** purchase invoices only.  
- Enquiry convert uses existing QuotationsService.  
- Campaign send counts use EmailLog SENT/FAILED (SMTP may be log-only in this environment).  
