"""Generate docs/Beyond-Fresa-Feature-Differentiation.pdf"""
from pathlib import Path

from fpdf import FPDF

OUT = Path(__file__).resolve().parents[1] / "docs" / "Beyond-Fresa-Feature-Differentiation.pdf"


class Doc(FPDF):
    def header(self):
        if self.page_no() == 1:
            return
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(100, 116, 139)
        self.cell(0, 6, "KingFisher Wings  |  Beyond Fresa Feature Differentiation", align="L")
        self.ln(8)

    def footer(self):
        self.set_y(-12)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(100, 116, 139)
        self.cell(0, 8, f"Page {self.page_no()}/{{nb}}", align="C")

    def cover(self):
        self.add_page()
        self.set_fill_color(11, 61, 92)
        self.rect(0, 0, 210, 90, "F")
        self.set_xy(16, 28)
        self.set_font("Helvetica", "B", 28)
        self.set_text_color(255, 255, 255)
        self.cell(0, 12, "Beyond Fresa", ln=1)
        self.set_x(16)
        self.set_font("Helvetica", "", 12)
        self.multi_cell(
            170,
            6,
            "KingFisher Wings / FreightSaas capabilities that go past classic Fresa Gold: "
            "negotiation, rich customer & vendor portals, finance self-serve, custom statuses, "
            "booking forms, acknowledgements, and ops continuum.",
        )
        self.set_xy(16, 78)
        self.set_font("Helvetica", "", 9)
        self.cell(0, 5, "Product & engineering brief  |  20 October 2026", ln=1)

        self.set_y(100)
        self.set_text_color(15, 23, 42)
        self.set_font("Helvetica", "B", 12)
        self.cell(0, 8, "How to read this document", ln=1)
        self.set_font("Helvetica", "", 10)
        self.set_text_color(71, 85, 105)
        self.multi_cell(
            0,
            5,
            "BEYOND FRESA = differentiators or deep extensions. "
            "FRESA-ALIGNED = familiar Fresa-style workflows strengthened here "
            "(path hints, dual portals, typed docs, etc.).",
        )
        self.ln(4)
        self.set_text_color(15, 23, 42)
        self.set_font("Helvetica", "B", 12)
        self.cell(0, 8, "Contents", ln=1)
        self.set_font("Helvetica", "", 10)
        for i, t in enumerate(
            [
                "Headline differentiators (the big ones)",
                "Customer Portal - full capability map",
                "Admin / Staff ERP - extras beyond Fresa",
                "Vendor Portal - extras beyond Fresa",
                "Cross-portal matrix",
                "Demo talking points",
            ],
            1,
        ):
            self.cell(0, 6, f"{i}.  {t}", ln=1)

    def h2(self, text):
        self.ln(4)
        self.set_font("Helvetica", "B", 14)
        self.set_text_color(11, 61, 92)
        self.cell(0, 8, text, ln=1)
        self.set_draw_color(11, 61, 92)
        self.set_line_width(0.5)
        self.line(self.l_margin, self.get_y(), 210 - self.r_margin, self.get_y())
        self.ln(3)
        self.set_text_color(15, 23, 42)

    def h3(self, text):
        self.ln(2)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(196, 92, 38)
        self.cell(0, 7, text, ln=1)
        self.set_text_color(15, 23, 42)

    def body(self, text):
        self.set_font("Helvetica", "", 10)
        self.set_text_color(51, 65, 85)
        self.multi_cell(0, 5, text)
        self.set_text_color(15, 23, 42)

    def bullet(self, text, tag=None):
        self.set_font("Helvetica", "", 9.5)
        self.set_x(self.l_margin)
        prefix = ""
        if tag:
            self.set_font("Helvetica", "B", 8)
            self.set_text_color(22, 101, 52) if tag == "BEYOND" else self.set_text_color(71, 85, 105)
            label = "BEYOND FRESA" if tag == "BEYOND" else "FRESA-ALIGNED"
            self.cell(self.get_string_width(label) + 3, 5, label)
            self.set_text_color(15, 23, 42)
            self.set_font("Helvetica", "", 9.5)
            prefix = "  "
        self.multi_cell(0, 5, prefix + text)

    def big_card(self, num, title, body):
        if self.get_y() > 250:
            self.add_page()
        y0 = self.get_y()
        self.set_fill_color(248, 250, 252)
        self.set_draw_color(203, 213, 225)
        self.set_font("Helvetica", "B", 8)
        self.set_text_color(196, 92, 38)
        self.cell(0, 5, num, ln=1)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(11, 61, 92)
        self.cell(0, 6, title, ln=1)
        self.set_font("Helvetica", "", 9.5)
        self.set_text_color(71, 85, 105)
        self.multi_cell(0, 4.5, body)
        self.ln(3)
        self.set_text_color(15, 23, 42)

    def table(self, headers, rows, col_widths=None):
        if col_widths is None:
            usable = 210 - self.l_margin - self.r_margin
            col_widths = [usable / len(headers)] * len(headers)
        self.set_font("Helvetica", "B", 8)
        self.set_fill_color(11, 61, 92)
        self.set_text_color(255, 255, 255)
        for i, h in enumerate(headers):
            self.cell(col_widths[i], 7, h, border=1, fill=True)
        self.ln()
        self.set_text_color(15, 23, 42)
        self.set_font("Helvetica", "", 8)
        fill = False
        for row in rows:
            # estimate height
            line_h = 4.2
            max_lines = 1
            for i, cell in enumerate(row):
                lines = self.multi_cell(col_widths[i], line_h, str(cell), dry_run=True, output="LINES")
                max_lines = max(max_lines, len(lines))
            row_h = max(line_h * max_lines + 2, 8)
            if self.get_y() + row_h > 277:
                self.add_page()
                self.set_font("Helvetica", "B", 8)
                self.set_fill_color(11, 61, 92)
                self.set_text_color(255, 255, 255)
                for i, h in enumerate(headers):
                    self.cell(col_widths[i], 7, h, border=1, fill=True)
                self.ln()
                self.set_text_color(15, 23, 42)
                self.set_font("Helvetica", "", 8)
                fill = False
            x0, y0 = self.get_x(), self.get_y()
            if fill:
                self.set_fill_color(248, 250, 252)
            else:
                self.set_fill_color(255, 255, 255)
            for i, cell in enumerate(row):
                self.set_xy(x0 + sum(col_widths[:i]), y0)
                self.multi_cell(col_widths[i], line_h, str(cell), border=0, fill=False)
            for i in range(len(headers)):
                self.rect(x0 + sum(col_widths[:i]), y0, col_widths[i], row_h)
            if fill:
                # light fill under text - redraw is tricky; skip fill for simplicity
                pass
            self.set_y(y0 + row_h)
            fill = not fill


def build():
    pdf = Doc(orientation="P", unit="mm", format="A4")
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=True, margin=16)
    pdf.set_margins(14, 14, 14)

    pdf.cover()

    # Section 1
    pdf.add_page()
    pdf.h2("1. Headline differentiators")
    pdf.body(
        "These capabilities most clearly separate KingFisher Wings from a classic "
        "Fresa-style staff ERP with a thin customer view."
    )
    cards = [
        (
            "01  COMMERCIAL",
            "Quote negotiation & counter-offers",
            "Customer can accept, reject, or counter-offer. Staff negotiate with revise-and-send, "
            "accept/reject counter, and a full negotiation timeline. Same pattern mirrored for vendor cost offers.",
        ),
        (
            "02  CUSTOMER PORTAL",
            "Messages & invoice disputes",
            "Party-shared message threads with attachments and staff inbox/replies. "
            "Structured invoice disputes with review/resolve on the staff side - not just email.",
        ),
        (
            "03  FINANCE SELF-SERVE",
            "Invoices, payment proofs & online pay",
            "Portal invoices with PDF, attachments, remittance/payment-proof upload, Stripe checkout "
            "and payment status. Credit summary, open items, and statement-style exports.",
        ),
        (
            "04  DELIVERY PROOF",
            "Formal delivery acknowledgement",
            "Customer submits goods-receipt acknowledgement with signature upload - "
            "closes the last-mile loop without WhatsApp chasing.",
        ),
        (
            "05  STATUS FLEXIBILITY",
            "Custom status catalog buttons",
            "Tenant-defined status labels/catalogs for quotations, shipments, and jobs - "
            "add custom status options without hard-coding every label in the UI.",
        ),
        (
            "06  BOOKING WITHOUT PREMATURE JOBS",
            "Quotation-scoped booking forms",
            "Customer fills and submits booking forms (all modes + docs) on the quotation. "
            "Admin sees the form only after submit; job is created only on Generate Job.",
        ),
        (
            "07  VISIBILITY",
            "Track-by-anything + public track",
            "Lookup by job, shipment, container, BL/AWB, barcode, token. Portal milestones + "
            "public track without login. Typed document visibility (staff / customer / vendor).",
        ),
        (
            "08  VENDOR DEPTH",
            "Full vendor portal (not pay-only)",
            "Vendor auth, job offers, cost negotiation, documents, costing (cost-only), finance, "
            "payouts, payment proofs, and ops continuum attachments - a true second portal.",
        ),
    ]
    for num, title, body in cards:
        pdf.big_card(num, title, body)

    # Section 2
    pdf.add_page()
    pdf.h2("2. Customer Portal - capability map")
    pdf.body(
        "The customer portal is a first-class product surface: auth isolated from staff ERP, "
        "party ownership filters, and self-serve commercial + ops + finance workflows."
    )

    pdf.h3("2.1 Access, identity & preferences")
    w = [50, 100, 32]
    pdf.table(
        ["Capability", "What it does", "Tag"],
        [
            ["Portal login / invite / refresh", "Dedicated portal auth; accept invite; change password; session refresh", "BEYOND"],
            ["Party portal users & permissions", "Staff invite/disable portal users; permission packs per party", "BEYOND"],
            ["Dashboard & preferences", "Portal home stats; saved UI/filter preferences", "BEYOND"],
            ["In-app notifications", "Unread counts, mark read, event-driven alerts", "BEYOND"],
            ["Unit converters", "Length / CBM / weight / liquid / volume helpers", "BEYOND"],
        ],
        w,
    )

    pdf.h3("2.2 Quotations & booking (commercial)")
    pdf.table(
        ["Capability", "What it does", "Tag"],
        [
            ["Quote list, detail, PDF", "Customer-safe quotation views and PDF download", "ALIGNED"],
            ["Online quote / estimate / costing", "Service catalog, estimate, costing options, request quote", "BEYOND"],
            ["Accept / reject / counter-offer", "Full negotiation loop with timeline; staff revise-and-send", "BEYOND"],
            ["Booking form (quote & shipment)", "Draft, upload mandatory docs, complete/submit - all modes + air", "BEYOND"],
            ["Convert / Generate Job gate", "No auto job on form open; admin Generate Job is the cutover", "BEYOND"],
        ],
        w,
    )

    pdf.h3("2.3 Shipments, track & acknowledgement")
    pdf.table(
        ["Capability", "What it does", "Tag"],
        [
            ["Shipments list / detail / CSV", "Owned shipments, summary, export for Excel users", "BEYOND"],
            ["Lookup & tracking", "Ref lookup (container, BL, AWB, job); milestones + history", "BEYOND"],
            ["Document requests", "Request draft BL / HAWB / DO; container confirm-pick; port token", "BEYOND"],
            ["Delivery acknowledgement + signature", "Formal POD-style acknowledgement with signature image", "BEYOND"],
            ["Typed job documents", "List / download / upload with customer visibility ACL", "BEYOND"],
            ["Ops continuum attachments", "See staff-shared continuum files; upload for staff", "BEYOND"],
        ],
        w,
    )

    pdf.h3("2.4 Finance, CCP, messages & disputes")
    pdf.table(
        ["Capability", "What it does", "Tag"],
        [
            ["Invoices & open items", "List, detail, PDF, summary, CSV export, attachments", "BEYOND"],
            ["Payment proofs / remittance", "Upload proof against invoice; staff matching", "BEYOND"],
            ["Online payments (Stripe)", "Checkout, pay, status, retry / cancel sessions", "BEYOND"],
            ["Credit portal (CCP)", "Credit summary / limits; credit-increase requests", "BEYOND"],
            ["Messages (party-shared)", "Threads with replies & attachments; staff inbox", "BEYOND"],
            ["Invoice disputes", "Raise dispute with attachment; staff review / resolve", "BEYOND"],
            ["Customs clearance (portal CC)", "Customer CC jobs, checklist, document upload", "BEYOND"],
            ["Portal tasks", "Customer-facing task list for pending actions", "BEYOND"],
        ],
        w,
    )

    # Section 3
    pdf.add_page()
    pdf.h2("3. Admin / Staff ERP - extras beyond Fresa")
    pdf.body(
        "Staff retain Fresa-style job/shipment/quote shells (detail tabs, path hints, costing, "
        "org, routing). Below are the meaningful additions or deepenings."
    )

    pdf.h3("3.1 Commercial & booking")
    pdf.bullet("Negotiation desk - timeline, accept/reject customer counter, revise-and-send.", "BEYOND")
    pdf.bullet("Booking form gate - admin sees submitted customer form only; Generate Job materializes form onto the job.", "BEYOND")
    pdf.bullet("Mode booking forms - Sea FCL/LCL, land, road, courier, customs, warehouse, air compliance + mandatory docs.", "BEYOND")
    pdf.bullet("Verify -> Approve -> Generate Shipment / Job - explicit gates; no silent provisional job from form open.", "BEYOND")
    pdf.bullet("Pass-to-vendor / job offers from quotation or job into vendor negotiation.", "BEYOND")
    pdf.bullet("Quotation/shipment/job detail tabs with path_hints and action flags for FE.", "ALIGNED")

    pdf.h3("3.2 Status catalogs & workflow polish")
    pdf.bullet("Custom status catalog APIs for quotations, shipments, jobs - create/update/deactivate label options.", "BEYOND")
    pdf.bullet("Status-options endpoints power UI custom status buttons.", "BEYOND")
    pdf.bullet("Staff change-status with catalog codes mapped to system statuses.", "BEYOND")
    pdf.bullet("Staff portal inbox for messages & dispute management (CCP staff APIs).", "BEYOND")

    pdf.h3("3.3 Ops, track, docs & continuum")
    pdf.bullet("Public / staff Track & Trace - track-by-anything; unified milestone history.", "BEYOND")
    pdf.bullet("Typed document uploads with visibility to customer/vendor; booking-form document kinds.", "BEYOND")
    pdf.bullet("Ops continuum comments & attachments across quotation / shipment / job.", "BEYOND")
    pdf.bullet("Delivery acknowledgement admin view of customer POD/receipt.", "BEYOND")
    pdf.bullet("Exception / KPI / job-not-invoiced-DO / job-finance-by-shipment-date report packs.", "BEYOND")
    pdf.bullet("Closed-job permission-aware overrides; SABER / RA / ISF refs; overseas agent role.", "BEYOND")
    pdf.bullet("Favourites, staff activity emails, cross-module notifications.", "BEYOND")

    pdf.h3("3.4 Masters & platform")
    pdf.bullet("Multi-tenant hierarchy: SuperAdmin -> Company -> Tenant -> Tenant Admin -> staff roles.", "BEYOND")
    pdf.bullet("Portal/vendor user administration from party masters; permission packs.", "BEYOND")
    pdf.bullet("Deep masters (ports, charges, tariffs, zip distances, freight specs) feeding quotes and jobs.", "ALIGNED")

    # Section 4
    pdf.add_page()
    pdf.h2("4. Vendor Portal - extras beyond Fresa")
    pdf.body(
        "Classic Fresa is staff-centric. KingFisher ships a dedicated vendor portal with commercial "
        "negotiation and finance - not only a payout screen."
    )
    pdf.table(
        ["Capability", "What it does", "Tag"],
        [
            ["Vendor auth & users", "Isolated vendor login; party vendor users & permissions", "BEYOND"],
            ["Dashboard & lookups", "Vendor home; converters; reference lookups", "BEYOND"],
            ["Job offers / quotes", "List offers; cargo-safe detail; negotiation timeline", "BEYOND"],
            ["Accept / reject / counter-offer", "Cost-side negotiation; accept can auto-generate purchase invoice", "BEYOND"],
            ["Jobs & costing", "Vendor job views; cost-only costing (no customer revenue)", "BEYOND"],
            ["Typed documents", "Upload/list/download with vendor visibility ACL", "BEYOND"],
            ["Finance & payment proofs", "Purchase invoices, attachments, payment proofs, email proof", "BEYOND"],
            ["Payouts", "Vendor payout portal flows", "BEYOND"],
            ["Ops continuum", "Vendor-side continuum attachments for shared entities", "BEYOND"],
        ],
        w,
    )

    # Section 5
    pdf.h2("5. Cross-portal matrix")
    mw = [36, 48, 48, 44]
    pdf.table(
        ["Theme", "Customer Portal", "Admin / Staff", "Vendor Portal"],
        [
            ["Negotiation", "Accept / reject / counter", "Revise, accept/reject counter, timeline", "Accept / reject / counter (cost)"],
            ["Booking form", "Fill + submit + docs", "View after submit; Generate Job", "-"],
            ["Messages", "Threads + attachments", "Staff inbox + reply", "-"],
            ["Disputes", "Raise invoice dispute", "Review / resolve", "-"],
            ["Invoices", "View, PDF, pay, proofs", "Full AR", "Purchase invoices + proofs"],
            ["Acknowledgement", "Submit + signature", "See status", "-"],
            ["Custom statuses", "Sees resolved labels", "Catalog CRUD + buttons", "-"],
            ["Track & docs", "Lookup, milestones, typed docs", "Full track + ACL docs", "Typed docs on jobs"],
            ["Ops continuum", "Shared attachments", "Full continuum", "Shared attachments"],
            ["Online payments", "Stripe checkout", "Reconciliation", "Payouts / proofs"],
        ],
        mw,
    )

    # Section 6
    pdf.h2("6. Demo talking points")
    points = [
        '"Negotiate in-product." Customer counters a quote; staff revises; vendor counters a cost offer - one commercial language on both sides.',
        '"Portal is not a track-only site." Messages, disputes, invoices, payment proofs, Stripe, credit requests, booking forms, acknowledgement.',
        '"No fake jobs." Opening a booking form does not invent a job; admin Generate Job is the cutover; form appears for staff after customer submit.',
        '"Statuses you own." Custom status catalog buttons for quotes/shipments/jobs - tenant vocabulary, not only hard-coded enums.',
        '"Three audiences, one ops spine." Staff ERP + customer portal + vendor portal share track, typed docs, and continuum with the right ACLs.',
        '"Beat-Fresa ops packs." Exceptions, DO-not-invoiced, shipment-date finance, closed overrides, overseas agent / compliance refs.',
    ]
    for i, p in enumerate(points, 1):
        pdf.set_font("Helvetica", "B", 9.5)
        pdf.set_text_color(11, 61, 92)
        pdf.cell(8, 5, f"{i}.")
        pdf.set_font("Helvetica", "", 9.5)
        pdf.set_text_color(51, 65, 85)
        pdf.multi_cell(0, 5, p)
        pdf.ln(1)

    pdf.ln(6)
    pdf.set_draw_color(203, 213, 225)
    pdf.line(pdf.l_margin, pdf.get_y(), 210 - pdf.r_margin, pdf.get_y())
    pdf.ln(3)
    pdf.set_font("Helvetica", "I", 8)
    pdf.set_text_color(100, 116, 139)
    pdf.multi_cell(
        0,
        4,
        "Source of truth: src/modules/portal, vendor, quotations, jobs, ops-activity, track, invoices. "
        "Classic Fresa parity docs: docs/fresa-parity/. This PDF highlights extensions, not 1:1 Fresa coverage. "
        "Also available as HTML: docs/Beyond-Fresa-Feature-Differentiation.html",
    )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    pdf.output(str(OUT))
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    build()
