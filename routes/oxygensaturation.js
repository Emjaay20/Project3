import express from "express";
import OxygenSaturation from "../models/OxygenSaturation.js";


const router = express.Router();

router.get("/oxygensaturations", async (req,res) =>{
    try{ 
        const oxygensaturations = await OxygenSaturation.find();
        res.status(200).json(oxygensaturations)
    } catch(error){
        res.status(404).json({message: error.message});
    }
})

export default router;

