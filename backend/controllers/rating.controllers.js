// controllers/ratingController.js
const Rating = require('../models/ratingModel');
const mongoose = require('mongoose');
const express = require('express');

// customer feedback
exports.createRating = async (req, res) => {
  const { customerId, punctuality, responseTime, comment, techniciansId, serviceRating } = req.body;
  console.log(req.body);
  try {
    const newRating = new Rating({
      customerId: mongoose.Types.ObjectId(customerId),   
      techniciansId: mongoose.Types.ObjectId(techniciansId),
      punctuality,
      responseTime,
      comment,
      serviceRating
    });
    const savedRating = await newRating.save();
    console.log('rating saved', savedRating);
    res.status(201).json(savedRating);
  } catch (error) {
    console.error('Error creating rating:', error);
    res.status(500).json({ message: 'Server error' });
  } 
};
