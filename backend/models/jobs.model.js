const mongoose = require('mongoose');
const express = require('express');

const jobsSchema = new mongoose.Schema = {
    serviceType: {
        type: String,
        required: true
    },

    customerName: {
        type: String,
        required: true
    },

    customerNumber: {
        type: String,
        required: true,
    },

    location: {
        type: String,
        required: true
    },

    tldescription: {
        type: String,
        required: true
    },

    customerDescription: {
        type: String,
        required: true
    }
};

exports.Jobs = mongoose.model('jobs', jobsSchema);