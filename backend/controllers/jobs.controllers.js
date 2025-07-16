const express = require("express");
const Job = require("../models/jobs.model");
const mongoose = require("mongoose");

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
    } = req.body;
    console.log("Creating job:");
    console.log(req.body);

    const newJob = new Job({
      serviceType,
      customerName,
      customerNumber,
      location,
      tldescription,
      customerDescription,
    });

    const savedJob = await newJob.save();
    res.status(201).json(savedJob);

  } catch (error) {
    res.status(400).json({ message: "Server Error" });
  }
};



exports.getJob = async (req, res) => {
  try {
    const jobId = req.params.id; 
    
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }
    res.status(200).json(job);

  } catch (error) {
    console.error('Server error while fetching job:', error); 
    res.status(500).json({ message: 'Server error. Could not retrieve job details.' });
  }
};
 


