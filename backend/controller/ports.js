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

            // const reportedAt = new Date(port.reported_at);
            // const isFault = port.status === "fault";

            // const lastDayFault = isFault && reportedAt >= oneDayAgo ? 1 : 0;
            // const last7DaysFault = isFault && reportedAt >= sevenDaysAgo && reportedAt < oneDayAgo ? 1 : 0;
            // const last30DaysFault = isFault && reportedAt >= thirtyDaysAgo && reportedAt < sevenDaysAgo ? 1 : 0;
            
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

// Strip out vehicle_charges from each port object
const strippedData = newUpdatedData.map(({ vehicle_charges, ...rest }) => rest);

return res.status(200).json({ data: strippedData });

    } catch (error) {
        console.log(error);
    }
}