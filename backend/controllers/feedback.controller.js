const mongoose = require("mongoose");
const express = require("express");
 const Feedback = require("../models/feedback.model");

const Feedback = require("../models/feedback.model");

// Create feedback
exports.createFeedback = async (req, res) => {
  // Accept userMessage from frontend
  const { name, email, subject, userMessage } = req.body;

  if (!name || !email || !userMessage) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const feedback = new Feedback({
      name,
      email,
      subject: subject || "",   // optional
      message: userMessage      // store userMessage in DB
    });

    await feedback.save();
    res.status(201).json({ message: "Feedback submitted successfully" });
  } catch (error) {
    console.error("Error saving feedback:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all feedback
exports.getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    if (!feedbacks.length) {
      return res.status(404).json({ message: "No feedback found" });
    }
    res.status(200).json(feedbacks);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ message: "Server error" });
  }
};
