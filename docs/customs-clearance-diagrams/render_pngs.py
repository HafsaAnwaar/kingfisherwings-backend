"""Render Customs Clearance workflow diagrams to PNG."""
from __future__ import annotations

from collections import defaultdict, deque
import os

from PIL import Image, ImageDraw, ImageFont

OUT = os.path.dirname(os.path.abspath(__file__))


def load_font(size: int, bold: bool = False) -> ImageFont.ImageFont:
    candidates = [
        r"C:\Windows\Fonts\segoeuib.ttf" if bold else r"C:\Windows\Fonts\segoeui.ttf",
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
        r"C:\Windows\Fonts\segoeui.ttf",
        r"C:\Windows\Fonts\arial.ttf",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


FONT_TITLE = load_font(26, True)
FONT_SUB = load_font(15)
FONT_NODE = load_font(13)
FONT_FOOT = load_font(11)

BG = (250, 250, 252)
CARD = (255, 255, 255)
STROKE = (55, 65, 81)
EDGE = (75, 85, 99)
TITLE_C = (17, 24, 39)
SUB_C = (75, 85, 99)
DECISION_FILL = (254, 243, 199)
END_FILL = (220, 252, 231)


def wrap_label(label: str) -> list[str]:
    return [ln.strip() for ln in label.split("\n") if ln.strip()]


def layout_dag(
    nodes: list[dict],
    edges: list[dict],
    direction: str = "vertical",
    node_w: int = 200,
    node_h: int = 70,
    rank_gap: int = 56,
    node_gap: int = 28,
    pad: int = 48,
    fixed_ranks: dict[str, int] | None = None,
):
    ids = [n["id"] for n in nodes]
    succ: dict[str, list[str]] = defaultdict(list)
    indeg = {i: 0 for i in ids}
    id_set = set(ids)

    for e in edges:
        a, b = e["from"], e["to"]
        if a not in id_set or b not in id_set:
            continue
        if e.get("back"):
            continue
        succ[a].append(b)
        indeg[b] += 1

    if fixed_ranks:
        rank = {nid: fixed_ranks[nid] for nid in ids if nid in fixed_ranks}
        for nid in ids:
            if nid not in rank:
                rank[nid] = max(rank.values(), default=0) + 1
    else:
        rank = {}
        q = deque([i for i in ids if indeg[i] == 0])
        for i in ids:
            if indeg[i] == 0:
                rank[i] = 0
        while q:
            u = q.popleft()
            for v in succ[u]:
                indeg[v] -= 1
                rank[v] = max(rank.get(v, 0), rank[u] + 1)
                if indeg[v] == 0:
                    q.append(v)
        leftover = max(rank.values(), default=0) + 1
        for i in ids:
            if i not in rank:
                rank[i] = leftover
                leftover += 1

    by_rank: dict[int, list[str]] = defaultdict(list)
    for n in nodes:
        by_rank[rank[n["id"]]].append(n["id"])

    positions: dict[str, tuple[int, int]] = {}
    if direction == "vertical":
        max_count = max(len(v) for v in by_rank.values())
        content_w = max_count * node_w + (max_count - 1) * node_gap
        for r, ids_r in sorted(by_rank.items()):
            y = pad + 90 + r * (node_h + rank_gap)
            total = len(ids_r) * node_w + (len(ids_r) - 1) * node_gap
            start_x = pad + (content_w - total) // 2
            for i, nid in enumerate(ids_r):
                positions[nid] = (start_x + i * (node_w + node_gap), y)
        width = pad * 2 + content_w
        height = pad + 90 + (max(by_rank) + 1) * (node_h + rank_gap) + pad
    else:
        content_h = max(len(v) for v in by_rank.values()) * node_h + (
            max(len(v) for v in by_rank.values()) - 1
        ) * node_gap
        for r, ids_r in sorted(by_rank.items()):
            x = pad + r * (node_w + rank_gap)
            total = len(ids_r) * node_h + (len(ids_r) - 1) * node_gap
            start_y = pad + 90 + max(content_h - total, 0) // 2
            for i, nid in enumerate(ids_r):
                positions[nid] = (x, start_y + i * (node_h + node_gap))
        width = pad * 2 + (max(by_rank) + 1) * (node_w + rank_gap) - rank_gap
        height = pad + 90 + content_h + pad

    return positions, width, height


def draw_diagram(
    path: str,
    title: str,
    subtitle: str,
    nodes: list[dict],
    edges: list[dict],
    direction: str = "vertical",
    node_w: int = 200,
    node_h: int = 72,
    decision_ids: set[str] | None = None,
    end_ids: set[str] | None = None,
    fixed_ranks: dict[str, int] | None = None,
):
    decision_ids = decision_ids or set()
    end_ids = end_ids or set()
    positions, w, h = layout_dag(
        nodes,
        edges,
        direction,
        node_w,
        node_h,
        rank_gap=52 if direction == "vertical" else 36,
        node_gap=24 if direction == "vertical" else 22,
        pad=56,
        fixed_ranks=fixed_ranks,
    )
    w = max(w, 960)
    img = Image.new("RGB", (w, h + 36), BG)
    draw = ImageDraw.Draw(img)

    draw.rectangle([0, 0, w, 72], fill=CARD)
    draw.line([0, 72, w, 72], fill=(226, 232, 240), width=1)
    draw.text((40, 14), title, font=FONT_TITLE, fill=TITLE_C)
    draw.text((40, 46), subtitle, font=FONT_SUB, fill=SUB_C)

    labels = {n["id"]: wrap_label(n["label"]) for n in nodes}

    for e in edges:
        if e["from"] not in positions or e["to"] not in positions:
            continue
        x1, y1 = positions[e["from"]]
        x2, y2 = positions[e["to"]]
        if direction == "vertical":
            sx, sy = x1 + node_w // 2, y1 + node_h
            tx, ty = x2 + node_w // 2, y2
        else:
            # route back-edges above
            if e.get("back"):
                sx, sy = x1 + node_w // 2, y1
                tx, ty = x2 + node_w // 2, y2
                mid_y = min(sy, ty) - 28
                draw.line([(sx, sy), (sx, mid_y), (tx, mid_y), (tx, ty)], fill=EDGE, width=2)
                draw.polygon([(tx, ty), (tx - 6, ty - 10), (tx + 6, ty - 10)], fill=EDGE)
                continue
            sx, sy = x1 + node_w, y1 + node_h // 2
            tx, ty = x2, y2 + node_h // 2
        draw.line([(sx, sy), (tx, ty)], fill=EDGE, width=2)
        if direction == "vertical":
            draw.polygon([(tx, ty), (tx - 6, ty - 10), (tx + 6, ty - 10)], fill=EDGE)
        else:
            draw.polygon([(tx, ty), (tx - 10, ty - 6), (tx - 10, ty + 6)], fill=EDGE)

    for n in nodes:
        nid = n["id"]
        x, y = positions[nid]
        if nid in decision_ids:
            fill = DECISION_FILL
        elif nid in end_ids:
            fill = END_FILL
        else:
            fill = CARD
        draw.rounded_rectangle(
            [x, y, x + node_w, y + node_h],
            radius=10,
            fill=fill,
            outline=STROKE,
            width=2,
        )
        lines = labels[nid]
        line_h = 17
        block_h = len(lines) * line_h
        ty = y + (node_h - block_h) // 2
        for i, ln in enumerate(lines):
            bbox = draw.textbbox((0, 0), ln, font=FONT_NODE)
            tw = bbox[2] - bbox[0]
            tx = x + (node_w - tw) // 2
            draw.text((tx, ty + i * line_h), ln, font=FONT_NODE, fill=TITLE_C)

    draw.text(
        (40, h + 6),
        "KingFisher · Customs Clearance · for sharing",
        font=FONT_FOOT,
        fill=SUB_C,
    )
    img.save(path, "PNG", optimize=True)
    print(f"WROTE {path} {img.size}")


def main() -> None:
    main_nodes = [
        {"id": "enq", "label": "1. Clearance\nenquiry"},
        {"id": "quote", "label": "2. Quote CC\nservice only"},
        {"id": "accept", "label": "3. Customer\naccepts"},
        {"id": "job", "label": "4. Create Job\nCUSTOMS_CLEARANCE"},
        {"id": "docs", "label": "5. Collect docs\nchecklist"},
        {"id": "hs", "label": "6. Classify\nHS + value"},
        {"id": "risk", "label": "7. Compliance\ncheck"},
        {"id": "file", "label": "8. File entry\nBOE / SB"},
        {"id": "assess", "label": "9. Assessment\n& duty"},
        {"id": "pay", "label": "10. Pay duty\n/ tax / fees"},
        {"id": "exam", "label": "11. Exam?\n(optional)"},
        {"id": "clear", "label": "12. Cleared"},
        {"id": "release", "label": "13. Release\ncargo / DO"},
        {"id": "bill", "label": "14. Invoice\nCC charges"},
        {"id": "close", "label": "15. Close job\n+ archive"},
    ]
    main_edges = [
        {"from": a, "to": b}
        for a, b in [
            ("enq", "quote"),
            ("quote", "accept"),
            ("accept", "job"),
            ("job", "docs"),
            ("docs", "hs"),
            ("hs", "risk"),
            ("risk", "file"),
            ("file", "assess"),
            ("assess", "pay"),
            ("pay", "exam"),
            ("exam", "clear"),
            ("clear", "release"),
            ("release", "bill"),
            ("bill", "close"),
        ]
    ]
    draw_diagram(
        os.path.join(OUT, "05-flowchart-end-to-end-cc.png"),
        "5. Flowchart — End-to-end CC service",
        "Happy path · Exam optional · KingFisher Customs Clearance",
        main_nodes,
        main_edges,
        "vertical",
        node_w=210,
        node_h=74,
        decision_ids={"exam", "risk"},
        end_ids={"close"},
    )

    act_nodes = [
        {"id": "c_req", "label": "Customer\nrequests CC"},
        {"id": "s_quote", "label": "Sales\nquotes fee"},
        {"id": "c_ok", "label": "Customer\napproves"},
        {"id": "ops_open", "label": "Ops opens\nCC job"},
        {"id": "c_docs", "label": "Customer\nuploads docs"},
        {"id": "ops_check", "label": "Ops verifies\nchecklist"},
        {"id": "ops_hs", "label": "CHA classifies\nHS codes"},
        {"id": "sys_block", "label": "System flags\nprohibited?"},
        {"id": "ops_file", "label": "File with\nCustoms"},
        {"id": "cust_q", "label": "Customs\nquery?"},
        {"id": "ops_reply", "label": "Ops replies\n/ amend"},
        {"id": "duty", "label": "Duty notice\nreceived"},
        {"id": "fin_pay", "label": "Finance pays\nor client pays"},
        {"id": "exam", "label": "Physical\nexam?"},
        {"id": "pass", "label": "Pass / fail\nexam"},
        {"id": "cleared", "label": "Status =\nCLEARED"},
        {"id": "release", "label": "Release order\nto yard/CFS"},
        {"id": "inv", "label": "Invoice CC\n+ disbursements"},
        {"id": "done", "label": "Job\nCOMPLETED"},
    ]
    act_edges = [
        {"from": a, "to": b}
        for a, b in [
            ("c_req", "s_quote"),
            ("s_quote", "c_ok"),
            ("c_ok", "ops_open"),
            ("ops_open", "c_docs"),
            ("c_docs", "ops_check"),
            ("ops_check", "ops_hs"),
            ("ops_hs", "sys_block"),
            ("sys_block", "ops_file"),
            ("ops_file", "cust_q"),
            ("cust_q", "ops_reply"),
            ("ops_reply", "duty"),
            ("cust_q", "duty"),
            ("duty", "fin_pay"),
            ("fin_pay", "exam"),
            ("exam", "pass"),
            ("exam", "cleared"),
            ("pass", "cleared"),
            ("cleared", "release"),
            ("release", "inv"),
            ("inv", "done"),
        ]
    ]
    draw_diagram(
        os.path.join(OUT, "06-activity-who-does-what.png"),
        "6. Activity diagram — Who does what",
        "Customer → Sales → Ops/CHA → Customs → Finance",
        act_nodes,
        act_edges,
        "vertical",
        node_w=190,
        node_h=70,
        decision_ids={"sys_block", "cust_q", "exam"},
        end_ids={"done"},
    )

    st_nodes = [
        {"id": "pending", "label": "PENDING\nintake"},
        {"id": "docs", "label": "DOCS_\nCOLLECTING"},
        {"id": "classified", "label": "CLASSIFIED\nHS ready"},
        {"id": "filed", "label": "FILED\nentry lodged"},
        {"id": "query", "label": "QUERY\ncustoms ask"},
        {"id": "assessed", "label": "ASSESSED\nduty known"},
        {"id": "paid", "label": "DUTY_PAID"},
        {"id": "exam", "label": "UNDER_\nEXAM"},
        {"id": "cleared", "label": "CLEARED"},
        {"id": "released", "label": "RELEASED"},
        {"id": "closed", "label": "CLOSED"},
    ]
    st_edges = [
        {"from": a, "to": b, **({"back": True} if (a, b) in {("query", "filed"), ("exam", "query")} else {})}
        for a, b in [
            ("pending", "docs"),
            ("docs", "classified"),
            ("classified", "filed"),
            ("filed", "query"),
            ("filed", "assessed"),
            ("query", "filed"),
            ("assessed", "paid"),
            ("paid", "exam"),
            ("paid", "cleared"),
            ("exam", "cleared"),
            ("exam", "query"),
            ("cleared", "released"),
            ("released", "closed"),
        ]
    ]
    draw_diagram(
        os.path.join(OUT, "07-status-state-machine.png"),
        "7. Status / activity state machine",
        "Recommended clearance statuses · extends PENDING→RELEASED",
        st_nodes,
        st_edges,
        "horizontal",
        node_w=136,
        node_h=68,
        decision_ids={"query", "exam"},
        end_ids={"closed"},
        fixed_ranks={
            "pending": 0,
            "docs": 1,
            "classified": 2,
            "filed": 3,
            "query": 4,
            "assessed": 4,
            "paid": 5,
            "exam": 6,
            "cleared": 7,
            "released": 8,
            "closed": 9,
        },
    )


if __name__ == "__main__":
    main()
