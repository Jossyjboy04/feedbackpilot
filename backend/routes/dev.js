const express = require("express");
const router = express.Router();
const User = require("../models/AdminUser");

const DEV_SECRET = "mysecret"; // 🔐 Hardcoded dev secret (or put in .env for safety)

// TEMP DEV ROUTE: Delete all users securely
router.delete("/reset-users", async (req, res) => {
  const devSecret = req.headers["x-dev-secret"];

  if (devSecret !== DEV_SECRET) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const result = await User.deleteMany({});
    res.json({ message: `✅ ${result.deletedCount} users deleted` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete users" });
  }
});

module.exports = router;
