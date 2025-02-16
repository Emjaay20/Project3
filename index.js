import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
// Import Routes
import oxygensaturationRoutes from "./routes/oxygensaturation.js";
import heartrateRoutes from "./routes/heartrate.js";
import bodytemperatureRoutes from "./routes/bodytemperature.js";
import sensorDataRoutes from "./routes/sensorData.js";

// Models
import BodyTemperature from "./models/BodyTemperature.js";
import OxygenSaturation from "./models/OxygenSaturation.js";
import HeartRate from "./models/HeartRate.js";

/*** configurations  */
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

/** Routes */
app.use("/oxygensaturation", oxygensaturationRoutes);
app.use("/heartrate", heartrateRoutes);
app.use("/bodytemperature", bodytemperatureRoutes);
// Mount the new POST route for sensor data
app.use("/api/sensor-data", sensorDataRoutes);



/**** Mongoose Setups */

const PORT = process.env.PORT || 9000;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB successfully');

    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
};

startServer();
