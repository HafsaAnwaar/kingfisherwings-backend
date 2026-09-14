# API → required permissions (from source)

Generated from Nest controllers. Live Swagger may lag; use this for RBAC testing.

| Method | Path | Required permissions |
|--------|------|----------------------|
| GET | `/api/v1/api-keys` | USERS_PERMISSIONS.VIEW |
| POST | `/api/v1/api-keys` | USERS_PERMISSIONS.CREATE |
| PATCH | `/api/v1/api-keys/:id/revoke` | USERS_PERMISSIONS.CREATE |
| POST | `/api/v1/billing/checkout-session` | USERS_PERMISSIONS.CREATE |
| GET | `/api/v1/billing/status` | USERS_PERMISSIONS.VIEW |
| GET | `/api/v1/health` | _(none / public / role-only)_ |
| GET | `/api/v1/jobs` | _(none / public / role-only)_ |
| GET | `/api/v1/jobs/:id` | _(none / public / role-only)_ |
| GET | `/api/v1/track/:token` | _(none / public / role-only)_ |
| GET | `/api/v1/webhooks` | USERS_PERMISSIONS.VIEW |
| POST | `/api/v1/webhooks` | USERS_PERMISSIONS.CREATE |
| POST | `/api/v1/webhooks/test-dispatch` | USERS_PERMISSIONS.CREATE |
| POST | `/auth/2fa/disable` | _(none / public / role-only)_ |
| POST | `/auth/2fa/enable` | _(none / public / role-only)_ |
| POST | `/auth/2fa/setup` | _(none / public / role-only)_ |
| POST | `/auth/accept-invite` | _(none / public / role-only)_ |
| POST | `/auth/change-password` | _(none / public / role-only)_ |
| POST | `/auth/invite` | _(none / public / role-only)_ |
| POST | `/auth/login` | _(none / public / role-only)_ |
| POST | `/auth/logout` | _(none / public / role-only)_ |
| POST | `/auth/logout-all` | _(none / public / role-only)_ |
| GET | `/auth/me` | _(none / public / role-only)_ |
| PATCH | `/auth/me` | _(none / public / role-only)_ |
| POST | `/auth/refresh` | _(none / public / role-only)_ |
| GET | `/auth/sessions` | _(none / public / role-only)_ |
| POST | `/auth/sessions/:sessionId/revoke` | _(none / public / role-only)_ |
| POST | `/auth/super-admin/login` | _(none / public / role-only)_ |
| POST | `/auth/super-admin/signup` | _(none / public / role-only)_ |
| POST | `/auth/tenant-login` | _(none / public / role-only)_ |
| POST | `/auth/tenant/change-password` | _(none / public / role-only)_ |
| GET | `/awb-stock/allocations` | AWB_STOCK_PERMISSIONS.VIEW |
| POST | `/awb-stock/allocations/:id/mark-used` | AWB_STOCK_PERMISSIONS.UPDATE |
| POST | `/awb-stock/allocations/:id/void` | AWB_STOCK_PERMISSIONS.VOID |
| GET | `/awb-stock/batches` | AWB_STOCK_PERMISSIONS.VIEW |
| POST | `/awb-stock/batches` | AWB_STOCK_PERMISSIONS.CREATE |
| DELETE | `/awb-stock/batches/:id` | AWB_STOCK_PERMISSIONS.DELETE |
| GET | `/awb-stock/batches/:id` | AWB_STOCK_PERMISSIONS.VIEW |
| PATCH | `/awb-stock/batches/:id` | AWB_STOCK_PERMISSIONS.UPDATE |
| POST | `/awb-stock/batches/:id/allocate` | AWB_STOCK_PERMISSIONS.ALLOCATE |
| POST | `/awb-stock/batches/:id/transfer-branch` | AWB_STOCK_PERMISSIONS.UPDATE |
| GET | `/awb-stock/reports/low-stock` | AWB_STOCK_PERMISSIONS.VIEW |
| GET | `/companies` | _(none / public / role-only)_ |
| POST | `/companies` | _(none / public / role-only)_ |
| DELETE | `/companies/:id` | _(none / public / role-only)_ |
| GET | `/companies/:id` | _(none / public / role-only)_ |
| PATCH | `/companies/:id` | _(none / public / role-only)_ |
| GET | `/credit-notes` | INVOICES_PERMISSIONS.VIEW |
| POST | `/credit-notes` | INVOICES_PERMISSIONS.CREATE |
| GET | `/credit-notes/:id` | INVOICES_PERMISSIONS.VIEW |
| POST | `/credit-notes/:id/post` | INVOICES_PERMISSIONS.POST |
| GET | `/crm/leads` | CRM_PERMISSIONS.VIEW |
| GET | `/crm/leads` | CRM_PERMISSIONS.VIEW |
| GET | `/crm/leads` | CRM_PERMISSIONS.VIEW |
| GET | `/crm/leads` | CRM_PERMISSIONS.VIEW |
| POST | `/crm/leads` | CRM_PERMISSIONS.CREATE |
| POST | `/crm/leads` | CRM_PERMISSIONS.CREATE |
| POST | `/crm/leads` | CRM_PERMISSIONS.CREATE |
| POST | `/crm/leads` | CRM_PERMISSIONS.CREATE |
| DELETE | `/crm/leads/:id` | CRM_PERMISSIONS.DELETE |
| GET | `/crm/leads/:id` | CRM_PERMISSIONS.VIEW |
| GET | `/crm/leads/:id` | CRM_PERMISSIONS.VIEW |
| PATCH | `/crm/leads/:id` | CRM_PERMISSIONS.UPDATE |
| PATCH | `/crm/leads/:id` | CRM_PERMISSIONS.UPDATE |
| PATCH | `/crm/leads/:id` | CRM_PERMISSIONS.UPDATE |
| POST | `/crm/leads/:id/convert` | CRM_PERMISSIONS.UPDATE |
| POST | `/crm/leads/:id/convert-to-quote` | CRM_PERMISSIONS.UPDATE |
| GET | `/crm/leads/budgets` | CRM_PERMISSIONS.VIEW |
| POST | `/crm/leads/budgets` | CRM_PERMISSIONS.CREATE |
| GET | `/crm/leads/calendar` | CRM_PERMISSIONS.VIEW |
| GET | `/crm/leads/campaign-templates` | CRM_PERMISSIONS.VIEW |
| POST | `/crm/leads/campaign-templates` | CRM_PERMISSIONS.CREATE |
| GET | `/crm/leads/campaigns` | CRM_PERMISSIONS.VIEW |
| POST | `/crm/leads/campaigns` | CRM_PERMISSIONS.CREATE |
| POST | `/crm/leads/campaigns/:id/schedule` | CRM_PERMISSIONS.UPDATE |
| POST | `/crm/leads/campaigns/:id/send` | CRM_PERMISSIONS.UPDATE |
| GET | `/crm/leads/daily` | CRM_PERMISSIONS.VIEW |
| GET | `/crm/leads/dashboard` | CRM_PERMISSIONS.VIEW |
| POST | `/crm/leads/import` | CRM_PERMISSIONS.CREATE |
| GET | `/crm/leads/pipeline` | CRM_PERMISSIONS.VIEW |
| GET | `/crm/leads/reports/:type` | CRM_PERMISSIONS.VIEW |
| GET | `/crm/leads/subscribers` | CRM_PERMISSIONS.VIEW |
| POST | `/crm/leads/subscribers` | CRM_PERMISSIONS.CREATE |
| POST | `/crm/leads/subscribers/:id/unsubscribe` | CRM_PERMISSIONS.UPDATE |
| POST | `/crm/leads/subscribers/import` | CRM_PERMISSIONS.CREATE |
| GET | `/debit-notes` | INVOICES_PERMISSIONS.VIEW |
| POST | `/debit-notes` | INVOICES_PERMISSIONS.CREATE |
| GET | `/debit-notes/:id` | INVOICES_PERMISSIONS.VIEW |
| POST | `/debit-notes/:id/post` | INVOICES_PERMISSIONS.POST |
| POST | `/documentation/boe` | DOCUMENTATION_PERMISSIONS.MANAGE |
| PATCH | `/documentation/boe/:id` | DOCUMENTATION_PERMISSIONS.MANAGE |
| GET | `/documentation/boe/claims/pending` | DOCUMENTATION_PERMISSIONS.READ |
| GET | `/documentation/boe/dashboard` | DOCUMENTATION_PERMISSIONS.READ |
| POST | `/documentation/bulk-costs` | DOCUMENTATION_PERMISSIONS.MANAGE |
| GET | `/documentation/bulk-costs/:id` | DOCUMENTATION_PERMISSIONS.READ |
| POST | `/documentation/bulk-costs/preview` | DOCUMENTATION_PERMISSIONS.MANAGE |
| GET | `/documentation/charge-templates` | DOCUMENTATION_PERMISSIONS.READ |
| POST | `/documentation/charge-templates` | DOCUMENTATION_PERMISSIONS.MANAGE |
| DELETE | `/documentation/charge-templates/:id` | DOCUMENTATION_PERMISSIONS.MANAGE |
| GET | `/documentation/charge-templates/:id` | DOCUMENTATION_PERMISSIONS.READ |
| PATCH | `/documentation/charge-templates/:id` | DOCUMENTATION_PERMISSIONS.MANAGE |
| POST | `/documentation/charge-templates/:id/apply` | DOCUMENTATION_PERMISSIONS.MANAGE |
| GET | `/documentation/delivery-orders/closed-jobs` | DOCUMENTATION_PERMISSIONS.READ |
| GET | `/documentation/edi/bayan/jobs` | DOCUMENTATION_PERMISSIONS.EDI_READ |
| POST | `/documentation/edi/bayan/jobs/:jobId/amend` | DOCUMENTATION_PERMISSIONS.EDI_SUBMIT |
| POST | `/documentation/edi/bayan/jobs/:jobId/generate` | DOCUMENTATION_PERMISSIONS.EDI_SUBMIT |
| POST | `/documentation/edi/bayan/jobs/:jobId/submit` | DOCUMENTATION_PERMISSIONS.EDI_SUBMIT |
| GET | `/documentation/edi/bayan/shipments` | DOCUMENTATION_PERMISSIONS.EDI_READ |
| GET | `/documentation/edi/ccn/jobs` | DOCUMENTATION_PERMISSIONS.EDI_READ |
| POST | `/documentation/edi/ccn/jobs/:jobId/fhl/generate` | DOCUMENTATION_PERMISSIONS.EDI_SUBMIT |
| POST | `/documentation/edi/ccn/jobs/:jobId/fwb/generate` | DOCUMENTATION_PERMISSIONS.EDI_SUBMIT |
| POST | `/documentation/edi/ccn/jobs/:jobId/submit` | DOCUMENTATION_PERMISSIONS.EDI_SUBMIT |
| GET | `/documentation/edi/cgm/vessels` | DOCUMENTATION_PERMISSIONS.EDI_READ |
| POST | `/documentation/edi/cgm/vessels` | DOCUMENTATION_PERMISSIONS.EDI_SUBMIT |
| DELETE | `/documentation/edi/cgm/vessels/:id` | DOCUMENTATION_PERMISSIONS.EDI_SUBMIT |
| PATCH | `/documentation/edi/cgm/vessels/:id` | DOCUMENTATION_PERMISSIONS.EDI_SUBMIT |
| POST | `/documentation/edi/cgm/vessels/:id/download-edi` | DOCUMENTATION_PERMISSIONS.EDI_READ |
| GET | `/documentation/edi/eqo/dubai/jobs` | DOCUMENTATION_PERMISSIONS.EDI_READ |
| POST | `/documentation/edi/eqo/dubai/jobs/:jobId/generate-bol` | DOCUMENTATION_PERMISSIONS.EDI_SUBMIT |
| POST | `/documentation/edi/eqo/dubai/jobs/:jobId/submit` | DOCUMENTATION_PERMISSIONS.EDI_SUBMIT |
| GET | `/documentation/edi/eqo/oman/jobs` | DOCUMENTATION_PERMISSIONS.EDI_READ |
| POST | `/documentation/edi/eqo/oman/jobs/:jobId/generate-bol` | DOCUMENTATION_PERMISSIONS.EDI_SUBMIT |
| POST | `/documentation/edi/eqo/oman/jobs/:jobId/submit` | DOCUMENTATION_PERMISSIONS.EDI_SUBMIT |
| GET | `/documentation/edi/ial/jobs` | DOCUMENTATION_PERMISSIONS.EDI_READ |
| POST | `/documentation/edi/ial/jobs/:jobId/generate` | DOCUMENTATION_PERMISSIONS.EDI_SUBMIT |
| POST | `/documentation/edi/ial/jobs/:jobId/submit` | DOCUMENTATION_PERMISSIONS.EDI_SUBMIT |
| GET | `/documentation/edi/submissions/:submissionId/download` | DOCUMENTATION_PERMISSIONS.EDI_READ |
| PATCH | `/documentation/jobs/:jobId/delivery-order` | DOCUMENTATION_PERMISSIONS.MANAGE |
| GET | `/documentation/jobs/air` | DOCUMENTATION_PERMISSIONS.READ |
| POST | `/documentation/jobs/export` | DOCUMENTATION_PERMISSIONS.MANAGE |
| POST | `/documentation/jobs/import` | DOCUMENTATION_PERMISSIONS.MANAGE |
| GET | `/documentation/mpci/filings` | DOCUMENTATION_PERMISSIONS.MPCI |
| POST | `/documentation/mpci/filings` | DOCUMENTATION_PERMISSIONS.MPCI |
| POST | `/documentation/mpci/filings/:id/prepare` | DOCUMENTATION_PERMISSIONS.MPCI |
| GET | `/documentation/mpci/filings/:id/status` | DOCUMENTATION_PERMISSIONS.MPCI |
| POST | `/documentation/mpci/filings/:id/submit` | DOCUMENTATION_PERMISSIONS.MPCI |
| GET | `/documentation/reports` | DOCUMENTATION_PERMISSIONS.READ |
| GET | `/documentation/reports/eta-followup` | DOCUMENTATION_PERMISSIONS.READ |
| GET | `/documentation/reports/etd-followup` | DOCUMENTATION_PERMISSIONS.READ |
| GET | `/documentation/reports/jobs-list` | DOCUMENTATION_PERMISSIONS.READ |
| GET | `/documentation/reports/manifest-status` | DOCUMENTATION_PERMISSIONS.READ |
| GET | `/documentation/uploads/batches/:id/errors` | DOCUMENTATION_PERMISSIONS.UPLOAD |
| POST | `/documentation/uploads/container-numbers` | DOCUMENTATION_PERMISSIONS.UPLOAD |
| POST | `/documentation/uploads/container-transport` | DOCUMENTATION_PERMISSIONS.UPLOAD |
| POST | `/documentation/uploads/dpworld-tracking` | DOCUMENTATION_PERMISSIONS.UPLOAD |
| GET | `/documentation/uploads/templates/:upload_type` | DOCUMENTATION_PERMISSIONS.UPLOAD |
| POST | `/documentation/uploads/truck-positions` | DOCUMENTATION_PERMISSIONS.UPLOAD |
| GET | `/files/:tenantId/:filename` | _(none / public / role-only)_ |
| GET | `/gl/accounts` | GL_PERMISSIONS.VIEW |
| POST | `/gl/accounts` | GL_PERMISSIONS.MANAGE_COA |
| DELETE | `/gl/accounts/:id` | GL_PERMISSIONS.MANAGE_COA |
| GET | `/gl/accounts/:id` | GL_PERMISSIONS.VIEW |
| PATCH | `/gl/accounts/:id` | GL_PERMISSIONS.MANAGE_COA |
| GET | `/gl/accounts/:id/ledger` | GL_PERMISSIONS.VIEW |
| GET | `/gl/accounts/reports/trial-balance` | GL_PERMISSIONS.VIEW |
| POST | `/gl/accounts/seed-defaults` | GL_PERMISSIONS.MANAGE_COA |
| GET | `/gl/accounts/tree` | GL_PERMISSIONS.VIEW |
| GET | `/gl/ap/aging` | GL_PERMISSIONS.VIEW_AGING |
| GET | `/gl/ap/open-items` | GL_PERMISSIONS.VIEW_AGING |
| GET | `/gl/ap/statement/:partyId` | GL_PERMISSIONS.VIEW_AGING |
| POST | `/gl/ap/statement/:partyId/send-email` | GL_PERMISSIONS.VIEW_AGING |
| GET | `/gl/ar/aging` | GL_PERMISSIONS.VIEW_AGING |
| GET | `/gl/ar/open-items` | GL_PERMISSIONS.VIEW_AGING |
| GET | `/gl/ar/statement/:partyId` | GL_PERMISSIONS.VIEW_AGING |
| POST | `/gl/ar/statement/:partyId/send-email` | GL_PERMISSIONS.VIEW_AGING |
| GET | `/gl/bank-reconciliations` | GL_PERMISSIONS.RECONCILE |
| POST | `/gl/bank-reconciliations` | GL_PERMISSIONS.RECONCILE |
| DELETE | `/gl/bank-reconciliations/:id` | GL_PERMISSIONS.RECONCILE |
| GET | `/gl/bank-reconciliations/:id` | GL_PERMISSIONS.RECONCILE |
| PATCH | `/gl/bank-reconciliations/:id` | GL_PERMISSIONS.RECONCILE |
| POST | `/gl/bank-reconciliations/:id/complete` | GL_PERMISSIONS.RECONCILE |
| POST | `/gl/bank-reconciliations/:id/lines` | GL_PERMISSIONS.RECONCILE |
| DELETE | `/gl/bank-reconciliations/:id/lines/:lineId` | GL_PERMISSIONS.RECONCILE |
| PATCH | `/gl/bank-reconciliations/:id/lines/:lineId` | GL_PERMISSIONS.RECONCILE |
| GET | `/gl/bank-reconciliations/:id/unmatched` | GL_PERMISSIONS.RECONCILE |
| POST | `/gl/bank-transfers` | GL_PERMISSIONS.POST |
| GET | `/gl/cheques` | GL_PERMISSIONS.MANAGE_CHEQUES |
| POST | `/gl/cheques` | GL_PERMISSIONS.MANAGE_CHEQUES |
| GET | `/gl/cheques/:id` | GL_PERMISSIONS.MANAGE_CHEQUES |
| PATCH | `/gl/cheques/:id` | GL_PERMISSIONS.MANAGE_CHEQUES |
| POST | `/gl/cheques/:id/bounce` | GL_PERMISSIONS.MANAGE_CHEQUES |
| POST | `/gl/cheques/:id/cancel` | GL_PERMISSIONS.MANAGE_CHEQUES |
| POST | `/gl/cheques/:id/clear` | GL_PERMISSIONS.MANAGE_CHEQUES |
| POST | `/gl/cheques/:id/deposit` | GL_PERMISSIONS.MANAGE_CHEQUES |
| GET | `/gl/cheques/reports/pdc-due` | GL_PERMISSIONS.MANAGE_CHEQUES |
| GET | `/gl/mis/dashboard` | GL_PERMISSIONS.VIEW_REPORTS |
| GET | `/gl/mis/operational` | GL_PERMISSIONS.VIEW_REPORTS |
| GET | `/gl/mis/profitability` | GL_PERMISSIONS.VIEW_REPORTS |
| GET | `/gl/payments` | GL_PERMISSIONS.VIEW |
| POST | `/gl/payments` | GL_PERMISSIONS.MANAGE_PAYMENTS |
| DELETE | `/gl/payments/:id` | GL_PERMISSIONS.MANAGE_PAYMENTS |
| GET | `/gl/payments/:id` | GL_PERMISSIONS.VIEW |
| PATCH | `/gl/payments/:id` | GL_PERMISSIONS.MANAGE_PAYMENTS |
| POST | `/gl/payments/:id/allocations` | GL_PERMISSIONS.MANAGE_PAYMENTS |
| DELETE | `/gl/payments/:id/allocations/:allocationId` | GL_PERMISSIONS.MANAGE_PAYMENTS |
| POST | `/gl/payments/:id/cancel` | GL_PERMISSIONS.MANAGE_PAYMENTS |
| POST | `/gl/payments/:id/post` | GL_PERMISSIONS.MANAGE_PAYMENTS |
| POST | `/gl/payments/:id/remittance/send-email` | GL_PERMISSIONS.MANAGE_PAYMENTS |
| GET | `/gl/reports/balance-sheet` | GL_PERMISSIONS.VIEW_REPORTS |
| GET | `/gl/reports/cash-flow` | GL_PERMISSIONS.VIEW_REPORTS |
| GET | `/gl/reports/profit-and-loss` | GL_PERMISSIONS.VIEW_REPORTS |
| GET | `/gl/reports/trial-balance` | GL_PERMISSIONS.VIEW_REPORTS |
| GET | `/gl/reports/vat-return` | GL_PERMISSIONS.VIEW_REPORTS |
| GET | `/gl/saved-reports` | GL_PERMISSIONS.VIEW_REPORTS |
| POST | `/gl/saved-reports` | GL_PERMISSIONS.MANAGE_REPORTS |
| DELETE | `/gl/saved-reports/:id` | GL_PERMISSIONS.MANAGE_REPORTS |
| GET | `/gl/saved-reports/:id` | GL_PERMISSIONS.VIEW_REPORTS |
| PATCH | `/gl/saved-reports/:id` | GL_PERMISSIONS.MANAGE_REPORTS |
| GET | `/gl/vouchers` | GL_PERMISSIONS.VIEW |
| POST | `/gl/vouchers` | GL_PERMISSIONS.CREATE |
| DELETE | `/gl/vouchers/:id` | GL_PERMISSIONS.DELETE |
| GET | `/gl/vouchers/:id` | GL_PERMISSIONS.VIEW |
| PATCH | `/gl/vouchers/:id` | GL_PERMISSIONS.UPDATE |
| POST | `/gl/vouchers/:id/lines` | GL_PERMISSIONS.UPDATE |
| DELETE | `/gl/vouchers/:id/lines/:lineId` | GL_PERMISSIONS.UPDATE |
| PATCH | `/gl/vouchers/:id/lines/:lineId` | GL_PERMISSIONS.UPDATE |
| POST | `/gl/vouchers/:id/post` | GL_PERMISSIONS.POST |
| POST | `/gl/vouchers/:id/reverse` | GL_PERMISSIONS.REVERSE |
| PATCH | `/gl/vouchers/batch-status` | GL_PERMISSIONS.POST |
| GET | `/health` | _(none / public / role-only)_ |
| GET | `/health` | _(none / public / role-only)_ |
| GET | `/hr/absent-report` | HR_PERMISSIONS.VIEW |
| GET | `/hr/advances` | HR_PERMISSIONS.VIEW |
| POST | `/hr/advances` | HR_PERMISSIONS.MANAGE_LOANS |
| PATCH | `/hr/advances/:id/close` | HR_PERMISSIONS.MANAGE_LOANS |
| GET | `/hr/attendance` | HR_PERMISSIONS.VIEW |
| POST | `/hr/attendance/clock-in` | HR_PERMISSIONS.MANAGE_TIMESHEETS |
| POST | `/hr/attendance/clock-out` | HR_PERMISSIONS.MANAGE_TIMESHEETS |
| GET | `/hr/document-expiry/report` | HR_PERMISSIONS.VIEW |
| GET | `/hr/employees` | HR_PERMISSIONS.VIEW |
| POST | `/hr/employees` | HR_PERMISSIONS.MANAGE_EMPLOYEES |
| GET | `/hr/employees/:employeeId/gratuity` | HR_PERMISSIONS.VIEW |
| GET | `/hr/employees/:employeeId/leave-balances` | HR_PERMISSIONS.VIEW |
| POST | `/hr/employees/:employeeId/leave-encashment` | HR_PERMISSIONS.MANAGE_LEAVE |
| DELETE | `/hr/employees/:id` | HR_PERMISSIONS.MANAGE_EMPLOYEES |
| GET | `/hr/employees/:id` | HR_PERMISSIONS.VIEW |
| PATCH | `/hr/employees/:id` | HR_PERMISSIONS.MANAGE_EMPLOYEES |
| GET | `/hr/employees/:id/dependents` | HR_PERMISSIONS.VIEW |
| POST | `/hr/employees/:id/dependents` | HR_PERMISSIONS.MANAGE_EMPLOYEES |
| GET | `/hr/employees/:id/documents` | HR_PERMISSIONS.VIEW |
| POST | `/hr/employees/:id/documents` | HR_PERMISSIONS.MANAGE_EMPLOYEES |
| DELETE | `/hr/employees/:id/documents/:docId` | HR_PERMISSIONS.MANAGE_EMPLOYEES |
| GET | `/hr/employees/:id/employment-history` | HR_PERMISSIONS.VIEW |
| POST | `/hr/employees/:id/employment-history` | HR_PERMISSIONS.MANAGE_EMPLOYEES |
| POST | `/hr/employees/:id/link-user` | HR_PERMISSIONS.MANAGE_EMPLOYEES |
| GET | `/hr/employees/:id/qualifications` | HR_PERMISSIONS.VIEW |
| POST | `/hr/employees/:id/qualifications` | HR_PERMISSIONS.MANAGE_EMPLOYEES |
| GET | `/hr/employees/:id/skills` | HR_PERMISSIONS.VIEW |
| POST | `/hr/employees/:id/skills` | HR_PERMISSIONS.MANAGE_EMPLOYEES |
| GET | `/hr/evaluation-cycles` | HR_PERMISSIONS.VIEW |
| POST | `/hr/evaluation-cycles` | HR_PERMISSIONS.MANAGE_EVALUATIONS |
| GET | `/hr/evaluation-templates` | HR_PERMISSIONS.VIEW |
| POST | `/hr/evaluation-templates` | HR_PERMISSIONS.MANAGE_EVALUATIONS |
| PATCH | `/hr/evaluation-templates/:id` | HR_PERMISSIONS.MANAGE_EVALUATIONS |
| GET | `/hr/evaluations` | HR_PERMISSIONS.VIEW |
| POST | `/hr/evaluations` | HR_PERMISSIONS.MANAGE_EVALUATIONS |
| POST | `/hr/evaluations/:id/finalize` | HR_PERMISSIONS.MANAGE_EVALUATIONS |
| POST | `/hr/evaluations/:id/submit-manager` | HR_PERMISSIONS.MANAGE_EVALUATIONS |
| POST | `/hr/evaluations/:id/submit-self` | HR_PERMISSIONS.VIEW_SELF |
| GET | `/hr/gratuity` | HR_PERMISSIONS.VIEW |
| GET | `/hr/leave-calendar` | HR_PERMISSIONS.VIEW |
| GET | `/hr/leave-policies` | HR_PERMISSIONS.VIEW |
| POST | `/hr/leave-policies` | HR_PERMISSIONS.MANAGE_LEAVE |
| DELETE | `/hr/leave-policies/:id` | HR_PERMISSIONS.MANAGE_LEAVE |
| PATCH | `/hr/leave-policies/:id` | HR_PERMISSIONS.MANAGE_LEAVE |
| GET | `/hr/leave-requests` | HR_PERMISSIONS.VIEW |
| POST | `/hr/leave-requests` | HR_PERMISSIONS.MANAGE_LEAVE |
| PATCH | `/hr/leave-requests/:id/approve` | HR_PERMISSIONS.APPROVE_LEAVE |
| PATCH | `/hr/leave-requests/:id/reject` | HR_PERMISSIONS.APPROVE_LEAVE |
| PATCH | `/hr/leave-requests/:id/return` | HR_PERMISSIONS.APPROVE_LEAVE |
| PATCH | `/hr/leave-requests/:id/review` | HR_PERMISSIONS.APPROVE_LEAVE |
| GET | `/hr/letters` | HR_PERMISSIONS.VIEW |
| GET | `/hr/letters/:id` | HR_PERMISSIONS.VIEW |
| POST | `/hr/letters/generate` | HR_PERMISSIONS.GENERATE_LETTERS |
| GET | `/hr/loans` | HR_PERMISSIONS.VIEW |
| POST | `/hr/loans` | HR_PERMISSIONS.MANAGE_LOANS |
| PATCH | `/hr/loans/:id/approve` | HR_PERMISSIONS.MANAGE_LOANS |
| PATCH | `/hr/loans/:id/reject` | HR_PERMISSIONS.MANAGE_LOANS |
| PATCH | `/hr/loans/:id/review` | HR_PERMISSIONS.MANAGE_LOANS |
| GET | `/hr/loans/:id/schedule` | HR_PERMISSIONS.VIEW |
| GET | `/hr/loans/outstanding-report` | HR_PERMISSIONS.VIEW |
| POST | `/hr/payroll-gl-settings` | HR_PERMISSIONS.MANAGE_PAYROLL |
| GET | `/hr/payroll-runs` | HR_PERMISSIONS.VIEW |
| POST | `/hr/payroll-runs` | HR_PERMISSIONS.MANAGE_PAYROLL |
| GET | `/hr/payroll-runs/:id` | HR_PERMISSIONS.VIEW |
| POST | `/hr/payroll-runs/:id/finalize` | HR_PERMISSIONS.MANAGE_PAYROLL |
| POST | `/hr/payroll-runs/:id/generate` | HR_PERMISSIONS.MANAGE_PAYROLL |
| POST | `/hr/payroll-runs/:id/generate-lines` | HR_PERMISSIONS.MANAGE_PAYROLL |
| POST | `/hr/payroll-runs/:id/post-gl` | HR_PERMISSIONS.MANAGE_PAYROLL |
| GET | `/hr/payroll-runs/:id/wps-export` | HR_PERMISSIONS.MANAGE_PAYROLL |
| GET | `/hr/payroll-runs/:id/wps-sif` | HR_PERMISSIONS.MANAGE_PAYROLL |
| POST | `/hr/payroll-runs/:runId/payslips/:employeeId` | HR_PERMISSIONS.MANAGE_PAYROLL |
| POST | `/hr/payroll-runs/:runId/payslips/:employeeId/email` | HR_PERMISSIONS.MANAGE_PAYROLL |
| GET | `/hr/salary-components` | HR_PERMISSIONS.VIEW |
| POST | `/hr/salary-components` | HR_PERMISSIONS.MANAGE_PAYROLL |
| POST | `/hr/salary-components/seed` | HR_PERMISSIONS.MANAGE_PAYROLL |
| GET | `/hr/timesheets` | HR_PERMISSIONS.VIEW |
| POST | `/hr/timesheets` | HR_PERMISSIONS.MANAGE_TIMESHEETS |
| DELETE | `/hr/timesheets/:id` | HR_PERMISSIONS.MANAGE_TIMESHEETS |
| PATCH | `/hr/timesheets/:id` | HR_PERMISSIONS.MANAGE_TIMESHEETS |
| POST | `/hr/timesheets/:id/approve` | HR_PERMISSIONS.MANAGE_TIMESHEETS |
| POST | `/hr/timesheets/export-payroll-ot` | HR_PERMISSIONS.MANAGE_PAYROLL |
| POST | `/hr/timesheets/export-to-payroll` | HR_PERMISSIONS.MANAGE_PAYROLL |
| GET | `/hr/timesheets/missing-report` | HR_PERMISSIONS.VIEW |
| GET | `/invoices` | INVOICES_PERMISSIONS.VIEW |
| POST | `/invoices` | INVOICES_PERMISSIONS.CREATE |
| DELETE | `/invoices/:id` | INVOICES_PERMISSIONS.DELETE |
| GET | `/invoices/:id` | INVOICES_PERMISSIONS.VIEW |
| PATCH | `/invoices/:id` | INVOICES_PERMISSIONS.UPDATE |
| POST | `/invoices/:id/cancel` | INVOICES_PERMISSIONS.UPDATE |
| POST | `/invoices/:id/lines` | INVOICES_PERMISSIONS.UPDATE |
| DELETE | `/invoices/:id/lines/:lineId` | INVOICES_PERMISSIONS.UPDATE |
| PATCH | `/invoices/:id/lines/:lineId` | INVOICES_PERMISSIONS.UPDATE |
| GET | `/invoices/:id/pdf` | INVOICES_PERMISSIONS.VIEW |
| POST | `/invoices/:id/pdf` | INVOICES_PERMISSIONS.VIEW |
| POST | `/invoices/:id/post` | INVOICES_PERMISSIONS.POST |
| POST | `/invoices/:id/send` | INVOICES_PERMISSIONS.SEND |
| POST | `/invoices/from-job/:jobId` | INVOICES_PERMISSIONS.CREATE |
| GET | `/invoices/reports/overdue` | INVOICES_PERMISSIONS.VIEW |
| GET | `/job-offers` | JOBS_PERMISSIONS.VIEW |
| POST | `/job-offers` | JOBS_PERMISSIONS.UPDATE |
| GET | `/job-offers/:id` | JOBS_PERMISSIONS.VIEW |
| POST | `/job-offers/:id/approve` | JOBS_PERMISSIONS.UPDATE |
| POST | `/job-offers/:id/disapprove` | JOBS_PERMISSIONS.UPDATE |
| GET | `/job-offers/:id/negotiation` | JOBS_PERMISSIONS.VIEW |
| POST | `/job-offers/:id/negotiation/accept` | JOBS_PERMISSIONS.UPDATE |
| POST | `/job-offers/:id/negotiation/reject` | JOBS_PERMISSIONS.UPDATE |
| POST | `/job-offers/:id/revise-and-send` | JOBS_PERMISSIONS.UPDATE |
| GET | `/jobs` | JOBS_PERMISSIONS.VIEW |
| GET | `/jobs` | JOBS_PERMISSIONS.VIEW |
| POST | `/jobs` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs` | JOBS_PERMISSIONS.CREATE |
| POST | `/jobs` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs` | JOBS_PERMISSIONS.UPDATE |
| DELETE | `/jobs/:id` | JOBS_PERMISSIONS.DELETE |
| GET | `/jobs/:id` | JOBS_PERMISSIONS.VIEW |
| PATCH | `/jobs/:id` | JOBS_PERMISSIONS.UPDATE |
| PATCH | `/jobs/:id/air-details` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/air-transhipment-link` | JOBS_PERMISSIONS.UPDATE |
| GET | `/jobs/:id/bills-of-lading` | JOBS_PERMISSIONS.VIEW |
| POST | `/jobs/:id/bills-of-lading` | JOBS_PERMISSIONS.UPDATE |
| DELETE | `/jobs/:id/bills-of-lading/:blId` | JOBS_PERMISSIONS.UPDATE |
| PATCH | `/jobs/:id/bills-of-lading/:blId` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/cancel` | JOBS_PERMISSIONS.UPDATE |
| GET | `/jobs/:id/cargo` | JOBS_PERMISSIONS.VIEW |
| POST | `/jobs/:id/cargo` | JOBS_PERMISSIONS.UPDATE |
| DELETE | `/jobs/:id/cargo/:cargoId` | JOBS_PERMISSIONS.UPDATE |
| PATCH | `/jobs/:id/cargo/:cargoId` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/cfs-storage/calculate` | JOBS_PERMISSIONS.VIEW |
| POST | `/jobs/:id/charges` | JOBS_PERMISSIONS.UPDATE |
| DELETE | `/jobs/:id/charges/:chargeId` | JOBS_PERMISSIONS.UPDATE |
| PATCH | `/jobs/:id/charges/:chargeId` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/close` | JOBS_PERMISSIONS.CLOSE |
| GET | `/jobs/:id/containers` | JOBS_PERMISSIONS.VIEW |
| POST | `/jobs/:id/containers` | JOBS_PERMISSIONS.UPDATE |
| DELETE | `/jobs/:id/containers/:containerId` | JOBS_PERMISSIONS.UPDATE |
| PATCH | `/jobs/:id/containers/:containerId` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/containers/:containerId/cargo` | JOBS_PERMISSIONS.UPDATE |
| GET | `/jobs/:id/containers/:containerId/fill` | JOBS_PERMISSIONS.VIEW |
| POST | `/jobs/:id/containers/:containerId/return` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/containers/:containerId/split` | JOBS_PERMISSIONS.UPDATE |
| GET | `/jobs/:id/containers/fill` | JOBS_PERMISSIONS.VIEW |
| PATCH | `/jobs/:id/courier-details` | JOBS_PERMISSIONS.UPDATE |
| GET | `/jobs/:id/courier/checkpoints` | JOBS_PERMISSIONS.VIEW |
| POST | `/jobs/:id/courier/confirm-booking` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/courier/link-export` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/courier/link-import` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/courier/pod` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/courier/scan-checkpoint` | JOBS_PERMISSIONS.UPDATE |
| GET | `/jobs/:id/customs-examinations` | JOBS_PERMISSIONS.VIEW |
| POST | `/jobs/:id/customs-examinations` | JOBS_PERMISSIONS.UPDATE |
| PATCH | `/jobs/:id/customs-status` | JOBS_PERMISSIONS.UPDATE |
| GET | `/jobs/:id/cutoffs` | JOBS_PERMISSIONS.VIEW |
| GET | `/jobs/:id/damage-reports` | JOBS_PERMISSIONS.VIEW |
| POST | `/jobs/:id/damage-reports` | JOBS_PERMISSIONS.UPDATE |
| GET | `/jobs/:id/deposits` | JOBS_PERMISSIONS.VIEW |
| POST | `/jobs/:id/deposits` | JOBS_PERMISSIONS.UPDATE |
| DELETE | `/jobs/:id/deposits/:depositId` | JOBS_PERMISSIONS.UPDATE |
| PATCH | `/jobs/:id/deposits/:depositId` | JOBS_PERMISSIONS.UPDATE |
| GET | `/jobs/:id/documents` | JOBS_PERMISSIONS.VIEW |
| POST | `/jobs/:id/documents` | JOBS_PERMISSIONS.UPDATE |
| DELETE | `/jobs/:id/documents/:documentId` | JOBS_PERMISSIONS.UPDATE |
| PATCH | `/jobs/:id/documents/:documentId` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/documents/:documentId/finalize` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/documents/back-to-back-bl` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/documents/barcode-label` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/documents/can` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/documents/cargo-manifest` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/documents/consignee-label` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/documents/courier-report` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/documents/cross-border-declaration` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/documents/customs-transit` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/documents/delivery-note` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/documents/delivery-order` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/documents/e-awb` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/documents/exchange-letter` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/documents/fiata-bl` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/documents/freight-certificate` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/documents/freight-manifest` | JOBS_PERMISSIONS.UPDATE |
| GET | `/jobs/:id/documents/generation-status` | JOBS_PERMISSIONS.VIEW |
| POST | `/jobs/:id/documents/hawb` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/documents/hbl` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/documents/hbl-express-release` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/documents/job-card` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/documents/job-costing` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/documents/job-pnl` | JOBS_PERMISSIONS.VIEW_GP |
| POST | `/jobs/:id/documents/mawb` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/documents/mbl` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/documents/pre-alert` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/documents/pre-can` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/documents/proforma-invoice` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/documents/proof-of-delivery` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/documents/proxy-bl` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/documents/rider-bl` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/documents/sailing-confirmation` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/documents/shipping-advice` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/documents/si` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/documents/stuffing-report` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/documents/surrender-notice` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/documents/switch-bl` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/documents/transhipment-confirmation` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/documents/transport-request` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/documents/undertake-letter` | JOBS_PERMISSIONS.UPDATE |
| GET | `/jobs/:id/free-days` | JOBS_PERMISSIONS.VIEW |
| POST | `/jobs/:id/free-days` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/free-days/recalculate` | JOBS_PERMISSIONS.UPDATE |
| GET | `/jobs/:id/house-jobs` | JOBS_PERMISSIONS.VIEW |
| POST | `/jobs/:id/import-notices/can/send` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/import-notices/do/send` | JOBS_PERMISSIONS.UPDATE |
| PATCH | `/jobs/:id/land-details` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/land/assign-trucker` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/land/border-crossing` | JOBS_PERMISSIONS.UPDATE |
| PATCH | `/jobs/:id/land/cross-border` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/land/pickup` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/land/pod` | JOBS_PERMISSIONS.UPDATE |
| GET | `/jobs/:id/lcl-consolidation` | JOBS_PERMISSIONS.VIEW |
| POST | `/jobs/:id/lcl/attach-house` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/lcl/cfs-storage-invoice` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/lcl/cfs-storage/calculate` | JOBS_PERMISSIONS.VIEW |
| POST | `/jobs/:id/lcl/detach-house/:houseJobId` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/lcl/milestones/cargo-received-at-cfs` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/lcl/milestones/cfs-devanning-completed` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/lcl/milestones/cfs-stuffing-completed` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/lcl/milestones/consolidation-started` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/lcl/transhipment-link` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/lcl/wms-storage-link` | JOBS_PERMISSIONS.UPDATE |
| GET | `/jobs/:id/milestones` | JOBS_PERMISSIONS.VIEW |
| POST | `/jobs/:id/milestones` | JOBS_PERMISSIONS.UPDATE |
| PATCH | `/jobs/:id/milestones/:milestoneId` | JOBS_PERMISSIONS.UPDATE |
| GET | `/jobs/:id/notes` | JOBS_PERMISSIONS.VIEW |
| POST | `/jobs/:id/notes` | JOBS_PERMISSIONS.UPDATE |
| DELETE | `/jobs/:id/notes/:noteId` | JOBS_PERMISSIONS.UPDATE |
| PATCH | `/jobs/:id/notes/:noteId` | JOBS_PERMISSIONS.UPDATE |
| GET | `/jobs/:id/part-deliveries` | JOBS_PERMISSIONS.VIEW |
| POST | `/jobs/:id/part-deliveries` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/payment-requests` | JOBS_PERMISSIONS.UPDATE |
| GET | `/jobs/:id/pnl` | JOBS_PERMISSIONS.VIEW_GP |
| GET | `/jobs/:id/pods` | JOBS_PERMISSIONS.VIEW |
| POST | `/jobs/:id/pods` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/pre-alert/schedule` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/pre-alert/send` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/prorate-cost/:chargeCodeId` | JOBS_PERMISSIONS.UPDATE |
| PATCH | `/jobs/:id/sea-fcl-details` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/sea-fcl-details/si-submission` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/sea-fcl-details/vgm-submission` | JOBS_PERMISSIONS.UPDATE |
| PATCH | `/jobs/:id/sea-lcl-details` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/sea-lcl-details/si-submission` | JOBS_PERMISSIONS.UPDATE |
| GET | `/jobs/:id/sea-scans` | JOBS_PERMISSIONS.VIEW |
| POST | `/jobs/:id/sea-scans` | JOBS_PERMISSIONS.UPDATE |
| GET | `/jobs/:id/storage-calculation` | JOBS_PERMISSIONS.VIEW |
| POST | `/jobs/:id/storage-invoice` | JOBS_PERMISSIONS.UPDATE |
| GET | `/jobs/:id/stuffing-records` | JOBS_PERMISSIONS.VIEW |
| POST | `/jobs/:id/stuffing-records` | JOBS_PERMISSIONS.UPDATE |
| DELETE | `/jobs/:id/stuffing-records/:recordId` | JOBS_PERMISSIONS.UPDATE |
| PATCH | `/jobs/:id/stuffing-records/:recordId` | JOBS_PERMISSIONS.UPDATE |
| GET | `/jobs/:id/sub-jobs` | JOBS_PERMISSIONS.VIEW |
| POST | `/jobs/:id/sub-jobs` | JOBS_PERMISSIONS.CREATE |
| POST | `/jobs/:id/transhipment-link` | JOBS_PERMISSIONS.UPDATE |
| GET | `/jobs/:id/transport-requests` | JOBS_PERMISSIONS.VIEW |
| POST | `/jobs/:id/transport-requests` | JOBS_PERMISSIONS.UPDATE |
| POST | `/jobs/:id/whatsapp/status` | JOBS_PERMISSIONS.UPDATE |
| GET | `/jobs/dashboard-counts` | JOBS_PERMISSIONS.VIEW |
| GET | `/jobs/job-offers` | JOBS_PERMISSIONS.VIEW |
| POST | `/jobs/job-offers` | JOBS_PERMISSIONS.UPDATE |
| GET | `/jobs/kpi-weekly` | JOBS_PERMISSIONS.VIEW |
| GET | `/jobs/team-workload` | JOBS_PERMISSIONS.VIEW |
| GET | `/locale/:countryCode` | _(none / public / role-only)_ |
| GET | `/locale/defaults` | _(none / public / role-only)_ |
| GET | `/masters/airlines` | MASTERS_PERMISSIONS.VIEW |
| POST | `/masters/airlines` | MASTERS_PERMISSIONS.CREATE |
| DELETE | `/masters/airlines/:id` | MASTERS_PERMISSIONS.DELETE |
| GET | `/masters/airlines/:id` | MASTERS_PERMISSIONS.VIEW |
| PATCH | `/masters/airlines/:id` | MASTERS_PERMISSIONS.UPDATE |
| GET | `/masters/airports` | MASTERS_PERMISSIONS.VIEW |
| POST | `/masters/airports` | MASTERS_PERMISSIONS.CREATE |
| DELETE | `/masters/airports/:id` | MASTERS_PERMISSIONS.DELETE |
| GET | `/masters/airports/:id` | MASTERS_PERMISSIONS.VIEW |
| PATCH | `/masters/airports/:id` | MASTERS_PERMISSIONS.UPDATE |
| POST | `/masters/airports/seed-defaults` | MASTERS_PERMISSIONS.CREATE |
| GET | `/masters/banks` | MASTERS_PERMISSIONS.VIEW |
| POST | `/masters/banks` | MASTERS_PERMISSIONS.CREATE |
| DELETE | `/masters/banks/:id` | MASTERS_PERMISSIONS.DELETE |
| GET | `/masters/banks/:id` | MASTERS_PERMISSIONS.VIEW |
| PATCH | `/masters/banks/:id` | MASTERS_PERMISSIONS.UPDATE |
| GET | `/masters/branches` | MASTERS_PERMISSIONS.VIEW |
| POST | `/masters/branches` | MASTERS_PERMISSIONS.CREATE |
| DELETE | `/masters/branches/:id` | MASTERS_PERMISSIONS.DELETE |
| GET | `/masters/branches/:id` | MASTERS_PERMISSIONS.VIEW |
| PATCH | `/masters/branches/:id` | MASTERS_PERMISSIONS.UPDATE |
| GET | `/masters/charge-codes` | MASTERS_PERMISSIONS.VIEW |
| POST | `/masters/charge-codes` | MASTERS_PERMISSIONS.CREATE |
| DELETE | `/masters/charge-codes/:id` | MASTERS_PERMISSIONS.DELETE |
| GET | `/masters/charge-codes/:id` | MASTERS_PERMISSIONS.VIEW |
| PATCH | `/masters/charge-codes/:id` | MASTERS_PERMISSIONS.UPDATE |
| GET | `/masters/container-types` | MASTERS_PERMISSIONS.VIEW |
| POST | `/masters/container-types` | MASTERS_PERMISSIONS.CREATE |
| DELETE | `/masters/container-types/:id` | MASTERS_PERMISSIONS.DELETE |
| GET | `/masters/container-types/:id` | MASTERS_PERMISSIONS.VIEW |
| PATCH | `/masters/container-types/:id` | MASTERS_PERMISSIONS.UPDATE |
| GET | `/masters/countries` | MASTERS_PERMISSIONS.VIEW |
| POST | `/masters/countries` | MASTERS_PERMISSIONS.CREATE |
| DELETE | `/masters/countries/:id` | MASTERS_PERMISSIONS.DELETE |
| GET | `/masters/countries/:id` | MASTERS_PERMISSIONS.VIEW |
| PATCH | `/masters/countries/:id` | MASTERS_PERMISSIONS.UPDATE |
| GET | `/masters/courier-vendors` | MASTERS_PERMISSIONS.VIEW |
| POST | `/masters/courier-vendors` | MASTERS_PERMISSIONS.CREATE |
| DELETE | `/masters/courier-vendors/:id` | MASTERS_PERMISSIONS.DELETE |
| GET | `/masters/courier-vendors/:id` | MASTERS_PERMISSIONS.VIEW |
| PATCH | `/masters/courier-vendors/:id` | MASTERS_PERMISSIONS.UPDATE |
| GET | `/masters/currencies` | MASTERS_PERMISSIONS.VIEW |
| POST | `/masters/currencies` | MASTERS_PERMISSIONS.CREATE |
| DELETE | `/masters/currencies/:id` | MASTERS_PERMISSIONS.DELETE |
| GET | `/masters/currencies/:id` | MASTERS_PERMISSIONS.VIEW |
| PATCH | `/masters/currencies/:id` | MASTERS_PERMISSIONS.UPDATE |
| GET | `/masters/departments` | MASTERS_PERMISSIONS.VIEW |
| POST | `/masters/departments` | MASTERS_PERMISSIONS.CREATE |
| DELETE | `/masters/departments/:id` | MASTERS_PERMISSIONS.DELETE |
| GET | `/masters/departments/:id` | MASTERS_PERMISSIONS.VIEW |
| PATCH | `/masters/departments/:id` | MASTERS_PERMISSIONS.UPDATE |
| GET | `/masters/designations` | MASTERS_PERMISSIONS.VIEW |
| POST | `/masters/designations` | MASTERS_PERMISSIONS.CREATE |
| DELETE | `/masters/designations/:id` | MASTERS_PERMISSIONS.DELETE |
| GET | `/masters/designations/:id` | MASTERS_PERMISSIONS.VIEW |
| PATCH | `/masters/designations/:id` | MASTERS_PERMISSIONS.UPDATE |
| GET | `/masters/exchange-rates` | MASTERS_PERMISSIONS.VIEW |
| POST | `/masters/exchange-rates` | MASTERS_PERMISSIONS.CREATE |
| GET | `/masters/exchange-rates/latest/:currencyId` | MASTERS_PERMISSIONS.VIEW |
| GET | `/masters/holidays` | MASTERS_PERMISSIONS.VIEW |
| POST | `/masters/holidays` | MASTERS_PERMISSIONS.CREATE |
| DELETE | `/masters/holidays/:id` | MASTERS_PERMISSIONS.DELETE |
| GET | `/masters/holidays/:id` | MASTERS_PERMISSIONS.VIEW |
| PATCH | `/masters/holidays/:id` | MASTERS_PERMISSIONS.UPDATE |
| GET | `/masters/hs-codes` | MASTERS_PERMISSIONS.VIEW |
| POST | `/masters/hs-codes` | MASTERS_PERMISSIONS.CREATE |
| DELETE | `/masters/hs-codes/:id` | MASTERS_PERMISSIONS.DELETE |
| GET | `/masters/hs-codes/:id` | MASTERS_PERMISSIONS.VIEW |
| PATCH | `/masters/hs-codes/:id` | MASTERS_PERMISSIONS.UPDATE |
| GET | `/masters/ports` | MASTERS_PERMISSIONS.VIEW |
| POST | `/masters/ports` | MASTERS_PERMISSIONS.CREATE |
| DELETE | `/masters/ports/:id` | MASTERS_PERMISSIONS.DELETE |
| GET | `/masters/ports/:id` | MASTERS_PERMISSIONS.VIEW |
| PATCH | `/masters/ports/:id` | MASTERS_PERMISSIONS.UPDATE |
| POST | `/masters/ports/seed-defaults` | MASTERS_PERMISSIONS.CREATE |
| GET | `/masters/shipping-lines` | MASTERS_PERMISSIONS.VIEW |
| POST | `/masters/shipping-lines` | MASTERS_PERMISSIONS.CREATE |
| DELETE | `/masters/shipping-lines/:id` | MASTERS_PERMISSIONS.DELETE |
| GET | `/masters/shipping-lines/:id` | MASTERS_PERMISSIONS.VIEW |
| PATCH | `/masters/shipping-lines/:id` | MASTERS_PERMISSIONS.UPDATE |
| GET | `/masters/tax-rates` | MASTERS_PERMISSIONS.VIEW |
| POST | `/masters/tax-rates` | MASTERS_PERMISSIONS.CREATE |
| DELETE | `/masters/tax-rates/:id` | MASTERS_PERMISSIONS.DELETE |
| GET | `/masters/tax-rates/:id` | MASTERS_PERMISSIONS.VIEW |
| PATCH | `/masters/tax-rates/:id` | MASTERS_PERMISSIONS.UPDATE |
| GET | `/masters/truckers` | MASTERS_PERMISSIONS.VIEW |
| POST | `/masters/truckers` | MASTERS_PERMISSIONS.CREATE |
| DELETE | `/masters/truckers/:id` | MASTERS_PERMISSIONS.DELETE |
| GET | `/masters/truckers/:id` | MASTERS_PERMISSIONS.VIEW |
| PATCH | `/masters/truckers/:id` | MASTERS_PERMISSIONS.UPDATE |
| GET | `/masters/units-of-measure` | MASTERS_PERMISSIONS.VIEW |
| POST | `/masters/units-of-measure` | MASTERS_PERMISSIONS.CREATE |
| DELETE | `/masters/units-of-measure/:id` | MASTERS_PERMISSIONS.DELETE |
| GET | `/masters/units-of-measure/:id` | MASTERS_PERMISSIONS.VIEW |
| PATCH | `/masters/units-of-measure/:id` | MASTERS_PERMISSIONS.UPDATE |
| GET | `/masters/vessels` | MASTERS_PERMISSIONS.VIEW |
| POST | `/masters/vessels` | MASTERS_PERMISSIONS.CREATE |
| DELETE | `/masters/vessels/:id` | MASTERS_PERMISSIONS.DELETE |
| GET | `/masters/vessels/:id` | MASTERS_PERMISSIONS.VIEW |
| PATCH | `/masters/vessels/:id` | MASTERS_PERMISSIONS.UPDATE |
| GET | `/masters/warehouses` | MASTERS_PERMISSIONS.VIEW |
| POST | `/masters/warehouses` | MASTERS_PERMISSIONS.CREATE |
| DELETE | `/masters/warehouses/:id` | MASTERS_PERMISSIONS.DELETE |
| GET | `/masters/warehouses/:id` | MASTERS_PERMISSIONS.VIEW |
| PATCH | `/masters/warehouses/:id` | MASTERS_PERMISSIONS.UPDATE |
| GET | `/notifications` | NOTIFICATIONS_PERMISSIONS.VIEW |
| POST | `/notifications/:id/read` | NOTIFICATIONS_PERMISSIONS.VIEW |
| POST | `/notifications/read-all` | NOTIFICATIONS_PERMISSIONS.VIEW |
| GET | `/notifications/unread-count` | NOTIFICATIONS_PERMISSIONS.VIEW |
| GET | `/nvocc/bookings` | NVOCC_PERMISSIONS.VIEW |
| POST | `/nvocc/bookings` | NVOCC_PERMISSIONS.MANAGE |
| DELETE | `/nvocc/bookings/:id` | NVOCC_PERMISSIONS.MANAGE |
| GET | `/nvocc/bookings/:id` | NVOCC_PERMISSIONS.VIEW |
| PATCH | `/nvocc/bookings/:id` | NVOCC_PERMISSIONS.MANAGE |
| POST | `/nvocc/bookings/:id/cancel` | NVOCC_PERMISSIONS.MANAGE |
| POST | `/nvocc/bookings/:id/confirm` | NVOCC_PERMISSIONS.MANAGE |
| POST | `/nvocc/bookings/:id/convert-to-job` | NVOCC_PERMISSIONS.MANAGE |
| POST | `/nvocc/bookings/:id/documents/booking-confirmation` | NVOCC_PERMISSIONS.MANAGE |
| POST | `/nvocc/bookings/:id/send-cutoff-reminder` | NVOCC_PERMISSIONS.MANAGE |
| GET | `/nvocc/enquiries` | NVOCC_PERMISSIONS.VIEW |
| POST | `/nvocc/enquiries` | NVOCC_PERMISSIONS.MANAGE |
| DELETE | `/nvocc/enquiries/:id` | NVOCC_PERMISSIONS.MANAGE |
| GET | `/nvocc/enquiries/:id` | NVOCC_PERMISSIONS.VIEW |
| PATCH | `/nvocc/enquiries/:id` | NVOCC_PERMISSIONS.MANAGE |
| POST | `/nvocc/enquiries/:id/convert-to-booking` | NVOCC_PERMISSIONS.MANAGE |
| POST | `/nvocc/enquiries/:id/mark-lost` | NVOCC_PERMISSIONS.MANAGE |
| POST | `/nvocc/enquiries/:id/send-rate` | NVOCC_PERMISSIONS.MANAGE |
| GET | `/nvocc/enquiries/analytics` | NVOCC_PERMISSIONS.VIEW |
| POST | `/nvocc/jobs/:id/documents/booking-confirmation` | NVOCC_PERMISSIONS.MANAGE |
| POST | `/nvocc/jobs/:id/documents/can` | NVOCC_PERMISSIONS.MANAGE |
| POST | `/nvocc/jobs/:id/documents/cargo-manifest` | NVOCC_PERMISSIONS.MANAGE |
| POST | `/nvocc/jobs/:id/documents/delivery-order` | NVOCC_PERMISSIONS.MANAGE |
| GET | `/nvocc/jobs/:id/documents/generation-status` | NVOCC_PERMISSIONS.VIEW |
| POST | `/nvocc/jobs/:id/documents/hbl-draft` | NVOCC_PERMISSIONS.MANAGE |
| POST | `/nvocc/jobs/:id/documents/hbl-express-release` | NVOCC_PERMISSIONS.MANAGE |
| POST | `/nvocc/jobs/:id/documents/hbl-original` | NVOCC_PERMISSIONS.MANAGE |
| POST | `/nvocc/jobs/:id/documents/job-card` | NVOCC_PERMISSIONS.MANAGE |
| POST | `/nvocc/jobs/:id/documents/job-pnl` | NVOCC_PERMISSIONS.MANAGE |
| POST | `/nvocc/jobs/:id/documents/mbl` | NVOCC_PERMISSIONS.MANAGE |
| POST | `/nvocc/jobs/:id/documents/pre-alert` | NVOCC_PERMISSIONS.MANAGE |
| POST | `/nvocc/jobs/:id/documents/pre-can` | NVOCC_PERMISSIONS.MANAGE |
| POST | `/nvocc/jobs/:id/documents/proforma-invoice` | NVOCC_PERMISSIONS.MANAGE |
| POST | `/nvocc/jobs/:id/documents/stuffing-report` | NVOCC_PERMISSIONS.MANAGE |
| POST | `/nvocc/jobs/:id/documents/surrender-notice` | NVOCC_PERMISSIONS.MANAGE |
| PATCH | `/nvocc/jobs/:id/mbl-received` | NVOCC_PERMISSIONS.MANAGE |
| POST | `/nvocc/jobs/:id/pod/received` | NVOCC_PERMISSIONS.MANAGE |
| POST | `/nvocc/jobs/:id/pre-alert/send` | NVOCC_PERMISSIONS.MANAGE |
| POST | `/nvocc/jobs/:id/si/submit` | NVOCC_PERMISSIONS.MANAGE |
| POST | `/nvocc/jobs/:id/vgm/submit` | NVOCC_PERMISSIONS.MANAGE |
| GET | `/nvocc/reports/trade-lane-profitability` | NVOCC_PERMISSIONS.VIEW |
| GET | `/nvocc/tariffs` | NVOCC_PERMISSIONS.VIEW |
| POST | `/nvocc/tariffs` | NVOCC_PERMISSIONS.MANAGE |
| DELETE | `/nvocc/tariffs/:id` | NVOCC_PERMISSIONS.MANAGE |
| GET | `/nvocc/tariffs/:id` | NVOCC_PERMISSIONS.VIEW |
| PATCH | `/nvocc/tariffs/:id` | NVOCC_PERMISSIONS.MANAGE |
| GET | `/nvocc/tariffs/lookup` | NVOCC_PERMISSIONS.VIEW |
| GET | `/nvocc/voyages` | NVOCC_PERMISSIONS.VIEW |
| POST | `/nvocc/voyages` | NVOCC_PERMISSIONS.MANAGE |
| DELETE | `/nvocc/voyages/:id` | NVOCC_PERMISSIONS.MANAGE |
| GET | `/nvocc/voyages/:id` | NVOCC_PERMISSIONS.VIEW |
| PATCH | `/nvocc/voyages/:id` | NVOCC_PERMISSIONS.MANAGE |
| POST | `/nvocc/voyages/:id/close` | NVOCC_PERMISSIONS.MANAGE |
| POST | `/nvocc/voyages/:id/copy` | NVOCC_PERMISSIONS.MANAGE |
| GET | `/nvocc/voyages/:id/load-list` | NVOCC_PERMISSIONS.VIEW |
| POST | `/nvocc/voyages/:id/load-list/pdf` | NVOCC_PERMISSIONS.MANAGE |
| GET | `/nvocc/voyages/:id/load-list/weight-check` | NVOCC_PERMISSIONS.VIEW |
| POST | `/nvocc/voyages/:id/mark-sailed` | NVOCC_PERMISSIONS.MANAGE |
| GET | `/nvocc/voyages/:id/pnl` | NVOCC_PERMISSIONS.VIEW |
| POST | `/nvocc/voyages/:id/publish` | NVOCC_PERMISSIONS.MANAGE |
| PATCH | `/nvocc/voyages/:voyageId/load-list/:itemId` | NVOCC_PERMISSIONS.MANAGE |
| POST | `/nvocc/voyages/:voyageId/load-list/:itemId/assign-container` | NVOCC_PERMISSIONS.MANAGE |
| GET | `/nvocc/voyages/utilization` | NVOCC_PERMISSIONS.VIEW |
| GET | `/organization/bank-accounts` | _(none / public / role-only)_ |
| POST | `/organization/bank-accounts` | _(none / public / role-only)_ |
| DELETE | `/organization/bank-accounts/:id` | _(none / public / role-only)_ |
| GET | `/organization/bank-accounts/:id` | _(none / public / role-only)_ |
| PATCH | `/organization/bank-accounts/:id` | _(none / public / role-only)_ |
| GET | `/organization/number-formats` | _(none / public / role-only)_ |
| POST | `/organization/number-formats` | _(none / public / role-only)_ |
| GET | `/organization/number-formats/:documentType` | _(none / public / role-only)_ |
| PATCH | `/organization/number-formats/:documentType` | _(none / public / role-only)_ |
| GET | `/organization/number-formats/:documentType/preview` | _(none / public / role-only)_ |
| GET | `/organization/profile` | _(none / public / role-only)_ |
| PATCH | `/organization/profile` | _(none / public / role-only)_ |
| GET | `/parties` | PARTIES_PERMISSIONS.VIEW |
| GET | `/parties` | PORTAL_PERMISSIONS.VIEW_USERS |
| GET | `/parties` | VENDOR_PERMISSIONS.VIEW_USERS |
| POST | `/parties` | PARTIES_PERMISSIONS.CREATE |
| DELETE | `/parties/:id` | PARTIES_PERMISSIONS.DELETE |
| GET | `/parties/:id` | PARTIES_PERMISSIONS.VIEW |
| PATCH | `/parties/:id` | PARTIES_PERMISSIONS.UPDATE |
| POST | `/parties/:id/addresses` | PARTIES_PERMISSIONS.UPDATE |
| DELETE | `/parties/:id/addresses/:addressId` | PARTIES_PERMISSIONS.UPDATE |
| PATCH | `/parties/:id/addresses/:addressId` | PARTIES_PERMISSIONS.UPDATE |
| POST | `/parties/:id/contacts` | PARTIES_PERMISSIONS.UPDATE |
| DELETE | `/parties/:id/contacts/:contactId` | PARTIES_PERMISSIONS.UPDATE |
| PATCH | `/parties/:id/contacts/:contactId` | PARTIES_PERMISSIONS.UPDATE |
| PATCH | `/parties/:id/credit-status` | PARTIES_PERMISSIONS.MANAGE_CREDIT |
| POST | `/parties/:id/credit/summary/send-email` | PARTIES_PERMISSIONS.MANAGE_CREDIT |
| GET | `/parties/:id/edi-codes` | PARTIES_PERMISSIONS.VIEW |
| POST | `/parties/:id/edi-codes` | PARTIES_PERMISSIONS.UPDATE |
| GET | `/parties/:id/history` | PARTIES_PERMISSIONS.VIEW |
| GET | `/parties/:id/standard-charges` | PARTIES_PERMISSIONS.VIEW |
| POST | `/parties/:id/standard-charges` | PARTIES_PERMISSIONS.UPDATE |
| GET | `/parties/:partyId/portal-permissions` | PORTAL_PERMISSIONS.VIEW_PERMISSIONS |
| PUT | `/parties/:partyId/portal-permissions` | PORTAL_PERMISSIONS.MANAGE_PERMISSIONS |
| POST | `/parties/:partyId/portal-permissions/reset-defaults` | PORTAL_PERMISSIONS.MANAGE_PERMISSIONS |
| GET | `/parties/:partyId/portal-users` | PORTAL_PERMISSIONS.VIEW_USERS |
| POST | `/parties/:partyId/portal-users` | PORTAL_PERMISSIONS.MANAGE_USERS |
| POST | `/parties/:partyId/portal-users/:id/resend-invite` | PORTAL_PERMISSIONS.MANAGE_USERS |
| POST | `/parties/:partyId/portal-users/:id/reset-password` | PORTAL_PERMISSIONS.MANAGE_USERS |
| PATCH | `/parties/:partyId/portal-users/:id/status` | PORTAL_PERMISSIONS.MANAGE_USERS |
| GET | `/parties/:partyId/vendor-permissions` | VENDOR_PERMISSIONS.VIEW_PERMISSIONS |
| PUT | `/parties/:partyId/vendor-permissions` | VENDOR_PERMISSIONS.MANAGE_PERMISSIONS |
| GET | `/parties/:partyId/vendor-users` | VENDOR_PERMISSIONS.VIEW_USERS |
| POST | `/parties/:partyId/vendor-users` | VENDOR_PERMISSIONS.MANAGE_USERS |
| POST | `/parties/:partyId/vendor-users/:id/resend-invite` | VENDOR_PERMISSIONS.MANAGE_USERS |
| POST | `/parties/:partyId/vendor-users/:id/reset-password` | VENDOR_PERMISSIONS.MANAGE_USERS |
| PATCH | `/parties/:partyId/vendor-users/:id/status` | VENDOR_PERMISSIONS.MANAGE_USERS |
| GET | `/parties/export` | PARTIES_PERMISSIONS.VIEW |
| POST | `/parties/import` | PARTIES_PERMISSIONS.CREATE |
| PATCH | `/payment-proofs/:id/acknowledge` | INVOICES_PERMISSIONS.REVIEW_PAYMENT_PROOFS |
| GET | `/payment-proofs/:id/payment-proofs` | INVOICES_PERMISSIONS.VIEW |
| PATCH | `/payment-proofs/:id/reject` | INVOICES_PERMISSIONS.REVIEW_PAYMENT_PROOFS |
| GET | `/payment-requests` | INVOICES_PERMISSIONS.VIEW |
| POST | `/payment-requests` | INVOICES_PERMISSIONS.CREATE |
| DELETE | `/payment-requests/:id` | INVOICES_PERMISSIONS.DELETE |
| GET | `/payment-requests/:id` | INVOICES_PERMISSIONS.VIEW |
| PATCH | `/payment-requests/:id` | INVOICES_PERMISSIONS.UPDATE |
| POST | `/payment-requests/:id/approve` | INVOICES_PERMISSIONS.APPROVE_PAYMENT |
| POST | `/payment-requests/:id/mark-paid` | INVOICES_PERMISSIONS.APPROVE_PAYMENT |
| POST | `/payment-requests/:id/reject` | INVOICES_PERMISSIONS.APPROVE_PAYMENT |
| POST | `/portal/auth/accept-invite` | _(none / public / role-only)_ |
| POST | `/portal/auth/login` | _(none / public / role-only)_ |
| POST | `/portal/auth/logout` | _(none / public / role-only)_ |
| GET | `/portal/auth/me` | _(none / public / role-only)_ |
| POST | `/portal/auth/refresh` | _(none / public / role-only)_ |
| GET | `/portal/dashboard` | _(none / public / role-only)_ |
| GET | `/portal/documents` | _(none / public / role-only)_ |
| GET | `/portal/documents/invoices/:invoiceId/download` | _(none / public / role-only)_ |
| GET | `/portal/documents/jobs/:jobId/:docId/download` | _(none / public / role-only)_ |
| GET | `/portal/documents/permissions` | _(none / public / role-only)_ |
| GET | `/portal/documents/summary` | _(none / public / role-only)_ |
| GET | `/portal/invoices` | _(none / public / role-only)_ |
| GET | `/portal/invoices` | _(none / public / role-only)_ |
| GET | `/portal/invoices` | _(none / public / role-only)_ |
| GET | `/portal/invoices` | _(none / public / role-only)_ |
| GET | `/portal/invoices/:id` | _(none / public / role-only)_ |
| GET | `/portal/invoices/:id` | _(none / public / role-only)_ |
| GET | `/portal/invoices/:id` | _(none / public / role-only)_ |
| GET | `/portal/invoices/:id/payment-proofs` | _(none / public / role-only)_ |
| POST | `/portal/invoices/:id/payment-proofs` | _(none / public / role-only)_ |
| GET | `/portal/invoices/:id/pdf` | _(none / public / role-only)_ |
| GET | `/portal/invoices/aging` | _(none / public / role-only)_ |
| GET | `/portal/invoices/export.csv` | _(none / public / role-only)_ |
| GET | `/portal/invoices/open-items` | _(none / public / role-only)_ |
| GET | `/portal/invoices/statement` | _(none / public / role-only)_ |
| GET | `/portal/invoices/statement.pdf` | _(none / public / role-only)_ |
| GET | `/portal/invoices/summary` | _(none / public / role-only)_ |
| GET | `/portal/invoices/summary` | _(none / public / role-only)_ |
| GET | `/portal/invoices/summary` | _(none / public / role-only)_ |
| GET | `/portal/lookups/airports` | _(none / public / role-only)_ |
| GET | `/portal/lookups/ports` | _(none / public / role-only)_ |
| GET | `/portal/messages` | _(none / public / role-only)_ |
| GET | `/portal/messages` | _(none / public / role-only)_ |
| GET | `/portal/messages` | _(none / public / role-only)_ |
| POST | `/portal/messages` | _(none / public / role-only)_ |
| POST | `/portal/messages` | _(none / public / role-only)_ |
| POST | `/portal/messages` | _(none / public / role-only)_ |
| GET | `/portal/messages/:id` | _(none / public / role-only)_ |
| GET | `/portal/messages/:id` | _(none / public / role-only)_ |
| GET | `/portal/messages/:id/attachment` | _(none / public / role-only)_ |
| GET | `/portal/messages/:id/attachment` | _(none / public / role-only)_ |
| POST | `/portal/messages/:id/replies` | _(none / public / role-only)_ |
| GET | `/portal/messages/credit-limit-requests` | PORTAL_PERMISSIONS.MANAGE_CREDIT |
| PATCH | `/portal/messages/credit-limit-requests/:id` | PORTAL_PERMISSIONS.MANAGE_CREDIT |
| GET | `/portal/messages/disputes` | PORTAL_PERMISSIONS.MANAGE_DISPUTES |
| GET | `/portal/messages/disputes/:id` | PORTAL_PERMISSIONS.MANAGE_DISPUTES |
| PATCH | `/portal/messages/disputes/:id` | PORTAL_PERMISSIONS.MANAGE_DISPUTES |
| GET | `/portal/messages/messages` | PORTAL_PERMISSIONS.VIEW_MESSAGES |
| GET | `/portal/messages/messages/:id` | PORTAL_PERMISSIONS.VIEW_MESSAGES |
| GET | `/portal/messages/messages/:id/attachment` | PORTAL_PERMISSIONS.VIEW_MESSAGES |
| POST | `/portal/messages/messages/:id/read` | PORTAL_PERMISSIONS.VIEW_MESSAGES |
| POST | `/portal/messages/messages/:id/replies` | PORTAL_PERMISSIONS.VIEW_MESSAGES |
| GET | `/portal/notifications` | _(none / public / role-only)_ |
| POST | `/portal/notifications/:id/read` | _(none / public / role-only)_ |
| POST | `/portal/notifications/read-all` | _(none / public / role-only)_ |
| GET | `/portal/notifications/unread-count` | _(none / public / role-only)_ |
| GET | `/portal/preferences` | _(none / public / role-only)_ |
| PUT | `/portal/preferences` | _(none / public / role-only)_ |
| GET | `/portal/quotations` | _(none / public / role-only)_ |
| GET | `/portal/quotations/:id` | _(none / public / role-only)_ |
| POST | `/portal/quotations/:id/accept` | _(none / public / role-only)_ |
| POST | `/portal/quotations/:id/counter-offer` | _(none / public / role-only)_ |
| GET | `/portal/quotations/:id/negotiation` | _(none / public / role-only)_ |
| GET | `/portal/quotations/:id/pdf` | _(none / public / role-only)_ |
| POST | `/portal/quotations/:id/reject` | _(none / public / role-only)_ |
| POST | `/portal/quotations/costing-options` | _(none / public / role-only)_ |
| POST | `/portal/quotations/estimate` | _(none / public / role-only)_ |
| POST | `/portal/quotations/request` | _(none / public / role-only)_ |
| GET | `/portal/quotations/service-catalog` | _(none / public / role-only)_ |
| GET | `/portal/quotations/summary` | _(none / public / role-only)_ |
| GET | `/portal/shipments` | _(none / public / role-only)_ |
| GET | `/portal/shipments/:id` | _(none / public / role-only)_ |
| GET | `/portal/shipments/:id/documents` | _(none / public / role-only)_ |
| GET | `/portal/shipments/:id/documents/:docId/download` | _(none / public / role-only)_ |
| GET | `/portal/shipments/:id/milestones` | _(none / public / role-only)_ |
| GET | `/portal/shipments/export.csv` | _(none / public / role-only)_ |
| GET | `/portal/shipments/lookup` | _(none / public / role-only)_ |
| GET | `/portal/shipments/summary` | _(none / public / role-only)_ |
| GET | `/portal/tasks` | _(none / public / role-only)_ |
| GET | `/purchase-invoices` | INVOICES_PERMISSIONS.VIEW |
| POST | `/purchase-invoices` | INVOICES_PERMISSIONS.CREATE |
| DELETE | `/purchase-invoices/:id` | INVOICES_PERMISSIONS.DELETE |
| GET | `/purchase-invoices/:id` | INVOICES_PERMISSIONS.VIEW |
| PATCH | `/purchase-invoices/:id` | INVOICES_PERMISSIONS.UPDATE |
| POST | `/purchase-invoices/:id/post` | INVOICES_PERMISSIONS.POST |
| GET | `/quotations` | QUOTATIONS_PERMISSIONS.VIEW |
| POST | `/quotations` | QUOTATIONS_PERMISSIONS.CREATE |
| POST | `/quotations` | QUOTATIONS_PERMISSIONS.CLOSE |
| DELETE | `/quotations/:id` | QUOTATIONS_PERMISSIONS.DELETE |
| GET | `/quotations/:id` | QUOTATIONS_PERMISSIONS.VIEW |
| PATCH | `/quotations/:id` | QUOTATIONS_PERMISSIONS.UPDATE |
| POST | `/quotations/:id/apply-tariff` | QUOTATIONS_PERMISSIONS.UPDATE |
| POST | `/quotations/:id/approve` | QUOTATIONS_PERMISSIONS.APPROVE |
| POST | `/quotations/:id/archive` | QUOTATIONS_PERMISSIONS.DELETE |
| POST | `/quotations/:id/convert-to-job` | QUOTATIONS_PERMISSIONS.CLOSE |
| POST | `/quotations/:id/duplicate` | QUOTATIONS_PERMISSIONS.CREATE |
| POST | `/quotations/:id/expire` | QUOTATIONS_PERMISSIONS.UPDATE |
| GET | `/quotations/:id/job-offers` | QUOTATIONS_PERMISSIONS.VIEW |
| POST | `/quotations/:id/lines` | QUOTATIONS_PERMISSIONS.UPDATE |
| DELETE | `/quotations/:id/lines/:lineId` | QUOTATIONS_PERMISSIONS.UPDATE |
| PATCH | `/quotations/:id/lines/:lineId` | QUOTATIONS_PERMISSIONS.UPDATE |
| POST | `/quotations/:id/mark-lost` | QUOTATIONS_PERMISSIONS.CLOSE |
| POST | `/quotations/:id/mark-won` | QUOTATIONS_PERMISSIONS.CLOSE |
| GET | `/quotations/:id/negotiation` | QUOTATIONS_PERMISSIONS.VIEW |
| POST | `/quotations/:id/negotiation/accept` | QUOTATIONS_PERMISSIONS.SEND |
| POST | `/quotations/:id/negotiation/reject` | QUOTATIONS_PERMISSIONS.SEND |
| GET | `/quotations/:id/pdf` | QUOTATIONS_PERMISSIONS.VIEW |
| POST | `/quotations/:id/pdf` | QUOTATIONS_PERMISSIONS.SEND |
| GET | `/quotations/:id/pdf/status` | QUOTATIONS_PERMISSIONS.VIEW |
| POST | `/quotations/:id/reject` | QUOTATIONS_PERMISSIONS.APPROVE |
| POST | `/quotations/:id/revise-and-send` | QUOTATIONS_PERMISSIONS.NEGOTIATE |
| GET | `/quotations/:id/revisions` | QUOTATIONS_PERMISSIONS.VIEW |
| POST | `/quotations/:id/send` | QUOTATIONS_PERMISSIONS.SEND |
| POST | `/quotations/:id/send-email` | QUOTATIONS_PERMISSIONS.SEND |
| POST | `/quotations/:id/submit` | QUOTATIONS_PERMISSIONS.SUBMIT |
| GET | `/quotations/dashboard-stats` | QUOTATIONS_PERMISSIONS.VIEW |
| POST | `/quotations/expire-due` | _(none / public / role-only)_ |
| POST | `/quotations/online-quote` | _(none / public / role-only)_ |
| GET | `/quotations/reports/analytics` | QUOTATIONS_PERMISSIONS.VIEW |
| GET | `/quotations/reports/analytics/conversion` | QUOTATIONS_PERMISSIONS.VIEW |
| GET | `/quotations/reports/analytics/lost-reasons` | QUOTATIONS_PERMISSIONS.VIEW |
| GET | `/quotations/reports/analytics/response-time` | QUOTATIONS_PERMISSIONS.VIEW |
| GET | `/quotations/reports/chargewise` | QUOTATIONS_PERMISSIONS.VIEW |
| GET | `/quotations/service-catalog` | QUOTATIONS_PERMISSIONS.VIEW |
| POST | `/quotations/service-catalog` | QUOTATIONS_PERMISSIONS.SERVICE_CATALOG_MANAGE |
| DELETE | `/quotations/service-catalog/:id` | QUOTATIONS_PERMISSIONS.UPDATE |
| GET | `/quotations/service-catalog/:id` | QUOTATIONS_PERMISSIONS.VIEW |
| PATCH | `/quotations/service-catalog/:id` | QUOTATIONS_PERMISSIONS.UPDATE |
| GET | `/quotations/tariffs` | QUOTATIONS_PERMISSIONS.VIEW |
| POST | `/quotations/tariffs` | QUOTATIONS_PERMISSIONS.CREATE |
| DELETE | `/quotations/tariffs/:id` | QUOTATIONS_PERMISSIONS.DELETE |
| GET | `/quotations/tariffs/:id` | QUOTATIONS_PERMISSIONS.VIEW |
| PATCH | `/quotations/tariffs/:id` | QUOTATIONS_PERMISSIONS.UPDATE |
| GET | `/quotations/zip-distances` | QUOTATIONS_PERMISSIONS.VIEW |
| POST | `/quotations/zip-distances` | QUOTATIONS_PERMISSIONS.CREATE |
| DELETE | `/quotations/zip-distances/:id` | QUOTATIONS_PERMISSIONS.DELETE |
| GET | `/quotations/zip-distances/:id` | QUOTATIONS_PERMISSIONS.VIEW |
| PATCH | `/quotations/zip-distances/:id` | QUOTATIONS_PERMISSIONS.UPDATE |
| POST | `/reports/generate` | REPORTS_PERMISSIONS.GENERATE |
| GET | `/reports/jobs/:jobId` | REPORTS_PERMISSIONS.READ |
| GET | `/reports/jobs/:jobId/download` | REPORTS_PERMISSIONS.READ |
| GET | `/reports/templates` | REPORTS_PERMISSIONS.READ |
| POST | `/reports/templates/:code/activate` | REPORTS_PERMISSIONS.MANAGE |
| POST | `/reports/templates/:code/bind-renderer` | REPORTS_PERMISSIONS.MANAGE |
| POST | `/reports/templates/:code/deactivate` | REPORTS_PERMISSIONS.MANAGE |
| GET | `/reports/templates/:idOrCode` | REPORTS_PERMISSIONS.READ |
| POST | `/reports/templates/import` | REPORTS_PERMISSIONS.MANAGE |
| GET | `/reports/templates/renderers` | REPORTS_PERMISSIONS.READ |
| GET | `/search` | SEARCH_PERMISSIONS.VIEW |
| GET | `/tenants` | _(none / public / role-only)_ |
| POST | `/tenants` | _(none / public / role-only)_ |
| DELETE | `/tenants/:id` | _(none / public / role-only)_ |
| GET | `/tenants/:id` | _(none / public / role-only)_ |
| PATCH | `/tenants/:id` | _(none / public / role-only)_ |
| PATCH | `/tenants/:id/activate` | _(none / public / role-only)_ |
| PATCH | `/tenants/:id/deactivate` | _(none / public / role-only)_ |
| PATCH | `/tenants/:id/restore` | _(none / public / role-only)_ |
| POST | `/tenants/:id/sync-permissions` | _(none / public / role-only)_ |
| GET | `/tenants/statistics` | _(none / public / role-only)_ |
| POST | `/tenants/sync-permissions` | _(none / public / role-only)_ |
| GET | `/track` | _(none / public / role-only)_ |
| GET | `/track/embed` | _(none / public / role-only)_ |
| GET | `/track/widget.js` | _(none / public / role-only)_ |
| GET | `/transport-requests` | TRANSPORT_PERMISSIONS.VIEW |
| GET | `/transport-requests/:id` | TRANSPORT_PERMISSIONS.VIEW |
| POST | `/transport-requests/:id/assign` | TRANSPORT_PERMISSIONS.MANAGE |
| POST | `/transport-requests/:id/cancel` | TRANSPORT_PERMISSIONS.MANAGE |
| POST | `/transport-requests/:id/confirm-pickup` | TRANSPORT_PERMISSIONS.MANAGE |
| POST | `/transport-requests/:id/delivered` | TRANSPORT_PERMISSIONS.MANAGE |
| POST | `/transport-requests/:id/documents/transport-request` | TRANSPORT_PERMISSIONS.MANAGE |
| POST | `/transport-requests/:id/in-transit` | TRANSPORT_PERMISSIONS.MANAGE |
| POST | `/transport-requests/:id/record-cost` | TRANSPORT_PERMISSIONS.MANAGE |
| GET | `/users` | USERS_PERMISSIONS.VIEW |
| POST | `/users` | USERS_PERMISSIONS.CREATE |
| DELETE | `/users/:id` | USERS_PERMISSIONS.DELETE |
| GET | `/users/:id` | USERS_PERMISSIONS.VIEW |
| PATCH | `/users/:id` | USERS_PERMISSIONS.UPDATE |
| POST | `/users/:id/admin-reset-password` | USERS_PERMISSIONS.RESET_PASSWORD |
| POST | `/users/:id/force-logout` | USERS_PERMISSIONS.FORCE_LOGOUT |
| GET | `/users/:id/permission-matrix` | USERS_PERMISSIONS.VIEW |
| PUT | `/users/:id/permission-matrix` | USERS_PERMISSIONS.UPDATE |
| POST | `/users/:id/restore` | USERS_PERMISSIONS.RESTORE |
| PATCH | `/users/:id/status` | USERS_PERMISSIONS.CHANGE_STATUS |
| POST | `/users/bulk` | USERS_PERMISSIONS.BULK_ACTION |
| POST | `/users/me/change-password` | _(none / public / role-only)_ |
| GET | `/users/permission-matrix` | USERS_PERMISSIONS.VIEW |
| GET | `/users/role-presets` | USERS_PERMISSIONS.VIEW |
| POST | `/vendor/auth/accept-invite` | _(none / public / role-only)_ |
| POST | `/vendor/auth/login` | _(none / public / role-only)_ |
| POST | `/vendor/auth/logout` | _(none / public / role-only)_ |
| GET | `/vendor/auth/me` | _(none / public / role-only)_ |
| POST | `/vendor/auth/refresh` | _(none / public / role-only)_ |
| GET | `/vendor/dashboard` | _(none / public / role-only)_ |
| GET | `/vendor/disputes` | _(none / public / role-only)_ |
| GET | `/vendor/disputes` | VENDOR_PERMISSIONS.MANAGE_DISPUTES |
| POST | `/vendor/disputes` | _(none / public / role-only)_ |
| GET | `/vendor/disputes/:id` | _(none / public / role-only)_ |
| GET | `/vendor/disputes/:id` | VENDOR_PERMISSIONS.MANAGE_DISPUTES |
| PATCH | `/vendor/disputes/:id` | VENDOR_PERMISSIONS.MANAGE_DISPUTES |
| POST | `/vendor/disputes/:id/send-email` | _(none / public / role-only)_ |
| GET | `/vendor/invoices` | _(none / public / role-only)_ |
| GET | `/vendor/invoices/:id` | _(none / public / role-only)_ |
| GET | `/vendor/invoices/:id/payment-proofs` | _(none / public / role-only)_ |
| POST | `/vendor/invoices/:id/payment-proofs` | _(none / public / role-only)_ |
| POST | `/vendor/invoices/:id/payment-proofs/:proofId/send-email` | _(none / public / role-only)_ |
| GET | `/vendor/invoices/:id/pdf` | _(none / public / role-only)_ |
| POST | `/vendor/invoices/:id/send-email` | _(none / public / role-only)_ |
| GET | `/vendor/invoices/advances` | _(none / public / role-only)_ |
| GET | `/vendor/invoices/credit-notes` | _(none / public / role-only)_ |
| GET | `/vendor/invoices/credit/aging` | _(none / public / role-only)_ |
| GET | `/vendor/invoices/credit/statement` | _(none / public / role-only)_ |
| GET | `/vendor/invoices/credit/statement.pdf` | _(none / public / role-only)_ |
| GET | `/vendor/invoices/documents/tds` | _(none / public / role-only)_ |
| GET | `/vendor/invoices/export.csv` | _(none / public / role-only)_ |
| GET | `/vendor/invoices/open-items` | _(none / public / role-only)_ |
| GET | `/vendor/invoices/payment-requests` | _(none / public / role-only)_ |
| GET | `/vendor/invoices/payment-requests/:id` | _(none / public / role-only)_ |
| GET | `/vendor/invoices/payments` | _(none / public / role-only)_ |
| GET | `/vendor/invoices/payments/:id/remittance.pdf` | _(none / public / role-only)_ |
| POST | `/vendor/invoices/payments/:id/remittance/send-email` | _(none / public / role-only)_ |
| GET | `/vendor/invoices/payments/summary` | _(none / public / role-only)_ |
| GET | `/vendor/invoices/schedule` | _(none / public / role-only)_ |
| POST | `/vendor/invoices/submit` | _(none / public / role-only)_ |
| GET | `/vendor/invoices/summary` | _(none / public / role-only)_ |
| GET | `/vendor/job-offers` | _(none / public / role-only)_ |
| POST | `/vendor/job-offers` | _(none / public / role-only)_ |
| GET | `/vendor/job-offers/:id` | _(none / public / role-only)_ |
| POST | `/vendor/job-offers/:id/accept` | _(none / public / role-only)_ |
| POST | `/vendor/job-offers/:id/counter-offer` | _(none / public / role-only)_ |
| GET | `/vendor/job-offers/:id/negotiation` | _(none / public / role-only)_ |
| POST | `/vendor/job-offers/:id/reject` | _(none / public / role-only)_ |
| GET | `/vendor/lookups/airports` | _(none / public / role-only)_ |
| GET | `/vendor/lookups/ports` | _(none / public / role-only)_ |
| GET | `/vendor/quotes` | _(none / public / role-only)_ |
| POST | `/vendor/quotes` | _(none / public / role-only)_ |
| GET | `/vendor/quotes/:id` | _(none / public / role-only)_ |
| POST | `/vendor/quotes/:id/accept` | _(none / public / role-only)_ |
| POST | `/vendor/quotes/:id/counter-offer` | _(none / public / role-only)_ |
| GET | `/vendor/quotes/:id/negotiation` | _(none / public / role-only)_ |
| POST | `/vendor/quotes/:id/reject` | _(none / public / role-only)_ |
| GET | `/vendor/tasks` | _(none / public / role-only)_ |
| GET | `/vessels/:id/schedules` | MASTERS_PERMISSIONS.VIEW |
| POST | `/vessels/:id/schedules` | MASTERS_PERMISSIONS.CREATE |
| DELETE | `/vessels/:id/schedules/:scheduleId` | MASTERS_PERMISSIONS.DELETE |
| PATCH | `/vessels/:id/schedules/:scheduleId` | MASTERS_PERMISSIONS.UPDATE |
| GET | `/wms/asns` | WMS_PERMISSIONS.VIEW |
| POST | `/wms/asns` | WMS_PERMISSIONS.MANAGE_ASN |
| GET | `/wms/asns/:id` | WMS_PERMISSIONS.VIEW |
| POST | `/wms/asns/:id/cancel` | WMS_PERMISSIONS.MANAGE_ASN |
| POST | `/wms/asns/:id/confirm` | WMS_PERMISSIONS.MANAGE_ASN |
| GET | `/wms/gdos` | WMS_PERMISSIONS.VIEW |
| POST | `/wms/gdos` | WMS_PERMISSIONS.MANAGE_GDO |
| GET | `/wms/gdos/:id` | WMS_PERMISSIONS.VIEW |
| POST | `/wms/gdos/:id/cancel` | WMS_PERMISSIONS.MANAGE_GDO |
| POST | `/wms/gdos/:id/post` | WMS_PERMISSIONS.MANAGE_GDO |
| GET | `/wms/grns` | WMS_PERMISSIONS.VIEW |
| POST | `/wms/grns` | WMS_PERMISSIONS.MANAGE_GRN |
| GET | `/wms/grns/:id` | WMS_PERMISSIONS.VIEW |
| POST | `/wms/grns/:id/cancel` | WMS_PERMISSIONS.MANAGE_GRN |
| POST | `/wms/grns/:id/post` | WMS_PERMISSIONS.MANAGE_GRN |
| GET | `/wms/items` | WMS_PERMISSIONS.VIEW |
| POST | `/wms/items` | WMS_PERMISSIONS.MANAGE_ITEMS |
| DELETE | `/wms/items/:id` | WMS_PERMISSIONS.MANAGE_ITEMS |
| GET | `/wms/items/:id` | WMS_PERMISSIONS.VIEW |
| PATCH | `/wms/items/:id` | WMS_PERMISSIONS.MANAGE_ITEMS |
| GET | `/wms/settings` | WMS_PERMISSIONS.VIEW |
| PUT | `/wms/settings` | WMS_PERMISSIONS.MANAGE_SETTINGS |
| POST | `/wms/stock/adjust` | WMS_PERMISSIONS.MANAGE_STOCK |
| GET | `/wms/stock/lot-aging` | WMS_PERMISSIONS.VIEW_REPORTS |
| GET | `/wms/stock/low-stock` | WMS_PERMISSIONS.VIEW_REPORTS |
| GET | `/wms/stock/movements` | WMS_PERMISSIONS.VIEW_REPORTS |
| GET | `/wms/stock/on-hand` | WMS_PERMISSIONS.VIEW_REPORTS |
| POST | `/wms/storage/calculate` | WMS_PERMISSIONS.MANAGE_STORAGE |
| GET | `/wms/storage/charges` | WMS_PERMISSIONS.VIEW |
| POST | `/wms/storage/invoice` | WMS_PERMISSIONS.MANAGE_STORAGE |
| GET | `/wms/transfers` | WMS_PERMISSIONS.VIEW |
| POST | `/wms/transfers` | WMS_PERMISSIONS.MANAGE_TRANSFERS |
| GET | `/wms/transfers/:id` | WMS_PERMISSIONS.VIEW |
| POST | `/wms/transfers/:id/post` | WMS_PERMISSIONS.MANAGE_TRANSFERS |
