import mongoose,{Schema} from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

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
,

password:{
    type:String,
    required:[true , "Password is required : "],

},

RefreshTocken:{
type:String,

}


},{
    timestamps:true
})
 
userSchema.pre("save", async function (next) {
    if(!this.isModified("password")){} return;
    this.password = bcrypt.hash(this.password,10)
    next()
})
userSchema.methods.isPasswordCorrect = async function (password) {
return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function () {
   return jwt.sign({
       id: this._id,
        email : this.email,
        userName:this.userName,
        FullName:this.FullName,
    },
 process.env.ACCESS_TOKEN_SECRECT,
    {
        expiresIn : process.env.ACCESS_TOKEN_EXPIRY
    }
)
   

}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
       id: this._id,
       
    },
 process.env.REFRESH_TOKEN_SECRECT,
    {
        expiresIn : process.env.REFRESH_TOKEN_EXPIRY
    }
)
}
export const user = mongoose.model("User",userSchema)
