import PortReport from '../model/port.js';

export const getAllPorts = async(req, res) =>{
    try {
        const response = await PortReport.find({});
        if(!response){
            return res.status(401).json({message:"no data available"});
        }
        const updatedData = response.map((portDoc) => {
            const port = portDoc.toObject(); // strips Mongoose internals
          
            const totalElectricityConsumption = port.vehicle_charges.reduce(
              (acc, v) => acc + v.energy_consumed_kWh,
              0
            );
          
            return {
              ...port,
              totalElectricityConsumption
            };
          });
          

        return res.status(200).json({data:updatedData});
    } catch (error) {
        console.log(error);
    }
}