import express from "express";
import moment from "moment";
import crypto from "crypto";
import { ethers } from "ethers";

// Models
import OxygenSaturation from "../models/OxygenSaturation.js";
import BodyTemperature from "../models/BodyTemperature.js";
import HeartRate from "../models/HeartRate.js";

const router = express.Router();

// Minimal "human-readable" ABI for a contract with `storeReading(bytes32 readingHash)`
const contractABI = [
  "function storeReading(bytes32 readingHash) public returns (bool)"
];

router.post("/", async (req, res) => {
  try {
    const { temperature, heartRate, spo2 } = req.body;

    // You have these IDs from your data.js:
    // Oxygen = "100", Body Temp = "101", Heart Rate = "102"
    const oxygenDoc = await OxygenSaturation.findById("100");
    const bodyTempDoc = await BodyTemperature.findById("101");
    const heartRateDoc = await HeartRate.findById("102");

    // Current month string, e.g. "February" (title-cased or lower-cased as you prefer)
    const monthString = moment().format("MMMM").toLowerCase(); // e.g. "march"
    const dateString = moment().format("YYYY-MM-DD"); // e.g. "2025-03-10"

    /**************************************
     * 1) Update Oxygen Saturation
     **************************************/
    if (oxygenDoc) {
      let monthly = oxygenDoc.monthlyData.find(
        (m) => m.month.toLowerCase() === monthString
      );
      if (!monthly) {
        monthly = {
          month: monthString,
          average: spo2,
          min: spo2,
          max: spo2,
          readings: [],
        };
        oxygenDoc.monthlyData.push(monthly);
      }
      // push new reading
      monthly.readings.push({
        date: new Date(), // or could store dateString as well
        value: spo2,
      });
      // recalc min, max, average
      const values = monthly.readings.map((r) => r.value);
      monthly.min = Math.min(...values);
      monthly.max = Math.max(...values);
      monthly.average = values.reduce((a, b) => a + b, 0) / values.length;
      await oxygenDoc.save();
    }

    /**************************************
     * 2) Update Body Temperature
     **************************************/
    if (bodyTempDoc) {
      let monthly = bodyTempDoc.monthlyData.find(
        (m) => m.month.toLowerCase() === monthString
      );
      if (!monthly) {
        monthly = {
          month: monthString,
          average: temperature,
          min: temperature,
          max: temperature,
          readings: [],
        };
        bodyTempDoc.monthlyData.push(monthly);
      }
      monthly.readings.push({
        date: dateString,
        value: temperature,
      });
      const values = monthly.readings.map((r) => r.value);
      monthly.min = Math.min(...values);
      monthly.max = Math.max(...values);
      monthly.average = values.reduce((a, b) => a + b, 0) / values.length;
      await bodyTempDoc.save();
    }

    /**************************************
     * 3) Update Heart Rate
     **************************************/
    if (heartRateDoc) {
      let monthly = heartRateDoc.monthlyData.find(
        (m) => m.month.toLowerCase() === monthString
      );
      if (!monthly) {
        monthly = {
          month: monthString,
          average: heartRate,
          min: heartRate,
          max: heartRate,
          readings: [],
        };
        heartRateDoc.monthlyData.push(monthly);
      }
      monthly.readings.push({
        date: dateString,
        value: heartRate,
      });
      const values = monthly.readings.map((r) => r.value);
      monthly.min = Math.min(...values);
      monthly.max = Math.max(...values);
      monthly.average = values.reduce((a, b) => a + b, 0) / values.length;
      await heartRateDoc.save();
    }

    /**************************************
     * 4) Blockchain - hash + store
     **************************************/
    // Build a JSON object with the reading
    const readingData = {
      temperature,
      heartRate,
      spo2,
      timestamp: Date.now(),
    };
    const readingString = JSON.stringify(readingData);
    const hashHex = crypto
      .createHash("sha256")
      .update(readingString)
      .digest("hex");

    const provider = new ethers.providers.JsonRpcProvider(
      process.env.INFURA_URL
    );
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, wallet);

    // storeReading requires a bytes32 => "0x" + 64 hex chars
    const tx = await contract.storeReading("0x" + hashHex);
    await tx.wait();

    console.log("Transaction hash:", tx.hash);

    res.status(200).json({
      message: "Sensor data updated & hash stored on blockchain",
      chainTx: tx.hash,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
