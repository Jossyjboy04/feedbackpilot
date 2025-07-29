const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const AdminUser = require("../models/AdminUser");
const sendVerificationEmail = require("../utils/sendVerificationEmail");

// ✅ Register Admin
router.post("/register", async (req, res) => {
  console.log("🟢 Received register data:", req.body);

  const { email, password, fullName, username } = req.body;

  try {
    const existingUser = await AdminUser.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    const verificationCooldown = new Date(); // now

    const newUser = new AdminUser({
      email,
      password: hashedPassword,
      fullName,
      username,
      isVerified: false,
      verificationToken,
      verificationTokenExpires,
      verificationCooldown
    });

    await newUser.save();

    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({ message: "Admin registered. Please verify your email." });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Login Admin
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await AdminUser.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email before logging in." });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(200).json({ token, adminId: user._id });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Email Verification
router.get("/verify-email/:token", async (req, res) => {
  const token = req.params.token;

  try {
    const user = await AdminUser.findOne({ verificationToken: token });

    if (!user) {
      return res.redirect("/verify.html?status=invalid");
    }

    const now = new Date();

    // ✅ If already verified
    if (user.isVerified) {
      return res.redirect("/verify.html?status=success");
    }

    // ✅ If token expired
    if (user.verificationTokenExpires < now) {
      const lastSent = user.verificationCooldown || new Date(0);
      const delayMinutes = 5;

      if ((now - lastSent) < delayMinutes * 60 * 1000) {
        // Delay not passed
        return res.redirect("/verify.html?status=wait");
      }

      // ✅ Generate new token
      const newToken = crypto.randomBytes(32).toString("hex");
      const newExpiry = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour

      user.verificationToken = newToken;
      user.verificationTokenExpires = newExpiry;
      user.verificationCooldown = now;
      await user.save();

      await sendVerificationEmail(user.email, newToken);

      return res.redirect("/verify.html?status=resent");
    }

    // ✅ If token is valid
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    user.verificationCooldown = null;
    await user.save();

    return res.redirect("/verify.html?status=success");
  } catch (err) {
    console.error("Verification error:", err);
    return res.redirect("/verify.html?status=error");
  }
});

module.exports = router;
