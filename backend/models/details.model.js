const mongoose = require("mongoose");

const detailsSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Request",
    required: false, // optional, but useful
  },
  technicianName: {
    type: String,
    required: true,
  },
  serviceDone: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Detail", detailsSchema);
