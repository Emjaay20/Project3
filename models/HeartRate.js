import mongoose from "mongoose";

const Schema = mongoose.Schema;

// Schema for daily heart rate data
const HeartRateReadingSchema = new Schema(
  {
    date: { type: String, required: true }, // Ensure date is stored as a string
    value: { type: Number, required: true }, // Represents a single heart rate reading (BPM)
  },
  { _id: false } // Prevents creation of unnecessary _id for subdocuments
);

// Schema for monthly heart rate data
const MonthlyHeartRateDataSchema = new Schema(
  {
    month: { type: String, required: true },
    average: { type: Number, required: true }, // Average heart rate for the month
    min: { type: Number, required: true }, // Minimum heart rate for the month
    max: { type: Number, required: true }, // Maximum heart rate for the month
    readings: { type: [HeartRateReadingSchema], required: true }, // Array of daily readings
  },
  { _id: false } // Prevents creation of unnecessary _id for subdocuments
);

// Main schema for Heart Rate data
const HeartRateSchema = new Schema(
  {
    _id: { type: String, required: true }, // To align with string `_id` in data.js
    metric: { type: String, required: true }, // Metric name (e.g., "Heart Rate")
    unit: { type: String, required: true }, // Unit of measurement (e.g., "BPM")
    monthlyData: { type: [MonthlyHeartRateDataSchema], required: true }, // Array of monthly data
  },
  { timestamps: true } // Adds createdAt and updatedAt fields automatically
);

// Create and export the model
const HeartRate = mongoose.model("HeartRate", HeartRateSchema);
export default HeartRate;
