import PortReport from '../model/port.js';

import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
const now = new Date();
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Papa from 'papaparse';


const oneDayAgo = new Date(now);
oneDayAgo.setDate(now.getDate() - 1);

const sevenDaysAgo = new Date(now);
sevenDaysAgo.setDate(now.getDate() - 7);

const thirtyDaysAgo = new Date(now);
thirtyDaysAgo.setDate(now.getDate() - 30);

export const getAllPorts = async(req, res) =>{
    try {
        const response = await PortReport.find({});
        if(!response){
            return res.status(401).json({message:"no data available"});
        }
        let updatedData = response.map((portDoc) => {
            const port = portDoc.toObject(); // strips Mongoose internals
            const vehicleCharges = port.vehicle_charges;

            const lastDayTraffic = vehicleCharges.filter(
                v => new Date(v.end_time) >= oneDayAgo
            ).length;

            const last7DaysTraffic = vehicleCharges.filter(
                v => new Date(v.end_time) >= sevenDaysAgo
            ).length;

            const last30DaysTraffic = vehicleCharges.filter(
                v => new Date(v.end_time) >= thirtyDaysAgo
            ).length;

            const totalElectricityConsumption = port.vehicle_charges.reduce(
              (acc, v) => acc + v.energy_consumed_kWh,
              0
            );

            return {
              ...port,
              totalElectricityConsumption,
              averageEneryConsumed:totalElectricityConsumption/(vehicleCharges.length),
              userTraffic: {
                lastDay: lastDayTraffic,
                last7Days: last7DaysTraffic,
                last30Days: last30DaysTraffic,
            }
            };
          });
        const lastDayFault = response.filter(
        v => new Date(v.reported_at) >= oneDayAgo
        );
        const last7DayFault =  response.filter(
            v => new Date(v.reported_at) >= sevenDaysAgo
            );
            // hello jiii
        const last30DayFault =  response.filter(
            v => new Date(v.reported_at) >= thirtyDaysAgo
            );

        let lastDayFaultValue = 0;
        let last7FaultValue = 0;
        let last30FaultValue = 0;

        lastDayFault.forEach(port => {
            if (port.status === "fault") lastDayFaultValue++;
        });
        last7DayFault.forEach(port => {
            if (port.status === "fault") last7FaultValue++;
        });
        last30DayFault.forEach(port => {
            if (port.status === "fault") last30FaultValue++;
        });

// Add lastDayFaultValue to each port in updatedData
const newUpdatedData = updatedData.map(port => ({
    ...port,
    lastDayFaultValue, // Add the fault count to each port object
    last7FaultValue,
    last30FaultValue
}));



return res.status(200).json({ data: newUpdatedData });

    } catch (error) {
        console.log(error);
    }
}

export const getAnamolyPercentage = async(req, res)=>{
    try {
        const ports = await PortReport.find({});
        const anamolyPercentage = await Promise.all(ports.map(async (port)=>{
            const portId = port.port_id;
            const response = await getPortById(portId);
            const averageEneryConsumed = response.averageEneryConsumed;

        }))
    } catch (error) {
        
    }
}

export const postVehicleChargedData = async (req, res)=>{
    try {
        const portId = req.body.port_id;
        const energyConsumed = req.body.energyConsumed;
        // abhi ke liye hum average hi utha rhe hain 
        const averageEneryConsumedData = await getPortById(portId);
        const averageEneryConsumed = averageEneryConsumedData.averageEneryConsumed;
        // yha prr request bheji that ki wo nikal kr le aayo suspicious hain yaa nhi
        const response = await Promise.all(setTimeout(console.log("ml model to check wheather it is suspicous"), 1000));
        if(response.suspicious){
            // yhaa db main update kr denge that it is suspicious
            // yhaa last 5 anomoly ki value ko nikalenge and if all are suspicious hain then we need to notify someone ki port sahi nhi hain and we will also check from here that ki that us station ke sare hi suspicious to nhi if to usko offline mark kr denge and notify kr denge kisi ko ki use check krke aao
        }

    } catch (error) {
        
    }
}

export const addStation = async(req, res) =>{
    try {
        // console.log("chal rha hain", req.body);
        const formData = req.body;
        // const validStatuses = ['active', 'inactive', 'maintenance']; // Define valid statuses for the station
        console.log("status is ",  formData.status)
        const status = formData.status==='active' ? 'idle' : formData.status==='inactive'?'offline':'fault'
        // if (!validStatuses.includes(formData.status)) {
        // return res.status(400).json({ message: 'Invalid status value' });
        // }
        // console.log(formData);
        const response = await PortReport.create({port_id:formData.port_id, station_id:formData.station_id, status:status, name:formData.name, connectors:formData.connectors, address:formData.address,  pricePerKwh:formData.pricePerKwh, type:formData.type, powerOutput:formData.powerOutput, coordinates:formData.coordinates})
        console.log(response);
        if(!response) return res.status(401).json({message:"Error adding the stations"});
        return res.status(200).json({message:"Added Station"})
    } catch (error) {
        console.log(error)
    }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const getAllStations = async (req, res) => {
    try {
      const filePath = path.join(__dirname, '../stations/charging_stations.csv');
      const fileContent = fs.readFileSync(filePath, 'utf8'); // Read as string
  
      const parsed = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true
      });
  
      const ports = parsed.data
        .filter(port => port.latitude && port.longitude)
        .map(port => ({
          coordinates: {
            lat: parseFloat(port.latitude),
            lng: parseFloat(port.longitude)
          }
        }));
  
      return res.status(200).json({ data: ports });
  
    } catch (error) {
      console.error('Error reading CSV file:', error);
      res.status(500).send('Failed to read station data');
    }
  };

  
  export const addStationRow = async (req, res) => {
    try {
      const newRow = req.body;
  
      const csvFilePath = path.join(__dirname, '../stations/charging_stations.csv');
  
      // Define the fixed header order
      const headers = [
        "uid","name","vendor_name","address","latitude","longitude","city","country",
        "open","close","logo_url","staff","payment_modes","contact_numbers",
        "station_type","postal_code","zone","0","available","capacity",
        "cost_per_unit","power_type","total","type","vehicle_type"
      ];
  
      // Build row values in the exact header order
      const values = headers.map(header => {
        const val = newRow[header] !== undefined ? newRow[header] : '';
        return `"${String(val).replace(/"/g, '""')}"`; // CSV-safe
      });
  
      const rowLine = values.join(',') + '\n';
  
      // Append row to the CSV file
      fs.appendFileSync(csvFilePath, rowLine, 'utf8');
  
      res.status(200).json({ message: 'Row added successfully' });
    } catch (err) {
      console.error('Error adding row to CSV:', err);
      res.status(500).json({ error: 'Failed to write to CSV' });
    }
  };
  