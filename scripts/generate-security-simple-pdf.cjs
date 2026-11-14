const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const { pathToFileURL } = require("url");

(async () => {
  const root = path.resolve(__dirname, "..");
  const htmlPath = path.join(
    root,
    "docs",
    "client-review",
    "KingFisher_Security_Privacy_Simple.html",
  );
  const outPath = path.join(
    root,
    "docs",
    "client-review",
    process.env.SECURITY_PDF_OUT || "KingFisher_Security_Privacy_Simple.pdf",
  );

  if (!fs.existsSync(htmlPath)) {
    throw new Error(`Missing HTML: ${htmlPath}`);
  }
  const logoPath = path.join(
    root,
    "docs",
    "client-review",
    "kingfisher-wings-logo.png",
  );
  if (!fs.existsSync(logoPath)) {
    throw new Error(`Missing logo: ${logoPath}`);
  }

  const launchOpts = {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  };
  const chromePaths = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  ].filter(Boolean);
  for (const p of chromePaths) {
    if (fs.existsSync(p)) {
      launchOpts.executablePath = p;
      break;
    }
  }

  const browser = await puppeteer.launch(launchOpts);
  const page = await browser.newPage();
  // file:// so relative logo path resolves next to the HTML
  await page.goto(pathToFileURL(htmlPath).href, {
    waitUntil: "networkidle0",
  });
  await page.pdf({
    path: outPath,
    format: "A4",
    printBackground: true,
    margin: { top: "11mm", bottom: "15mm", left: "11mm", right: "11mm" },
    displayHeaderFooter: true,
    headerTemplate: "<div></div>",
    footerTemplate: `
      <div style="font-size:7.5px;width:100%;padding:0 11mm;color:#5c6b82;display:flex;justify-content:space-between;align-items:center;font-family:Segoe UI,Arial,sans-serif;">
        <span style="color:#002d62;font-weight:600;">KingFisher Wings Group</span>
        <span></span>
        <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
      </div>`,
  });
  await browser.close();
  console.log("Wrote", outPath);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
