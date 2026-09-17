/**
 * Render a markdown doc to PDF via Puppeteer (project dependency).
 * Usage: node scripts/md-to-pdf.cjs <input.md> [output.pdf]
 */
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

const input = process.argv[2];
const output =
  process.argv[3] ||
  (input ? input.replace(/\.md$/i, ".pdf") : null);

if (!input || !output) {
  console.error("Usage: node scripts/md-to-pdf.cjs <input.md> [output.pdf]");
  process.exit(1);
}

const md = fs.readFileSync(input, "utf8");

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inline(text) {
  let t = escapeHtml(text);
  t = t.replace(/`([^`]+)`/g, "<code>$1</code>");
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return t;
}

function mdToHtml(src) {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let i = 0;
  let inCode = false;
  let codeLang = "";
  let codeBuf = [];
  let inUl = false;
  let inTable = false;
  let tableRows = [];

  const closeUl = () => {
    if (inUl) {
      out.push("</ul>");
      inUl = false;
    }
  };
  const flushTable = () => {
    if (!inTable) return;
    out.push('<table>');
    tableRows.forEach((row, idx) => {
      if (idx === 1 && row.every((c) => /^[\s:-]+$/.test(c))) return; // separator
      const tag = idx === 0 ? "th" : "td";
      out.push("<tr>");
      row.forEach((c) => out.push(`<${tag}>${inline(c.trim())}</${tag}>`));
      out.push("</tr>");
    });
    out.push("</table>");
    inTable = false;
    tableRows = [];
  };

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      closeUl();
      flushTable();
      if (!inCode) {
        inCode = true;
        codeLang = line.slice(3).trim();
        codeBuf = [];
      } else {
        out.push(
          `<pre><code class="language-${escapeHtml(codeLang)}">${escapeHtml(codeBuf.join("\n"))}</code></pre>`,
        );
        inCode = false;
        codeBuf = [];
      }
      i++;
      continue;
    }
    if (inCode) {
      codeBuf.push(line);
      i++;
      continue;
    }

    if (line.trim().startsWith("|")) {
      closeUl();
      inTable = true;
      const cells = line
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|");
      tableRows.push(cells);
      i++;
      continue;
    } else {
      flushTable();
    }

    if (/^>\s?/.test(line)) {
      closeUl();
      out.push(`<blockquote><p>${inline(line.replace(/^>\s?/, ""))}</p></blockquote>`);
      i++;
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      closeUl();
      out.push("<hr/>");
      i++;
      continue;
    }

    if (/^### /.test(line)) {
      closeUl();
      out.push(`<h3>${inline(line.slice(4))}</h3>`);
      i++;
      continue;
    }
    if (/^## /.test(line)) {
      closeUl();
      out.push(`<h2>${inline(line.slice(3))}</h2>`);
      i++;
      continue;
    }
    if (/^# /.test(line)) {
      closeUl();
      out.push(`<h1>${inline(line.slice(2))}</h1>`);
      i++;
      continue;
    }

    if (/^[-*] /.test(line)) {
      if (!inUl) {
        out.push("<ul>");
        inUl = true;
      }
      out.push(`<li>${inline(line.replace(/^[-*] /, ""))}</li>`);
      i++;
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      closeUl();
      // simple ordered as paragraphs with number kept
      out.push(`<p>${inline(line)}</p>`);
      i++;
      continue;
    }

    if (line.trim() === "") {
      closeUl();
      i++;
      continue;
    }

    closeUl();
    out.push(`<p>${inline(line)}</p>`);
    i++;
  }
  closeUl();
  flushTable();
  return out.join("\n");
}

const body = mdToHtml(md);
const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>${path.basename(input)}</title>
<style>
  @page { margin: 18mm 16mm; }
  body {
    font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.45;
    color: #1a1a1a;
  }
  h1 { font-size: 20pt; margin: 0 0 12pt; border-bottom: 2px solid #0b3d5c; padding-bottom: 6pt; color: #0b3d5c; }
  h2 { font-size: 14pt; margin: 18pt 0 8pt; color: #0b3d5c; page-break-after: avoid; }
  h3 { font-size: 12pt; margin: 14pt 0 6pt; color: #234; page-break-after: avoid; }
  p { margin: 0 0 8pt; }
  a { color: #0b5fff; text-decoration: none; }
  code {
    font-family: Consolas, "Courier New", monospace;
    font-size: 9.5pt;
    background: #f3f5f7;
    padding: 1px 4px;
    border-radius: 3px;
  }
  pre {
    background: #f3f5f7;
    border: 1px solid #dde2e8;
    border-radius: 4px;
    padding: 10px 12px;
    overflow-x: auto;
    font-size: 9pt;
    page-break-inside: avoid;
  }
  pre code { background: transparent; padding: 0; }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 8pt 0 12pt;
    font-size: 9.5pt;
    page-break-inside: avoid;
  }
  th, td {
    border: 1px solid #c9d2dc;
    padding: 6px 8px;
    vertical-align: top;
    text-align: left;
  }
  th { background: #e8eef4; font-weight: 600; }
  blockquote {
    margin: 8pt 0;
    padding: 8pt 12pt;
    border-left: 4px solid #c45c26;
    background: #fff7f0;
  }
  ul { margin: 0 0 10pt 18pt; padding: 0; }
  li { margin: 0 0 4pt; }
  hr { border: none; border-top: 1px solid #ccd5de; margin: 16pt 0; }
  .meta { color: #555; font-size: 9.5pt; margin-bottom: 12pt; }
</style>
</head>
<body>
${body}
</body>
</html>`;

(async () => {
  const executablePath =
    process.env.PUPPETEER_EXECUTABLE_PATH ||
    (process.platform === "win32"
      ? [
          "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
          "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
        ].find((p) => fs.existsSync(p))
      : undefined);

  const browser = await puppeteer.launch({
    headless: true,
    executablePath,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.pdf({
      path: output,
      format: "A4",
      printBackground: true,
      margin: { top: "16mm", right: "14mm", bottom: "16mm", left: "14mm" },
    });
    console.log("Wrote", path.resolve(output));
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
