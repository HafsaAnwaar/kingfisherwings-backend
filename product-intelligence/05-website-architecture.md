# Official Website Architecture

**Brand:** Kingfisher Technologies  
**Product:** Freight & logistics management platform (KingFisher Wings)  
**Goal:** Enterprise, secure, logistics-specific site — not a generic SaaS template.

---

## 1. Global navigation

**Primary**
- Platform  
- Solutions ▾  
- Features ▾  
- Security & Privacy  
- Portals ▾ (Customer | Vendor)  
- About  
- Resources ▾  
- Contact  

**Utility**
- Request demo (primary CTA)  
- Staff / Portal login links (tenant-aware deep links if available)  

**Footer**
- Product links, Solutions, Security, Legal (Privacy, Terms, Cookies, Data Protection), Contact, social (only if real)

---

## 2. Sitemap

```
/ (Home)
/platform
/solutions/freight-forwarders
/solutions/logistics-companies
/solutions/air-freight
/solutions/sea-freight
/solutions/customs-clearance
/solutions/import-export
/features
/features/operations
/features/shipments
/features/quotations
/features/customers
/features/vendors
/features/documents
/features/finance
/features/business-intelligence
/features/users-permissions
/features/activity-monitoring
/security
/portals/customer
/portals/vendor
/about
/contact
/resources
/resources/insights
/resources/guides
/resources/product-updates
/resources/faq
/resources/help (or link to help center)
/legal/privacy-policy
/legal/terms
/legal/cookie-policy
/legal/data-protection
```

Optional later: `/pricing` (only when packaging is finalized), `/trust` (trust center).

---

## 3. Page blueprints

### 3.1 Home
| Section | Content intent |
|---------|----------------|
| Hero | Brand-first name + one headline + one support line + CTA group + full-bleed logistics visual |
| Product introduction | What Kingfisher is in 2–3 sentences |
| Key capabilities | 4–6 real capabilities (ops, portals, finance, track, customs, docs) |
| Freight management overview | Modes covered |
| Platform benefits | Continuum benefits (no fake stats) |
| Security highlights | 3–4 verified claims → link Security |
| Portal introduction | Customer + vendor |
| Workflow automation | Quote → job → invoice story |
| Industry coverage | Forwarders, NVOCC, brokers, logistics companies |
| Why Kingfisher | Differentiation (honest) |
| Trust | Security + demo + support availability (no fake logos) |
| Final CTA | Demo + contact |

**Hero budget:** Brand, one headline, one sentence, CTAs, one dominant visual. No stat strips or card clutter in first viewport.

### 3.2 Platform Overview
- Continuum diagram: CRM → Quote → Shipment → Job → Docs → Finance → Portals → Track  
- Module map  
- Multi-company / multi-user model  
- How departments collaborate  
- CTA demo  

### 3.3 Solutions pages
Each page: audience problem → Kingfisher approach → workflow → modules used → CTA.

| Page | Emphasis |
|------|----------|
| Freight Forwarders | Full continuum + costing + portals |
| Logistics Companies | Multi-mode + WMS/transport adjacency |
| Air Freight | Air jobs, AWB stock, compliance forms, track |
| Sea Freight | FCL/LCL, containers, BL docs, NVOCC |
| Customs Clearance | Stage machine Sales/Ops/Accounts |
| Import & Export | Directional workflows + docs + customs status |

### 3.4 Features hub + detail pages
Hub grid linking to detail pages listed in sitemap. Each detail page: purpose, who uses it, key functions, related modules, CTA.

### 3.5 Security & Privacy
Sections mirroring `03-security-and-data-protection.md` section A only. Include “What we do not claim” microcopy. CTA: security questionnaire / demo.

### 3.6 Customer Portal
Access, quotes, shipments, documents, invoices, notifications, track, payments (provider). Screenshot placeholders.

### 3.7 Vendor Portal
Access, assigned work, cost visibility, document exchange, purchase invoice submit, AP views. Boundaries stated clearly.

### 3.8 About Us
Vision, mission, values, philosophy (efficiency + security). **Do not invent** founding year stories, offices, client counts, or awards unless marketing supplies verified facts.

### 3.9 Contact
Form types: demo, sales, support, general. Fields: name, company, email, phone, country, message, interest. Optional calendar link later.

### 3.10 Resources
Insights, guides, updates, FAQ, help. Start with FAQ + 3–5 educational articles (no thin SEO spam).

### 3.11 Legal
Privacy, Terms, Cookies, Data Protection — **require legal review**. Mark drafts as draft until counsel signs off.

---

## 4. Conversion paths

1. **Demo request** → sales follow-up  
2. **Contact sales** → discovery call  
3. **Portal/login** → existing customers (not primary acquisition)  
4. **Track** — if public marketing of track widget, link carefully to tenant branding  

---

## 5. Technical website notes (non-app)

- Prefer product screenshots and workflow diagrams over generic stock cargo photos  
- Tenant login URLs may use `tenant_slug` query patterns documented in `WORDPRESS_PORTALS.md`  
- Do not expose internal API paths as customer documentation on marketing pages  
- Localize later (EN first recommended)

---

## 6. Content ownership

| Asset | Owner |
|-------|-------|
| Messaging | Marketing + Product (use `06-website-content.md`) |
| Screenshots | Product / FE team (sanitize data) |
| Security claims | Product + Security (`03`) |
| Legal | Counsel |
| Competitor claims | Marketing using `04` only |
