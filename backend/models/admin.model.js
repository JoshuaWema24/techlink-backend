const mongoose = require("mongoose");
const express = require("express");

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
    email: {
    type: String,
    required: true,
    unique: true,
    },
    password: {
    type: String,
    required: true,
    },
    role: {
    type: String,
    required: true,
    enum: ["admin"],
    default: "admin",
    },
});

module.exports = mongoose.model("Admin", adminSchema);