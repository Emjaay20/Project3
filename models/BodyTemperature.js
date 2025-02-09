import mongoose from "mongoose";

const Schema = mongoose.Schema;

// Schema for daily body temperature data
const BodyTemperatureReadingSchema = new Schema(
  {
    date: { type: String, required: true }, // Ensure date is stored as a string
    value: { type: Number, required: true }, // Represents a single body temperature reading (in °C or °F)
  },
  { _id: false } // Prevents creation of unnecessary _id for subdocuments
);

// Schema for monthly body temperature data
const MonthlyBodyTemperatureDataSchema = new Schema(
  {
    month: { type: String, required: true }, // Month of the data
    average: { type: Number, required: true }, // Average body temperature for the month
    min: { type: Number, required: true }, // Minimum body temperature for the month
    max: { type: Number, required: true }, // Maximum body temperature for the month
    readings: { type: [BodyTemperatureReadingSchema], required: true }, // Array of daily readings
  },
  { _id: false } // Prevents creation of unnecessary _id for subdocuments
);

// Main schema for Body Temperature data
const BodyTemperatureSchema = new Schema(
  {
    _id: { type: String, required: true }, // To align with a potential string `_id`
    metric: { type: String, required: true }, // Metric name (e.g., "Body Temperature")
    unit: { type: String, required: true }, // Unit of measurement (e.g., "°C" or "°F")
    monthlyData: { type: [MonthlyBodyTemperatureDataSchema], required: true }, // Array of monthly data
  },
  { timestamps: true } // Adds createdAt and updatedAt fields automatically
);

// Create and export the model
const BodyTemperature = mongoose.model("BodyTemperature", BodyTemperatureSchema);
export default BodyTemperature;
