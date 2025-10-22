const express = require("express");
const mongoose = require("mongoose");
const Announcement = require("../models/announcement.model");


// ===== Create Announcement =====
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title)
      return res.status(400).json({ message: "Title is required" });
    if (!content)
      return res.status(400).json({ message: "Content is required" });

    const newAnnouncement = new Announcement({
      title,
      content,
    });

    await newAnnouncement.save();

    // Emit socket event after successful creation
    const io = req.app.get("io");
    io.emit("announcementCreated", newAnnouncement);

    res
      .status(201)
      .json({
        message: "Announcement created successfully",
        announcement: newAnnouncement,
      });
  } catch (error) {
    console.error("Error creating announcement:", error);
    res.status(400).json({ message: "Internal server error" });
  }
};

// ===== Get All Announcements =====
exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.status(200).json(announcements);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.status(400).json({ message: "Error within the server" });
  }
};

// ===== Update Announcement =====
exports.updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    if (!title || !content)
      return res
        .status(400)
        .json({ message: "Title and content are required" });

    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      id,
      { title, content, updatedAt: Date.now() },
      { new: true }
    );

    if (!updatedAnnouncement)
      return res.status(404).json({ message: "Announcement not found" });

    // Emit socket event for update
    const io = req.app.get("io");
    io.emit("announcementUpdated", updatedAnnouncement);

    res.status(200).json({
      message: "Announcement updated successfully",
      announcement: updatedAnnouncement,
    });
  } catch (error) {
    console.error("Error updating announcement:", error);
    res.status(400).json({ message: "Error updating announcement" });
  }
};

// ===== Delete Announcement =====
exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedAnnouncement = await Announcement.findByIdAndDelete(id);
    if (!deletedAnnouncement)
      return res.status(404).json({ message: "Announcement not found" });

    // Emit socket event for deletion
    const io = req.app.get("io");
    io.emit("announcementDeleted", id);

    res.status(200).json({ message: "Announcement deleted successfully" });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    res.status(400).json({ message: "Error deleting announcement" });
  }
};
