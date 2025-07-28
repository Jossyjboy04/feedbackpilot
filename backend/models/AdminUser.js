const mongoose = require("mongoose");

const AdminUserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/.+@.+\..+/, "Please enter a valid email address"]
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  password: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String
  },
  verificationTokenExpires: {
    type: Date,
    default: null
  },
  verificationCooldown: {
    type: Date,
    default: null
  }
});

// ✅ Check if the model already exists to prevent OverwriteModelError
module.exports = mongoose.models.AdminUser || mongoose.model("AdminUser", AdminUserSchema);
