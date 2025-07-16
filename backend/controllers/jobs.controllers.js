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
 


