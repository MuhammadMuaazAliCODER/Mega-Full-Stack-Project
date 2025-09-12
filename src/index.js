import dotenv from 'dotenv';
dotenv.config();

import mongoose, { connect } from "mongoose";

import {DB_Name} from './constants.js'

import express from "express";


import connectDB from "./Data Base/DB.js";

connectDB();



// ;(async () => {
//     try {
//        await mongoose.connect('${proess.env.MONGO_URL}/${DB_Name}');
//        app.on("error",(error) =>{
//         console.log("Error in DB connection",error);
//         throw error;
//        })
//        app.listen(process.env.PORT,()=>{
//         console.log(`Server is running on port ${process.env.PORT}`);
//        })
//     } catch (error) {
//         console.log("Error in DB connection",error);
//         throw error;
//     }
// })()