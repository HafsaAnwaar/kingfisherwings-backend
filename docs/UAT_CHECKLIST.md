# UAT Checklist — Week 28

Backend UAT uses Swagger (`/docs`) and smoke scripts. Frontend UAT is a separate program.

## Sign-off roles

| Role | Focus modules | Script |
|------|---------------|--------|
| Tenant Admin | Users, permissions, org, API keys | `week22-documentation-api-test.cjs` + admin routes |
| Sales | Quotations, parties, CRM | `week14-vpp-crm-api-test.cjs` |
| Operations | Jobs (air/sea/land/courier/NVOCC) | `week18`, `week19`, `week20` smoke scripts |
| Finance | Invoices, GL, payment requests | `financial-accuracy-audit.cjs` + manual voucher post |
| Documentation | BOE, EDI, uploads, DO | `week21`, `week22` smoke scripts |
| Warehouse | WMS GRN/GDO | `week17-wms-api-test.cjs` |

## Module checklist (weeks 0–22)

- [ ] Auth: staff, tenant admin, super admin login
- [ ] Masters CRUD + sync-permissions after deploy
- [ ] Parties + credit status + EDI codes + standard charges
- [ ] Quote → job → charges → invoice → GL post (integration e2e)
- [ ] Portal: party-scoped shipments (manual negative test)
- [ ] Vendor: VPP invoice list scoped to vendor party
- [ ] Documentation: BOE dashboard, bulk cost, EDI generate/submit, uploads
- [ ] Public API: `/api/v1/jobs`, scope enforcement on `/api/v1/track/:token`
- [ ] Webhooks: CRUD + test dispatch + delivery log
- [ ] Portal quote: estimate with packages/services, request, negotiation timeline
- [ ] Portal/vendor open-items + payment summary endpoints
- [ ] Payment proof upload + staff acknowledge/reject
- [ ] Payment request markPaid creates GL payment record

## Defect triage

| Priority | Action |
|----------|--------|
| P0/P1 | Fix before sign-off |
| P2+ | Backlog with owner |

## Sign-off

- [ ] Product owner
- [ ] Tenant admin (pilot tenant)
- [ ] Finance lead (GL accuracy audit PASS)
- [ ] Operations lead (documentation + jobs smoke PASS on Render)

Date: _______________  Signed: _______________
