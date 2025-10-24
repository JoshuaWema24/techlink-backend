const mongoose = require('mongoose');
const express = require('express');
const payment = require('../models/payment.model');
const axios = require('axios');

// controllers/payments.controller.js
const axios = require("axios");

exports.initiatePayment = async (req, res) => {
  const { phoneNumber, amount, orderId, customerName } = req.body;

  try {
    const response = await axios.post(
      `${process.env.MEGAPAY_BASE_URL}/api/payments/stkpush`,
      {
        merchantCode: process.env.MEGAPAY_MERCHANT_CODE,
        apiKey: process.env.MEGAPAY_API_KEY,
        amount,
        msisdn: phoneNumber,
        reference: orderId,
        description: `Payment for ${customerName}`,
        callbackUrl: process.env.CALLBACK_URL,
      }
    );

    console.log("✅ MegaPay STK push response:", response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("❌ MegaPay STK push error:", error.response?.data || error);
    res.status(500).json({
      message: "Failed to initiate payment",
      error: error.response?.data || error.message,
    });
  }
};

// === CALLBACK HANDLER ===
exports.handleCallback = async (req, res) => {
  try {
    console.log("📩 MegaPay callback received:", req.body);

    const { reference, status, transactionId, amount, msisdn } = req.body;

    // TODO: Update your database here (e.g. mark request or order as paid)
    // Example:
    // await Payment.updateOne({ orderId: reference }, { status, transactionId });

    res.status(200).json({ message: "Callback received successfully" });
  } catch (err) {
    console.error("❌ Callback handling error:", err);
    res.status(500).json({ message: "Error processing callback" });
  }
};

// ===== B2C: Send Payment to Technician =====
exports.sendPayout = async (req, res) => {
  const { technicianPhone, amount, reference, technicianName } = req.body;

  try {
    const response = await axios.post(
      `${process.env.MEGAPAY_BASE_URL}/api/payments/b2c`,
      {
        merchantCode: process.env.MEGAPAY_MERCHANT_CODE,
        apiKey: process.env.MEGAPAY_API_KEY,
        amount,
        msisdn: technicianPhone,
        reference,
        description: `Payout to ${technicianName}`,
        callbackUrl: process.env.CALLBACK_URL, // same or different callback for tracking
      }
    );

    console.log("✅ MegaPay B2C payout response:", response.data);
    res.status(200).json({
      message: "Payout initiated successfully",
      data: response.data,
    });
  } catch (error) {
    console.error("❌ MegaPay B2C payout error:", error.response?.data || error);
    res.status(500).json({
      message: "Failed to send payout",
      error: error.response?.data || error.message,
    });
  }
};
