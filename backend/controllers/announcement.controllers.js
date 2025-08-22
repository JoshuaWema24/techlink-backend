const express = require("express");
const mongoose = require("mongoose");
const Announcement = require("../models/announcement.model");

exports.createAnnouncement = async(req, res) => {
    try {
      const { title, content } = req.body;
       if (!title )
        return res.status(400).json({ message: "Title is required" });
      if (!content)
        return res.status(400).json({ message: "Content is required" });
        const newAnnouncement = new Announcement({
            title,  
            content,
        });
        await newAnnouncement.save();
        res.status(201).json({ message: "Announcement created successfully", announcement: newAnnouncement });
        io.emit("announcementCreated", newAnnouncement);
    } catch (error) {
        res.status(400).json({ message : 'internal server error'});
    }
};

exports.getAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ createdAt: -1 });
        res.status(200).json(announcements);
    } catch (error) {
        res.status(400).json({ message: " Error within the server"})
    }
};
 
exports.updateAnnouncement = async(req, res) => {
    try{
      const { id } = req.params;
      const { title, content } = req.body;
        if (!title || !content)
            return res.status(400).json({ message: "Title and content are required" });
        const updatedAnnouncement = await Announcement.findByIdAndUpdate(
            id,
            { title, content, updatedAt: Date.now() },
            { new: true }
        );
        if (!updatedAnnouncement)
            return res.status(404).json({ message: "Announcement not found" });
        res.status(200).json({ message: "Announcement updated successfully", announcement: updatedAnnouncement });
        io.emit("announcementUpdated", updatedAnnouncement);
    }
    catch (error){
        res.status(400).json({ message: "Error updating announcement"});
    }
};
 exports.deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedAnnouncement = await Announcement.findByIdAndDelete(id);
        if (!deletedAnnouncement)
            return res.status(404).json({ message: "Announcement not found" });
        res.status(200).json({ message: "Announcement deleted successfully" });
        io.emit("announcementDeleted", id);
    } catch (error) {
        res.status(400).json({ message: "Error deleting announcement" });
    }
};
