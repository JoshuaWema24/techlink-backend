// models/Payment.js
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    transaction_request_id: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },
    rawInitResponse: {
      type: Object, // store UMS Pay raw response for reference
    },
    lastCheck: {
      type: Object, // response from last status check
    },
    webhookData: {
      type: Object, // payload received from UMS webhook
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
