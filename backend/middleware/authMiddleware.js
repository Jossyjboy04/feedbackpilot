const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  console.log("🔐 Incoming Token:", token); // Debug

  if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("❌ Token verification error:", err.message);
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    console.log("✅ Token verified for user:", user);
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;

