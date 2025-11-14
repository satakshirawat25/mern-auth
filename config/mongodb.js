import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();


const connectDB = async()=>{
    try{
         await mongoose.connect(`${process.env.MONGODB_URI}`)

         mongoose.connection.once('connected',()=>{
            console.log("mongodb connected")
         })
        //  mongoose.connection.on('connected',()=>console.log("Database connected"))

    }catch(error){
        console.log('connection failed',error)
    }
   
}
export default connectDB