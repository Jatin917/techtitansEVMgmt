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
              averageEneryConsumed:totalElectricityConsumption/(vehicleCharges.length),
              userTraffic: {
                lastDay: lastDayTraffic,
                last7Days: last7DaysTraffic,
                last30Days: last30DaysTraffic,
            }
            };
          });
          
          const strippedData = updatedData.map(({ vehicle_charges, ...rest }) => rest);
        return res.status(200).json({data:updatedData});
    } catch (error) {
        console.log(error);
    }
}
export const getPortById = async(id) =>{
    try {
        const response = await PortReport.findById({port_id:id});
        if(!response){
            return res.status(401).json({message:"no data available"});
        }
        let updatedData = response.map((portDoc) => {
            const port = portDoc.toObject(); // strips Mongoose internals
            const vehicleCharges = port.vehicle_charges;
          
            return {
              ...port,
              totalElectricityConsumption,
              averageEneryConsumed:totalElectricityConsumption/(vehicleCharges.length)
            };
          });
          
          const strippedData = updatedData.map(({ vehicle_charges, ...rest }) => rest);
        return res.status(200).json({data:strippedData});
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