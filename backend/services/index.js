import mongoose from 'mongoose';
import PortReport from '../model/port.js';
// import PortReport from './models/portReport.model.js';

const MONGODB_URI = 'mongodb+srv://studeentreports:Anuj123321@cluster0.82cbl.mongodb.net/'; // update if needed

const portReports = [
  {
    port_id: 'STN001-PORT1',
    station_id: 'STN001',
    status: 'idle',
    last_ping: new Date(),
    avg_time_to_charge_minutes: 40,
    vehicle_charges: [
      {
        vehicle_id: 'EV1001',
        session_id: 'SESSION1001',
        start_time: new Date('2025-04-22T09:00:00Z'),
        end_time: new Date('2025-04-22T09:45:00Z'),
        time_taken_minutes: 45,
        charged_percent: 60,
        energy_consumed_kWh: 6.2,
        electricity_cost: 26.75,
        cost_per_percent: 0.45,
        user_rating: 4.2,
        review: 'Worked well.',
      },
      {
        vehicle_id: 'EV1002',
        session_id: 'SESSION1002',
        start_time: new Date('2025-04-21T17:30:00Z'),
        end_time: new Date('2025-04-21T18:10:00Z'),
        time_taken_minutes: 40,
        charged_percent: 50,
        energy_consumed_kWh: 5.0,
        electricity_cost: 22.5,
        cost_per_percent: 0.45,
        user_rating: 4.7,
        review: 'Quick and efficient.',
      },
    ],
    reported_at: new Date(),
  },
  {
    port_id: 'STN001-PORT2',
    station_id: 'STN001',
    status: 'charging',
    last_ping: new Date(),
    avg_time_to_charge_minutes: 35,
    vehicle_charges: [
      {
        vehicle_id: 'EV2001',
        session_id: 'SESSION2001',
        start_time: new Date('2025-04-22T10:30:00Z'),
        end_time: new Date('2025-04-22T11:05:00Z'),
        time_taken_minutes: 35,
        charged_percent: 70,
        energy_consumed_kWh: 7.1,
        electricity_cost: 30.0,
        cost_per_percent: 0.43,
        user_rating: 4.8,
        review: 'Very smooth.',
      },
    ],
    reported_at: new Date(),
  },
  {
    port_id: 'STN002-PORT1',
    station_id: 'STN002',
    status: 'fault',
    last_ping: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
    avg_time_to_charge_minutes: 50,
    vehicle_charges: [
      {
        vehicle_id: 'EV3001',
        session_id: 'SESSION3001',
        start_time: new Date('2025-04-21T20:00:00Z'),
        end_time: new Date('2025-04-21T20:50:00Z'),
        time_taken_minutes: 50,
        charged_percent: 80,
        energy_consumed_kWh: 8.2,
        electricity_cost: 36.9,
        cost_per_percent: 0.46,
        user_rating: 3.8,
        review: 'Was okay, slow at times.',
      },
    ],
    reported_at: new Date(),
  },
];

async function seedPortReports() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const result = await PortReport.insertMany(portReports);
    console.log('Inserted records:', result.length);

    mongoose.connection.close();
  } catch (err) {
    console.error('Error inserting port reports:', err);
    mongoose.connection.close();
  }
}

seedPortReports();
