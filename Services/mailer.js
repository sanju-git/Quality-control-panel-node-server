const nodemailer = require("nodemailer");

let transporter;
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
}

exports.sendMailWithAttachment = async ({ to, subject, html, attachments }) => {
  await getTransporter().sendMail({
    from: process.env.MAIL_FROM || "reports@localhost",
    to,
    subject,
    html,
    attachments,
  });
};
