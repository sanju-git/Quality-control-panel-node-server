// const { Router } = require("express";
const express = require("express");
const { getReportDataById } = require("../data/sampleData.js");
const { htmlFromData } = require("../Services/renderReport.js");
const { htmlToPdf } = require("../Services/puppeteer.js");
const { sendMailWithAttachment } = require("../Services/mailer.js");

// const router = Router();
// const express = require("express");
const router = express.Router();

/**
 * Preview the HTML (useful for debugging the layout quickly)
 */
router.get("/:id/html", async (req, res) => {
  const data = await getReportDataById(req.params.id);
  if (!data) return res.status(404).send("Not found");
  const html = await htmlFromData(data);
  res.set("Content-Type", "text/html; charset=utf-8").send(html);
});

/**
 * Get the PDF (inline=1 to view in browser; otherwise download)
 */
router.get("/:id/pdf", async (req, res) => {
  const data = await getReportDataById(req.params.id);
  if (!data) return res.status(404).send("Not found");

  const html = await htmlFromData(data);
  const pdfBuffer = await htmlToPdf(html, {
    footer: `Page {{page}} / {{pages}}`,
  });

  const fileName = `SPC_Report_${data.partNo}_${data.charName}.pdf`;
  const disp = req.query.inline ? "inline" : "attachment";
  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `${disp}; filename="${fileName}"`,
  });
  res.send(pdfBuffer);
});

/**
 * (Optional) Trigger email for a specific report id
 */
router.post("/:id/email", async (req, res) => {
  const data = await getReportDataById(req.params.id);
  if (!data) return res.status(404).send("Not found");

  const html = await htmlFromData(data);
  const pdfBuffer = await htmlToPdf(html, {
    footer: `Page {{page}} / {{pages}}`,
  });

  await sendMailWithAttachment({
    to: req.body.to || process.env.DAILY_RECIPIENTS,
    subject: `Daily SPC Report — ${data.partNo} / ${data.charName}`,
    html: `<p>Please find the attached SPC report.</p>`,
    attachments: [
      {
        filename: `SPC_Report_${data.partNo}_${data.charName}.pdf`,
        content: pdfBuffer,
      },
    ],
  });

  res.json({ ok: true });
});

module.exports =  router;
