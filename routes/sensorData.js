import express from "express";
import moment from "moment";
import crypto from "crypto";
import { ethers, JsonRpcProvider, Wallet, Contract } from "ethers";
import mongoose from "mongoose";

// Models
import OxygenSaturation from "../models/OxygenSaturation.js";
import BodyTemperature from "../models/BodyTemperature.js";
import HeartRate from "../models/HeartRate.js";
import BlockchainLog from "../models/BlockchainLog.js"; 

const router = express.Router();

// Smart Contract ABI
const contractABI = [
  "function storeHash(bytes32 _dataHash) public returns (uint256)"
];

// Optimize MongoDB Queries: Create Indexes
(async () => {
  await OxygenSaturation.createIndexes({ _id: 1 });
  await BodyTemperature.createIndexes({ _id: 1 });
  await HeartRate.createIndexes({ _id: 1 });
})();

// Function to compute Z-score for outlier detection
function isOutlier(value, mean, stdDev) {
  return Math.abs((value - mean) / stdDev) > 3;
}

router.post("/", async (req, res) => {
  try {
    const { temperature, heartRate, spo2 } = req.body;
    if (!temperature || !heartRate || !spo2) {
      return res.status(400).json({ message: "Missing Fields" });
    }

    const monthString = moment().format("MMMM").toLowerCase();
    const dateString = moment().format("YYYY-MM-DD");

    /**********************************
     * ✅ 1) Run Database Queries in Parallel
     **********************************/
    const [oxygenDoc, bodyTempDoc, heartRateDoc, lastHashRecord] = await Promise.all([
      OxygenSaturation.findById("100").lean(),
      BodyTemperature.findById("101").lean(),
      HeartRate.findById("102").lean(),
      BlockchainLog.findOne().sort({ createdAt: -1 }).lean()
    ]);

    // Compute Hash Before Blockchain Call
    const readingData = { temperature, heartRate, spo2, timestamp: Date.now() };
    const readingString = JSON.stringify(readingData);
    const newHash = crypto.createHash("sha256").update(readingString).digest("hex");
    const sendToBlockchain = !lastHashRecord || lastHashRecord.hash !== newHash;

    /**********************************
     * ✅ 2) Outlier Detection (Z-score)
     **********************************/
    if (bodyTempDoc && heartRateDoc && oxygenDoc) {
      const tempReadings = bodyTempDoc.monthlyData.flatMap(m => m.readings.map(r => r.value));
      const hrReadings = heartRateDoc.monthlyData.flatMap(m => m.readings.map(r => r.value));
      const spo2Readings = oxygenDoc.monthlyData.flatMap(m => m.readings.map(r => r.value));
      
      const meanTemp = tempReadings.reduce((a, b) => a + b, 0) / tempReadings.length;
      const stdTemp = Math.sqrt(tempReadings.map(x => Math.pow(x - meanTemp, 2)).reduce((a, b) => a + b, 0) / tempReadings.length);
      if (isOutlier(temperature, meanTemp, stdTemp)) {
        return res.status(400).json({ message: "Outlier detected in temperature data" });
      }
    }

    /**********************************
     * ✅ 3) Update MongoDB in Parallel
     **********************************/
    const updates = [];

    if (oxygenDoc) {
      let monthly = oxygenDoc.monthlyData.find(m => m.month.toLowerCase() === monthString);
      if (!monthly) {
        monthly = { month: monthString, average: spo2, min: spo2, max: spo2, readings: [] };
        oxygenDoc.monthlyData.push(monthly);
      }
      monthly.readings.push({ date: new Date(), value: spo2 });
      updates.push(OxygenSaturation.updateOne({ _id: "100" }, { $set: oxygenDoc }));
    }

    if (bodyTempDoc) {
      let monthly = bodyTempDoc.monthlyData.find(m => m.month.toLowerCase() === monthString);
      if (!monthly) {
        monthly = { month: monthString, average: temperature, min: temperature, max: temperature, readings: [] };
        bodyTempDoc.monthlyData.push(monthly);
      }
      monthly.readings.push({ date: dateString, value: temperature });
      updates.push(BodyTemperature.updateOne({ _id: "101" }, { $set: bodyTempDoc }));
    }

    if (heartRateDoc) {
      let monthly = heartRateDoc.monthlyData.find(m => m.month.toLowerCase() === monthString);
      if (!monthly) {
        monthly = { month: monthString, average: heartRate, min: heartRate, max: heartRate, readings: [] };
        heartRateDoc.monthlyData.push(monthly);
      }
      monthly.readings.push({ date: dateString, value: heartRate });
      updates.push(HeartRate.updateOne({ _id: "102" }, { $set: heartRateDoc }));
    }

    await Promise.all(updates); 

    /**********************************
     * ✅ 4) Send to Blockchain (Only If Data Changes)
     **********************************/
    if (sendToBlockchain) {
      console.log("Connecting to Infura...");
      const provider = new JsonRpcProvider(process.env.INFURA_URL);
      const wallet = new Wallet(process.env.PRIVATE_KEY, provider);
      const contract = new Contract(process.env.CONTRACT_ADDRESS, contractABI, wallet);

      contract.storeHash("0x" + newHash)
        .then(tx => {
          console.log("Blockchain TX Hash:", tx.hash);
          BlockchainLog.create({ hash: newHash, transactionHash: tx.hash });
        })
        .catch(err => console.error("Blockchain error:", err));
    }

    return res.status(200).json({
      message: "Sensor data updated",
      blockchainTransaction: sendToBlockchain ? "Sent to Blockchain" : "Not Sent (No Change)"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
