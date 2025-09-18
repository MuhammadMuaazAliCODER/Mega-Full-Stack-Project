import mongoose,{Schema} from 'mongoose';

const userSchema = new Schema ({
userName :{
    type : String,
    required : true,
    unique:true,
    lowercase : true,
    trim:true,
    index:true
},

email:{
type:String,
 required : true,
    unique:true,
    lowercase : true,
    trim:true

},

FullName:{
    type:String,
 required : true,
    trim:true,
    index:true
},

Avatar:{
    type:String, //cloudnary URL
    required:true,

},

CoverImgae:{
    type:String, //cloudnary URL
    
},

WatchHistory:[{
    type:Schema.Types.ObjectId,
    ref : "Video"
}]


},{})

export const user = mongoose.model("User",userSchema)
