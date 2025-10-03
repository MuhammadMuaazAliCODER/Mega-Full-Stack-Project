import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { resourceLimits } from "worker_threads";

const cloudName = process.env.MY_CLOUD_NAME;

cloudinary.config({ 
  cloud_name: "dptglaizz", 
  api_key: "615564473456831", 
  api_secret: "Tq77nElMsw63Z7jmYF-mpMubceo",
});

const upload_on_cloud = async (LocalFilePath) => {
    try {
        if(!LocalFilePath) return null 
       const pic_send_responce = await cloudinary.uploader.upload(LocalFilePath,{
            resource_type :"auto"
        })
        //files has benn uploadted successfully 
        console.log("File uploaded",pic_send_responce.url)
        return pic_send_responce;
    } catch (error) {
        console.log(error);
        fs.unlinkSync(LocalFilePath) //remove the locally safed temp file 
        return null;
    }
}


export {upload_on_cloud};