const Detail = require("../models/details.model");
const mongoose = require("mongoose");

const Request = require(".../models/requests.model");

exports.createDetails = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { technicianName, serviceDone, amount, status } = req.body;
    const customerId = req.user.id; // from JWT

    // Check if request exists
    const existingRequest = await Request.findById(requestId);
    if (!existingRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Create summary and link to request
    const newDetail = new Detail({
      technicianName,
      serviceDone,
      amount,
      status,
      customerId,
      requestId,
    });

    const savedDetail = await newDetail.save();
    res.status(201).json(savedDetail);
  } catch (error) {
    console.error("❌ Error creating request summary:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// ✅ Get all details for logged-in customer
exports.getMyDetails = async (req, res) => {
  try {
    const customerId = req.user?.id || req.user?._id;

    if (!customerId) {
      return res.status(401).json({ message: "Unauthorized. No customer ID." });
    }

    const details = await Detail.find({ customerId }).populate({
      path: "requestId",
      select: "serviceType location urgency description time",
    });

    res.status(200).json(details);
  } catch (error) {
    console.error("❌ Error fetching user details:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// ✅ Get single detail by ID (owned by user)
exports.getDetailById = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.user?.id || req.user?._id;

    const detail = await Detail.findOne({ _id: id, customerId });
    if (!detail) {
      return res.status(404).json({ message: "Detail not found" });
    }

    res.status(200).json(detail);
  } catch (error) {
    console.error("❌ Error fetching detail:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// ✅ Update detail (customer must own it)
exports.updateDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.user?.id || req.user?._id;
    const updates = req.body;

    const updatedDetail = await Detail.findOneAndUpdate(
      { _id: id, customerId },
      updates,
      { new: true }
    );

    if (!updatedDetail) {
      return res.status(404).json({ message: "Detail not found or unauthorized" });
    }

    res.status(200).json(updatedDetail);
  } catch (error) {
    console.error("❌ Error updating detail:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// ✅ Delete detail (customer must own it)
exports.deleteDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.user?.id || req.user?._id;

    const deletedDetail = await Detail.findOneAndDelete({ _id: id, customerId });
    if (!deletedDetail) {
      return res.status(404).json({ message: "Detail not found or unauthorized" });
    }

    res.status(200).json({ message: "Detail deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting detail:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
