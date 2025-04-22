import mongoose, { model } from "mongoose";
const vehicleChargeSchema = new mongoose.Schema(
  {
    vehicle_id: { type: String, default: null },
    session_id: { type: String, required: true },
    start_time: { type: Date, required: true },
    end_time: { type: Date, required: true },
    time_taken_minutes: { type: Number, required: true },
    charged_percent: { type: Number, required: true },
    energy_consumed_kWh: { type: Number, required: true },
    electricity_cost: { type: Number, required: true },
    cost_per_percent: { type: Number },
    user_rating: { type: Number },
    review: { type: String, default: "" },
  },
  { _id: false }
);

const portReportSchema = new mongoose.Schema({
  port_id: { type: String, required: true },
  station_id: { type: String, required: true },

  status: {
    type: String,
    enum: ["idle", "charging", "fault", "offline"],
    required: true,
    timestamp: { type: Date, required: true },
  },
  last_ping: { type: Date, default: Date.now },

  avg_time_to_charge_minutes: { type: Number, default: 0 },
  vehicle_charges: [vehicleChargeSchema], // Array of recent charge events

  reported_at: { type: Date, default: Date.now },
});

const PortReport = mongoose.model('PortReport', portReportSchema);
export default PortReport;