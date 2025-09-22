import dotenv from "dotenv";
dotenv.config();

import mongoose, { connect } from "mongoose";

import {DB_Name} from './constants.js'

import express from "express";

import connectDB from "./Data Base/DB.js";

import {app} from "./app.js"


connectDB() 
 //Data Base Connection 
//Note asyn fuction return a promise so we can use then and catch


.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running on port ${process.env.PORT || 8000}`);
       
    })
})
.catch(error=>{
    console.log("MongoDB connection error : ",error);

})
app.on("error" ,(error)=>{
    console.log("Error in DB connection",error);
    throw error;
})
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

