// module.exports = router;
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const authenticateToken = require("../middleware/authMiddleware");
const Feedback = require("../models/FeedbackModel");

// 📁 Ensure uploads folder exists
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// 🧠 Multer config for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// 📩 POST /api/feedback - Submit feedback with optional screenshot
router.post("/", upload.single("screenshot"), async (req, res) => {
  try {
    const { name, email, message, rating, adminId, phone} = req.body;

    // Validate required fields
    if (!name || !email || !message || !adminId || !phone) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // Optional screenshot path
    const screenshot = req.file ? `/uploads/${req.file.filename}` : null;

    // Save to MongoDB
    const newFeedback = new Feedback({
      name,
      email,
      phone,
      message,
      rating,
      adminId,
      screenshot,
    });

    await newFeedback.save();

    // Optionally: Send confirmation email here...

    return res.status(201).json({
      success: true,
      message: "Feedback submitted successfully.",
    });
  } catch (err) {
    console.error("Error saving feedback:", err);
    return res.status(500).json({ error: "Server error. Try again later." });
  }
});


// 🧾 GET /api/feedback - Only allow admin to view their own feedbacks
router.get("/", authenticateToken, async (req, res) => {
  try {
    const adminId = req.user.id; // Comes from the JWT payload
    if (!adminId) return res.status(401).json({ error: "Unauthorized." });

    const feedbacks = await Feedback.find({ adminId }).sort({ createdAt: -1 });

    return res.json(feedbacks);
  } catch (err) {
    console.error("Error fetching feedbacks:", err);
    return res.status(500).json({ error: "Failed to retrieve feedback." });
  }
});

module.exports = router;
