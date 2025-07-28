// server.js
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Serve static frontend files from the "public" folder
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Route Files
const feedbackRoutes = require("./routes/feedback");
const authRoutes = require("./routes/auth");
const devRoutes = require("./routes/dev");

// ✅ API Routes
app.use("/api/feedback", feedbackRoutes); // Feedback submission & retrieval
app.use("/api/auth", authRoutes);              // Register, login, verify
app.use("/api/dev", devRoutes);           // Developer utilities
// ✅ Root route
app.get("/", (req, res) => {
  res.send("🎯 FeedbackPilot API is live and running");
});

// ✅ Fallback route to handle any other frontend files like verify.html
// ✅ Only serve verify.html for unmatched frontend routes (not /api/*)
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "verify.html"));
});

// ✅ MongoDB Connection & Server Start
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
