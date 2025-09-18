import mongoose ,{Schema} from 'mongoose'

const VideoSchema = new Schema({
    videoFile:{
        type:String,
        required:true,
        
    },
    thumbnail:{
        type:String,
        required:true
    },
     title:{
        type:String,
        required:true
    },
      title:{
        required:true,
        type:String
    },

},{timestamps:true})

export const Video = mongoose.model("Video",VideoSchema)
