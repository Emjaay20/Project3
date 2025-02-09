import express from "express";
import HeartRate from "../models/HeartRate.js";


const router = express.Router();

router.get("/heartrates", async (req,res) =>{
    try{ 
        const heartrates = await HeartRate.find();
        res.status(200).json(heartrates)
    } catch(error){
        res.status(404).json({message: error.message});
    }
})

export default router;