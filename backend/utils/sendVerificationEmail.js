const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendVerificationEmail(to, token) {
 const link = `${process.env.BASE_URL}/api/auth/verify-email/${token}`;
 const mailOptions = {
    from: `"Feedback Pilot"`,
    to,
    subject: "Email Verification - Admin Access",
    html: `
      <h2>Verify Your Email</h2>
      <p>Click the button below to verify your email address:</p>
      <a href="${link}" style="display:inline-block;padding:10px 20px;background:#2d6cdf;color:white;border-radius:5px;text-decoration:none;">Verify Email</a>
      <p>If the button doesn't work, paste this link in your browser:</p>
      <p>${link}</p>
    `
  };

  await transporter.sendMail(mailOptions);
}

module.exports = sendVerificationEmail;

