import PortReport from '../model/port.js';


const now = new Date();

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
              userTraffic: {
                lastDay: lastDayTraffic,
                last7Days: last7DaysTraffic,
                last30Days: last30DaysTraffic,
            }
            };
          });
          
          const strippedData = updatedData.map(({ vehicle_charges, ...rest }) => rest);
        return res.status(200).json({data:strippedData});
    } catch (error) {
        console.log(error);
    }
}