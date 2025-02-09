import express from "express";
import BodyTemperature from "../models/BodyTemperature.js";


const router = express.Router();

router.get("/bodytemperatures", async (req,res) =>{
    try{ 
        const bodytemperatures = await BodyTemperature.find();
        res.status(200).json(bodytemperatures)
    } catch(error){
        res.status(404).json({message: error.message});
    }
})

export default router;