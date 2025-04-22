import express from 'express'
import { getAllPorts, getAnamolyPercentage, postVehicleChargedData } from '../controller/ports.js';
import PortReport from '../model/port.js';
// import PortReport from './models/ports.js';

export const router = express.Router();


router.get("/ports", getAllPorts);
router.get("/anamoly", getAnamolyPercentage);
router.post("/ports", postVehicleChargedData);
