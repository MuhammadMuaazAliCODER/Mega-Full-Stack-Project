import mongoose from "mongoose";

import {DB_Name} from '../constants.js'
 

import express from "express";

const connectDB=async()=>{
    try {
       const connectionInstance =  await mongoose.connect(`${process.env.MONGO_URL}/${DB_Name}`);
       console.log(`MongoDB connected: ${connectionInstance.connection.host}`);
        app.on("error",(error) =>{
        console.log("Error in DB connection",error);
         throw error;
        })
        app.listen(process.env.PORT,()=>{
         console.log(`Server is running on port ${process.env.PORT}`);
        })
    } catch (error) {
        console.log("Error is DB connection",error);
        process.exit(1);
    }


}

export default connectDB;