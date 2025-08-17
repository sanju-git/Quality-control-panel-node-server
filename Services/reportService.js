const ejs = require("ejs");
const path = require("path");
import { fileURLToPath } from "url";
const puppeteer = require("puppeteer");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templatePath = path.join(__dirname, "template.ejs");

exports.renderReportHtml = (data) => {
  // You can break large datasets into multiple pages inside the template
  return ejs.renderFile(templatePath, { data }, { async: true });
};

exports.generateReportPdf = async (data) => {
  const html = await renderReportHtml(data);
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: "load" });

  // Wait for charts to finish rendering (template sets window.__chartsReady)
  await page
    .waitForFunction("window.__chartsReady === true", { timeout: 30000 })
    .catch(() => {});

  const buffer = await page.pdf({
    printBackground: true,
    format: "A4",
    margin: { top: "10mm", right: "10mm", bottom: "12mm", left: "10mm" },
  });
  await browser.close();

  const filename = `spc-report-${(data?.header?.partNo || "report")
    .toString()
    .replace(/\s+/g, "_")}.pdf`;
  return { buffer, filename };
};
