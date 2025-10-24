// models/ratingModel.js
const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    techniciansId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Technician",
      required: true,
    },
    punctuality: { type: Number, required: true },
    responseTime: { type: Number, required: true },
    comment: { type: String },
    serviceRating: { type: Number, required: true },
  },
  { timestamps: true }
);
