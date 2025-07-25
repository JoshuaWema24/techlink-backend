const mongoose = require("mongoose");
const express = require("express");

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
    type: mongoose.Schema.Types.ObjectId,
    ref: "Technician",
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Technician",
    required: true,
  },
});
module.exports = mongoose.model("job", jobSchema);
