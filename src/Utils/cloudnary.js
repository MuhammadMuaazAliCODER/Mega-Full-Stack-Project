import dotenv from "dotenv";
dotenv.config(); 

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.MY_CLOUD_NAME,
  api_key: process.env.MY_KEY_API,
  api_secret: process.env.MY_KEY_SECRECT,
});

const upload_on_cloud = async (LocalFilePath) => {
  try {
    if (!LocalFilePath) return null;

    const response = await cloudinary.uploader.upload(LocalFilePath, {
      resource_type: "auto",
    });

    fs.unlinkSync(LocalFilePath);
    return response;
  } catch (error) {
    console.log("Upload failed:", error.message);
    if (fs.existsSync(LocalFilePath)) fs.unlinkSync(LocalFilePath);
    return null;
  }
};

export { upload_on_cloud };
