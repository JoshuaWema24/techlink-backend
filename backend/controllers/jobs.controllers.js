const express = require("express");
const mongoose = require("mongoose");
const Job = require("../models/jobs.model");
const Technician = require("../models/technicians.model");

// ===== CREATE JOB =====
exports.createJob = async (req, res) => {
  try {
    const {
      serviceType,
      customerName,
      customerNumber,
      location,
      tldescription,
      customerDescription,
      technicianName,
    } = req.body;

    // Find technician by name
    const technician = await Technician.findOne({ name: technicianName });
    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }

    // Create new job
    const newJob = new Job({
      serviceType,
      customerName,
      customerNumber,
      location,
      tldescription,
      customerDescription,
      technicianId: technician._id.toString(),
      technicianName: technician.name,
    });

    const savedJob = await newJob.save();
    res.status(201).json({
      message: "Job assigned successfully!",
      job: savedJob,
    });
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ===== GET ONE JOB =====
exports.getJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }

    res.status(200).json(job);
  } catch (error) {
    console.error("Server error while fetching job:", error);
    res
      .status(500)
      .json({ message: "Server error. Could not retrieve job details." });
  }
};

// ===== GET ALL JOBS =====
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find();
    res.status(200).json(jobs);
  } catch (error) {
    console.error("Server error while fetching jobs:", error);
    res.status(500).json({ message: "Server error. Could not retrieve jobs." });
  }
};

// ===== GET JOBS BY TECHNICIAN =====
exports.getJobsByTechnician = async (req, res) => {
  try {
    const technicianId = req.user.id; // from JWT

    const jobs = await Job.find({ technicianId });

    if (!jobs || jobs.length === 0) {
      return res
        .status(404)
        .json({ message: "No jobs found for this technician." });
    }
      res.status(200).json(jobs);
  } catch (error) {
    console.error("Error while fetching technician's jobs:", error);
    res.status(500).json({ message: "Server error. Could not retrieve jobs." });
  }
};

// ===== UPDATE JOB =====
exports.updateJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No updates provided." });
    }

    const updatedJob = await Job.findByIdAndUpdate(jobId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedJob) {
      return res.status(404).json({ message: "Job not found." });
    }

    // Emit job update event
    const io = req.app.get("io");
    io.emit("jobUpdated", updatedJob);

    res.status(200).json({
      message: "Job updated successfully!",
      job: updatedJob,
    });
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
