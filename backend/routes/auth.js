const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const AdminUser = require("../models/AdminUser");
const sendVerificationEmail = require("../utils/sendVerificationEmail");

// ✅ Register Admin (with resend if already exists but not verified)
router.post("/register", async (req, res) => {
  console.log("🟢 Hit /register route");
  const { email, password, fullName, username } = req.body;
  console.log("📩 Payload received:", { email, fullName, username });

  try {
    if (!email || !password || !fullName || !username) {
      console.warn("❗ Missing registration fields");
      return res.status(400).json({ message: "All fields are required" });
    }

    let existingUser = await AdminUser.findOne({ email });

    if (existingUser) {
      if (!existingUser.isVerified) {
        const now = new Date();
        const lastSent = existingUser.verificationCooldown || new Date(0);
        const cooldownMinutes = 5;

        if ((now - lastSent) < cooldownMinutes * 60 * 1000) {
          console.log("🕒 Throttled resend attempt");
          return res.status(429).json({
            message: "Verification link recently sent. Try again in a few minutes.",
          });
        }

        const newToken = crypto.randomBytes(32).toString("hex");
        const tokenExpires = new Date(now.getTime() + 60 * 60 * 1000);

        existingUser.verificationToken = newToken;
        existingUser.verificationTokenExpires = tokenExpires;
        existingUser.verificationCooldown = now;
        await existingUser.save();

        console.log("📨 Resending verification email...");
        await sendVerificationEmail(email, newToken);

        return res.status(200).json({
          message: "User already exists but is unverified. New verification link sent.",
        });
      }

      console.warn("⛔ User already exists and is verified");
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
    const verificationCooldown = new Date();

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

    console.log("✅ User saved, sending verification email...");
    await sendVerificationEmail(email, verificationToken);

    return res.status(201).json({ message: "Admin registered. Please verify your email." });
  } catch (err) {
    console.error("❌ Error during registration:", err);
    return res.status(500).json({ message: "Server error during registration" });
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
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Email Verification
router.get("/verify-email/:token", async (req, res) => {
  const token = req.params.token;

  try {
    const user = await AdminUser.findOne({ verificationToken: token });

    if (!user) return res.redirect("/verify.html?status=invalid");

    const now = new Date();

    if (user.isVerified) {
      return res.redirect("/verify.html?status=success");
    }

    if (user.verificationTokenExpires < now) {
      const lastSent = user.verificationCooldown || new Date(0);
      const delayMinutes = 5;

      if ((now - lastSent) < delayMinutes * 60 * 1000) {
        return res.redirect("/verify.html?status=wait");
      }

      const newToken = crypto.randomBytes(32).toString("hex");
      const newExpiry = new Date(now.getTime() + 60 * 60 * 1000);

      user.verificationToken = newToken;
      user.verificationTokenExpires = newExpiry;
      user.verificationCooldown = now;
      await user.save();

      await sendVerificationEmail(user.email, newToken);
      return res.redirect("/verify.html?status=resent");
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    user.verificationCooldown = null;
    await user.save();

    return res.redirect("/verify.html?status=success");
  } catch (err) {
    console.error("❌ Verification error:", err);
    return res.redirect("/verify.html?status=error");
  }
});

module.exports = router;
