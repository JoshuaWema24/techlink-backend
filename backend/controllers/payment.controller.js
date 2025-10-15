const express = require('express');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { initiateStkPush, checkTransactionStatus } = require('../services/umspay.service');

// Initiate STK Push
exports.initiateStkPush = async (req, res) => {
  try {
    let { phone, amount } = req.body;

    if (!phone || !amount) {
      return res.status(400).json({ success: false, message: "phone and amount required" });
    }

    // Normalize phone → 2547XXXXXXXX
    phone = phone.replace(/\s+/g, "");
    if (/^07\d{8}$/.test(phone)) phone = "254" + phone.slice(1);

    if (!/^2547\d{8}$/.test(phone)) {
      return res.status(400).json({ success: false, message: "Invalid Safaricom number" });
    }

    amount = Number(amount);
    if (Number.isNaN(amount) || amount < 1) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    const reference = `TL-${uuidv4()}`;

    // Call UMS Pay
    const umspayResp = await initiateStkPush({ msisdn: phone, amount, reference });

    const transactionRequestId =
      umspayResp.transaction_request_id || umspayResp.transactionRequestId || null;

    // Save to store
    PAYMENT_STORE[reference] = {
      status: "PENDING",
      amount,
      phone,
      reference,
      transaction_request_id: transactionRequestId,
      raw: umspayResp,
      createdAt: new Date().toISOString(),
    };

    return res.json({
      success: true,
      message: "STK Push initiated",
      data: { reference, transaction_request_id: transactionRequestId },
    });
  } catch (err) {
    console.error("Error initiating STK push:", err?.response?.data || err.message);
    return res.status(500).json({ success: false, message: "Failed to initiate STK push" });
  }
};

// Check Payment Status
exports.checkPaymentStatus = async (req, res) => {
  try {
    const { reference } = req.params;
    const record = PAYMENT_STORE[reference];
    if (!record) return res.status(404).json({ success: false, message: "Reference not found" });

    if (record.transaction_request_id) {
      try {
        const statusResp = await checkTransactionStatus({
          transaction_request_id: record.transaction_request_id,
        });

        const statusLower = JSON.stringify(statusResp).toLowerCase();
        if (statusLower.includes("success")) record.status = "SUCCESS";
        else if (statusLower.includes("fail")) record.status = "FAILED";
        else record.status = "PENDING";

        record.lastCheck = { timestamp: new Date().toISOString(), raw: statusResp };
      } catch (err) {
        console.warn("Status check failed:", err.message);
      }
    }

    return res.json({ success: true, data: { reference, status: record.status } });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error checking status" });
  }
};

// Handle UMS Pay Webhook
exports.handleWebhook = (req, res) => {
  try {
    const payload = req.body;
    const { reference, transaction_request_id, status } = payload;

    let record = PAYMENT_STORE[reference];
    if (!record) {
      record = Object.values(PAYMENT_STORE).find(
        (r) => r.transaction_request_id === transaction_request_id
      );
    }

    if (record) {
      const statusStr = (status || "").toLowerCase();
      if (statusStr.includes("success")) record.status = "SUCCESS";
      else if (statusStr.includes("fail")) record.status = "FAILED";
      else record.status = "PENDING";

      record.webhook = payload;
      record.updatedAt = new Date().toISOString();
    }

    return res.json({ success: true, message: "Webhook received" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Webhook error" });
  }
};