const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Serve static frontend files
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Routes
const feedbackRoutes = require("./routes/feedback");
const authRoutes = require("./routes/auth");
const devRoutes = require("./routes/dev");

app.use("/api/feedback", feedbackRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dev", devRoutes);

// ✅ Root route – show registration page (now renamed to index.html)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html")); // this is your renamed register.html
});

// ✅ Catch-all for frontend routes (excluding /api) – fallback to verify.html
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "verify.html"));
});

// ✅ Connect to MongoDB and start the server
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
