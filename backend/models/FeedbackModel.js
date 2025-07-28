const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false,
  },
  message: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  phone: {
    type: String,
    required: true,
  },
  screenshot:{
type:String,
required:true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  adminId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "AdminUser",
  required: true
}

});

module.exports = mongoose.model("Feedback", feedbackSchema);
