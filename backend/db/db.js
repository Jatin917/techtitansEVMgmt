import mongoose from "mongoose";
// console.log(DB_URL);
export const connection = async(DB_URL) =>{
    try {
        await mongoose.connect(DB_URL);
        console.log("DB Connected Successfully");
    } catch (error) {
        console.log(error);
        console.log("Error in connecting to the DB");
    }
}