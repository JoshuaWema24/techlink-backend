const mongoose = require('mongoose'); 
const express = require('express');

const serviceSchema = new mongoose.Schema({ 
  serviceName: {
    type: String,
    required: true,
    unique: true,
  },
  serviceInfo: {
    type: String,
    required: true,
  },
});

const Service = mongoose.model('Service', serviceSchema);
module.exports = Service;
