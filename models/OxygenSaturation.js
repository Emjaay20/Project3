import mongoose from "mongoose";

const Schema = mongoose.Schema;

// const mongoose = require('mongoose');

const OxygenReadingSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    value: { type: Number, required: true }
});

const MonthlyOxygenDataSchema = new mongoose.Schema({
    month: { type: String, required: true },
    average: { type: Number, required: true },
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    readings: { type: [OxygenReadingSchema], required: true }
});

const OxygenSaturationSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    metric: { type: String, required: true },
    unit: { type: String, required: true },
    monthlyData: { type: [MonthlyOxygenDataSchema], required: true }
});

// // Create and export the model
const OxygenSaturation = mongoose.model("OxygenSaturation", OxygenSaturationSchema);
export default OxygenSaturation;
