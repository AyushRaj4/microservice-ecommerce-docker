const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

async function sendMail(to, subject, text) {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
  console.log(`📧 Mail sent to ${to}`);
}

module.exports = sendMail;
