// 

import mongoose from "mongoose";



const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI; 
    console.log("Mongo URI:", uri);     
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ Error is DB connection", error);
    process.exit(1);
  }
};

export default connectDB;
