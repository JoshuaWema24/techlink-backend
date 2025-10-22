// models/ratingModel.js
const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  techniciansName: { type: String, required: true },
  stars: { type: Number, required: true, min: 1, max: 5 },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true } // so each user rates only once
});

// Ensure a user can only rate a technician once
ratingSchema.index({ techniciansName: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Rating", ratingSchema);
