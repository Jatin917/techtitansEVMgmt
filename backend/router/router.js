import express from 'express'
import { getAllPorts } from '../controller/ports.js';
import PortReport from '../model/port.js';
// import PortReport from './models/ports.js';

export const router = express.Router();


router.get("/ports", getAllPorts);
