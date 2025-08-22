const mongoose = require("mongoose");
const express = require("express");
const Feedback = require("../models/feedback.model");

// Create feedback
// Create new feedback
exports.createFeedback = async (req, res) => {
  const { name, email, subject, userMessage } = req.body;

  if (!name || !email || !userMessage) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // create with timestamp
    const feedback = new Feedback({
      name,
      email,
      subject,
      message,
      timestamp: new Date(),
    });
    await feedback.save();

    // return the saved feedback object
    res.status(201).json(feedback);
  } catch (error) {
    console.error("Error saving feedback:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all feedback
exports.getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ timestamp: -1 });
    if (!feedbacks.length) {
      return res.status(404).json({ message: "No feedback found" });
    }
    res.status(200).json(feedbacks);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(400).json({ message: "Error fetching feedback", error });
  }
};
