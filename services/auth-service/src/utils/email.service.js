const nodeMailer = require("nodemailer");

// Do not create SMTP connection during tests
const isTestEnvironment = process.env.NODE_ENV === "test";

let transporter = null;

if (!isTestEnvironment) {
  transporter = nodeMailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Verify SMTP connection only in non-test environments
  transporter.verify((error, success) => {
    if (error) {
      console.error("Error connecting to email server:", error);
    } else {
      console.log("Email server is ready to send messages", success);
    }
  });
}

const sendEmail = async (to, subject, text, html) => {
  // Skip sending emails during tests
  if (isTestEnvironment) {
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = {
  sendEmail,
};