const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

(async () => {
  const root = path.resolve(__dirname, "..");
  const htmlPath = path.join(root, "docs", "Beyond-Fresa-Feature-Differentiation.html");
  const outPath = path.join(root, "docs", "Beyond-Fresa-Feature-Differentiation.pdf");
  const html = fs.readFileSync(htmlPath, "utf8");

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
  await page.setContent(html, { waitUntil: "networkidle0" });
  await page.pdf({
    path: outPath,
    format: "A4",
    printBackground: true,
    margin: { top: "14mm", bottom: "16mm", left: "12mm", right: "12mm" },
    displayHeaderFooter: true,
    headerTemplate: "<div></div>",
    footerTemplate:
      '<div style="font-size:8px;width:100%;text-align:center;color:#64748b;padding:0 12mm;">KingFisher Wings — Beyond Fresa · <span class="pageNumber"></span> / <span class="totalPages"></span></div>',
  });
  await browser.close();
  console.log("Wrote", outPath);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
