const express = require("express");
const mongoose = require("mongoose");
const Request = require("../models/requests.model");

// ===== CREATE REQUEST =====
exports.createRequest = async (req, res) => {
  try {
    const customerId = req.user.id; // from JWT
    const { serviceType, specificService, urgency, description, location, time } = req.body;

    console.log("Creating request for:", customerId);
    console.log("Request body:", req.body);

    // Create new request
    const newRequest = new Request({
      requestId: new mongoose.Types.ObjectId(),
      customerId,
      serviceType,
      specificService,
      urgency,
      description,
      location,
      time,
    });

    const savedRequest = await newRequest.save();

    // Populate customer name and phone
    const populatedRequest = await Request.findById(savedRequest._id).populate({
      path: "customerId",
      select: "name phonenumber",
    });

    // Emit event to connected clients
    const io = req.app.get("io");
    
   io.emit("newRequest", populatedRequest);


    res.status(201).json(populatedRequest);
  } catch (error) {
    console.error("Error creating request:", error);
    res.status(400).json({ message: "Server error", error });
  }
};

// ===== GET SINGLE REQUEST =====
exports.getRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    console.log("Fetching request with ID:", requestId);

    const request = await Request.findById(requestId).populate({
      path: "customerId",
      select: "name phonenumber",
    });

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.status(200).json(request);
  } catch (error) {
    console.error("Error fetching request:", error);
    res.status(400).json({ message: "Server error", error });
  }
};

// ===== GET ALL REQUESTS FOR SPECIFIC USER =====
exports.getRequestsByUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const requests = await Request.find({
      customerId: new mongoose.Types.ObjectId(userId),
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "customerId",
        select: "name phonenumber",
      });

    console.log("Found", requests.length, "requests for", userId);
    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching user requests:", error);
    res.status(400).json({ message: "Error fetching user requests", error });
  }
};

// ===== GET ALL REQUESTS =====
exports.getRequests = async (req, res) => {
  try {
    const requests = await Request.find().populate({
      path: "customerId",
      select: "name phonenumber",
    });

    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching all requests:", error);
    res.status(400).json({ message: "Server error", error });
  }
};

// ===== UPDATE REQUEST =====
exports.updateRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const updateData = req.body;

    const updatedRequest = await Request.findByIdAndUpdate(
      requestId,
      updateData,
      { new: true }
    ).populate({
      path: "customerId",
      select: "name phonenumber",
    });

    if (!updatedRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Emit event when updated
    const io = req.app.get("io");
    io.emit("requestUpdated", updatedRequest);

    res.status(200).json(updatedRequest);
  } catch (error) {
    console.error("Error updating request:", error);
    res.status(400).json({ message: "Server error", error });
  }
};

// ===== DELETE REQUEST =====
exports.deleteRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const deletedRequest = await Request.findByIdAndDelete(requestId);

    if (!deletedRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Emit event when deleted
    const io = req.app.get("io");
    io.emit("requestDeleted", requestId);

    res.status(200).json({ message: "Request deleted successfully" });
  } catch (error) {
    console.error("Error deleting request:", error);
    res.status(400).json({ message: "Server error", error });
  }
};
