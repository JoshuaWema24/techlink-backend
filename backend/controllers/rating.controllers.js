// controllers/ratingController.js
const Rating = require('../models/ratingModel');
const mongoose = require('mongoose');
const express = require('express');

// Rate or update rating for a technician
exports.rateTechnician = async (req, res) => {
  try {
    const { techniciansName, stars } = req.body;
    const userId = req.user?._id || req.body.userId; // assuming you have auth, fallback to body for testing

    if (!techniciansName || !stars) {
      return res.status(400).json({ message: "Technician and stars are required" });
    }

    // Upsert (insert if not exist, update if already rated by same user)
    const rating = await Rating.findOneAndUpdate(
      { techniciansName, userId },
      { stars },
      { new: true, upsert: true, runValidators: true }
    );

    // Recalculate average rating for this technician
    const ratings = await Rating.find({ techniciansName });
    const avgStars =
      ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length;

    res.status(200).json({
      message: "Rating submitted successfully",
      technician: techniciansName,
      averageRating: avgStars.toFixed(1),
      totalRatings: ratings.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get technician’s average rating
exports.getTechnicianRating = async (req, res) => {
  try {
    const { name } = req.params;

    const ratings = await Rating.find({ techniciansName: name });
    if (ratings.length === 0) {
      return res.status(404).json({ message: "No ratings for this technician yet" });
    }

    const avgStars =
      ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length;

    res.status(200).json({
      technician: name,
      averageRating: avgStars.toFixed(1),
      totalRatings: ratings.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
