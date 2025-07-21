const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const auth = require("../middleware/auth");
const adminModel = require("../models/admin.model");

exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if admin already exists
    const existingAdmin = await adminModel.findOne({
      email: email,
    }); 
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }   
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new adminModel({
      name,
      email,
      password: hashedPassword,
      role: role || "admin", // Default to 'admin' if not provided
    });
    const savedAdmin = await newAdmin.save();
    res.status(201).json({
      message: "Admin created successfully",
      admin: {
        id: savedAdmin._id,
        name: savedAdmin.name,
        email: savedAdmin.email,
        role: savedAdmin.role,
      },
    });
    } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).json({ message: "Server error while creating admin" });
    }
}

exports.loginAdmin = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const admin = await adminModel.find({ email, role });
    if (!admin || admin.length === 0) {
      return res.status(404).json({ message: "Admin not found" });
    }
    const isMatch = await bcrypt.compare(password, admin[0].password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }
    const token = jwt.sign({ id: admin[0]._id, role }, "joshujoshu", {
      expiresIn: "1d",
    });
    const adminObj = admin[0].toObject();
    delete adminObj.password; // Remove password from response
    res.json({ token, admin: adminObj });
  } catch (error) {
    console.error("Error logging in admin:", err);
    res.status(500).json({ message: "Server error while logging in" });
  }
}