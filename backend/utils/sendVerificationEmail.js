const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendVerificationEmail(to, token) {
  const verifyURL = `${process.env.BASE_URL}/api/auth/verify-email/${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Verify your Admin Account",
    html: `
      <h2>Welcome to FeedbackPilot</h2>
      <p>Click the link below to verify your account:</p>
      <a href="${verifyURL}">${verifyURL}</a>
      <p>This link will expire in 1 hour.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = sendVerificationEmail;
