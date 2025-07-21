const mongoose = require("mongoose");
const express = require("express");

const feedbackSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}); 

module.exports = mongoose.model("Feedback", feedbackSchema);