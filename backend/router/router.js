import express from 'express'
import { addStation, getAllPorts, getAnamolyPercentage,getAllStations, postVehicleChargedData, addStationRow } from '../controller/ports.js';
// import PortReport from './models/ports.js';

export const router = express.Router();
router.get('/test', (req, res) => {
    res.send("Admin test route");
});
router.get("/ports", getAllPorts);
router.post('/add-station', addStation);
router.get("/anamoly", getAnamolyPercentage);
router.post("/ports", postVehicleChargedData);
router.get('/allstations', getAllStations);
router.post('/addrowstation', addStationRow);
