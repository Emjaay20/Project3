import mongoose from "mongoose";

const BlockchainLogSchema = new mongoose.Schema({
  hash: { type: String, required: true },
  transactionHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// ✅ Ensure default export
const BlockchainLog = mongoose.model("BlockchainLog", BlockchainLogSchema);
export default BlockchainLog;
