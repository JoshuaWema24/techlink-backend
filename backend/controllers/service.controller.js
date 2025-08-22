const mongoose = require("mongoose");
const express = require("express");
const Service = require("../models/service.model");

exports.createService = async (req, res) => {
  try {
    const { serviceName, serviceInfo } = req.body;

    if (!serviceName || !serviceInfo) {
      return res
        .status(400)
        .json({ message: "Service name and info are required." });
    }

    const newService = new Service({
      serviceName,
      serviceInfo,
    });

    await newService.save();
    res
      .status(201)
      .json({ message: "Service created successfully", service: newService });
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Read all services
exports.getServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.status(200).json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//read single service
exports.getService = async (req, res) => {
  try {
    const { serviceName } = req.params;
    const service = await Service.findByName(serviceName);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json(service);
  } catch (error) {
    console.error("Error fetching service:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateService = async (req, res) => {
  try {
    const { serviceName } = req.params;
    const { serviceInfo } = req.body;

    // Validate input
    if (!serviceInfo) {
      return res.status(400).json({ message: "Service info is required." });
    }

    const updatedService = await Service.findOneAndUpdate(
      { serviceName },
      { serviceInfo, updatedAt: Date.now() },
      { new: true }
    );

    if (!updatedService) {
      return res.status(404).json({ message: "Service not found" });
    }

    res
      .status(200)
      .json({
        message: "Service updated successfully",
        service: updatedService,
      });
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedService = await Service.findByIdAndDelete(id);
    if (!deletedService) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};