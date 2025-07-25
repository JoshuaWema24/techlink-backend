const express = require("express");
const Job = require("../models/jobs.model");
const mongoose = require("mongoose");
const Technician = require("../models/technicians.model");

//create Jpb
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

    // Create job and assign technician's ID
    const newJob = new Job({
      serviceType,
      customerName,
      customerNumber,
      location,
      tldescription,
      customerDescription,
      assignedTo: technician._id, // Save the ID not the name
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
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find();
    res.status(200).json(jobs);
  } catch (error) {
    console.error("Server error while fetching jobs:", error);
    res.status(500).json({ message: "Server error. Could not retrieve jobs." });
  }
};

//get jobs by technician
// GET /api/jobs/technician/:id
// Only returns jobs if the logged-in technician is requesting their own jobs

exports.getJobsByTechnician = async (req, res) => {
  try {
    const technicianIdFromToken = req.user.id; // from decoded JWT (set in middleware)

    // Deny access if technician tries to access someone else's jobs
    if (technicianIdFromParams !== technicianIdFromToken) {
      return res.status(403).json({ message: "Access denied. Not your jobs." });
    }

    const jobs = await Job.find({ assignedTo: technicianIdFromToken });

    if (!jobs || jobs.length === 0) {
      return res.status(404).json({ message: "No jobs found for this technician." });
    }

    res.status(200).json(jobs);

  } catch (error) {
    console.error("Error while fetching technician's jobs:", error);
    res.status(500).json({ message: "Server error. Could not retrieve jobs." });
  }
};
