const mongoose = require("mongoose");
const Technician = require("../models/technicians.model");
const bcrypt = require("bcrypt");
const express = require("express");

// Create technician
exports.createTechnician = async (req, res, io) => {
  try {
    const {
      name,
      email,
      phonenumber,
      country,
      county,
      subcounty,
      estate,
      password,
      jobtype,
    } = req.body;
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newTechnician = new Technician({
      name,
      email,
      phonenumber,
      country,
      county,
      subcounty,
      estate,
      password: hashedPassword,
      jobtype,
    });

    const savedTechnician = await newTechnician.save();

    // Emit event to connected clients
    io.emit("technicianAdded", savedTechnician);

    res.status(201).json({
      message: "Technician created successfully",
      technician: savedTechnician,
    });
  } catch (error) {
    console.error("Error creating technician:", error);

    // Handle other types of errors
    res.status(500).json({
      message: "Error creating technician",
      error: error.message || "Unknown error occurred",
    });
  }
};

// Get all technicians
exports.getTechnicians = async (req, res, io) => {
  try {
    const technicians = await Technician.find();
    if (!technicians.length) {
      return res.status(404).json({ message: "No technicians found" });
    }
    res.status(200).json(technicians);
  } catch (error) {
    console.error("Error fetching technicians:", error);
    res.status(400).json({ message: "Error fetching technicians", error });
  }
};

// Get technician by name
exports.getTechnician = async (req, res, io) => {
  try {
    const { name } = req.params;
    const technician = await Technician.findOne({ name });
    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }
    res.status(200).json(technician);
  } catch (error) {
    console.error("Error fetching technician:", error);
    res.status(400).json({ message: "Error fetching technician", error });
  }
};

// Update technician by name
exports.updateTechnician = async (req, res, io) => {
  try {
    const { name } = req.params;
    const updateData = { ...req.body };

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updated = await Technician.findOneAndUpdate({ name }, updateData, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Technician not found" });
    }

    // 🔔 Emit update event
    if (io) io.emit("technicianUpdated", updated);

    res.status(200).json(updated);
  } catch (error) {
    console.error("Error updating technician:", error);
    res.status(400).json({ message: "Error updating technician", error });
  }
};

// Delete technician
exports.deleteTechnician = async (req, res, io) => {
  try {
    const { id } = req.params;

    const deletedTechnician = await Technician.findByIdAndDelete(id);

    if (!deletedTechnician) {
      return res.status(404).json({ message: "Technician not found" });
    }

    // 🔔 Emit delete event
    if (io) io.emit("technicianDeleted", { id });

    res.status(200).json({ message: "Technician deleted successfully" });
  } catch (error) {
    console.error("Error deleting technician:", error);
    res.status(500).json({ message: "Error deleting technician", error });
  }
};

// Get technician by ID
exports.getTechnicianByID = async (req, res, io) => {
  try {
    const { id } = req.params;

   
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid technician ID format" });
    }

    const technician = await Technician.findById(id);

    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }

    res.status(200).json(technician);
  } catch (error) {
    console.error("Error fetching technician by ID:", error);
    res.status(500).json({
      message: "Error fetching technician by ID",
      error: error.message || "Unknown error occurred",
    });
  }
};
