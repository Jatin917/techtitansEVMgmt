import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid';

const vehicleChargeSchema = new mongoose.Schema(
  {
    vehicle_id: { type: String, default: null },
    session_id: { type: String, required: true },
    start_time: { type: Date, required: true },
    end_time: { type: Date, required: true },
    time_taken_minutes: { type: Number, required: true },
    charged_percent: { type: Number, required: true },
    energy_consumed_kWh: { type: Number, required: true },

    electricity_cost: { type: Number, required: true }, // or calculate dynamically
    // cost_per_percent removed

    user_rating: { type: Number },
    review: { type: String, default: "" },
  },
  { _id: false }
);

const portReportSchema = new mongoose.Schema({
  port_id: { type: String, default: uuidv4 },
  station_id: { type: String, default: uuidv4 },
  status: {
    type: String,
    enum: ["idle", "charging", "fault", "offline"],
    required: true,
  },
  last_ping: { type: Date, default: Date.now },
  name:{type:String},

  // cost_per_kWh: { type: Number, required: true }, // added at port level

  avg_time_to_charge_minutes: { type: Number, default: 0 },
  vehicle_charges: [vehicleChargeSchema],
  connectors:{type:Number, default:1},
  address:{type:String},
  pricePerKwh:{type:Number, default:0.1},
  type:{type:String},
  powerOutput:{type:String},
  coordinates: {
  lat: { type: String },
  lng: { type: String },
  operatingHours:{type:String, default:"24/7"},
},
  reported_at: { type: Date, default: Date.now },
});


const anomalySchema = new mongoose.Schema({
    port_id: { type: String, required: true },
    station_id: { type: String, required: true },
    status: {
      type: String,
      enum: ["suspicious", "normal", "anomaly"],
      required: true,
    },
})
export const Anomaly = mongoose.model("Anomaly", anomalySchema);
export const PortReport = mongoose.model("PortReport", portReportSchema);
