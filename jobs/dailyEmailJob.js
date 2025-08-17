const { getTodayReportData } = require("../data/sampleData");
const { sendMailWithAttachment } = require("../Services/mailer");
const { htmlToPdf } = require("../Services/puppeteer");
const { htmlFromData } = require("../Services/renderReport");
const cron = require("node-cron");

exports.scheduleDailyJob = () => {
  // Runs every day at 09:00 local server time (configurable)
  const hour = process.env.DAILY_REPORT_TIME || "09";
  const expr = `0 ${hour} * * *`;
  cron.schedule(expr, async () => {
    try {
      await runOnce();
      console.log("[dailyEmailJob] sent");
    } catch (e) {
      console.error("[dailyEmailJob] failed", e);
    }
  });
};

exports.runOnce = async () => {
  const data = await getTodayReportData();
  if (!data) return;

  const html = await htmlFromData(data);
  const pdfBuffer = await htmlToPdf(html, {
    footer: "Page {{page}} / {{pages}}",
  });

  await sendMailWithAttachment({
    to: process.env.DAILY_RECIPIENTS,
    subject: `Daily SPC Reports — ${new Date().toLocaleDateString()}`,
    html: `<p>Attached are today's SPC reports.</p>`,
    attachments: [
      { filename: `SPC_Reports_${Date.now()}.pdf`, content: pdfBuffer },
    ],
  });
};
