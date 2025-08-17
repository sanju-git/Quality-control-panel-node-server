const puppeteer = require("puppeteer");

let browser;

async function getBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
  return browser;
}

/**
 * Convert HTML to PDF (waits for charts render)
 */
exports.htmlToPdf = async (html, opts = {}) => {
  const browser = await getBrowser();
  const page = await browser.newPage();

  // Set a bigger viewport for dense A4
  await page.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: "networkidle0" });

  // Wait for Chart.js flag (set in template)
  await page
    .waitForFunction("window.__chartsReady === true", { timeout: 15000 })
    .catch(() => {});

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "8mm", right: "8mm", bottom: "12mm", left: "8mm" },
    displayHeaderFooter: Boolean(opts.footer),
    footerTemplate: opts.footer
      ? `<div style="font-size:10px;width:100%;text-align:center;padding:4px 12px;">
           ${opts.footer}
         </div>`
      : "<span></span>",
    headerTemplate: "<span></span>",
  });

  await page.close();
  return pdfBuffer;
};
