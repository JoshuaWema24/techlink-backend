const mongoose = require("mongoose");
const express = require("express");
const techniciansModel = require("./technicians.model");

const jobsSchema = new mongoose.Schema({
  serviceType: {
    type: String,
    required: true,
  },

  customerName: {
    type: String,
    required: true,
  },

  customerNumber: {
    type: String,
    required: true,
  },

  location: {
    type: String,
    required: true,
  },

  tldescription: {
    type: String,
    required: true,
  },

  customerDescription: {
    type: String,
    required: true,
  },
  technicianName: {
    type: String,
    required: true,
  },
  technicianId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model("Job", jobsSchema);
