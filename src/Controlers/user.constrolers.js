import {asynHandler} from "../Utils/asynHandler.js"
import {ApiError} from "../Utils/apierrors.js" 
import {user} from "../models/user.model.js"
import {upload_on_cloud} from '../Utils/cloudnary.js'
import {Apiresponse} from '../Utils/apiresponse.js'
import {uploadUserImages} from "../Validations/uploader_check.validation.js";

const registerUser = asynHandler(async(req , res )=>{
 
     const {FullName,email,userName,password} = req.body;
   

    if (![FullName, email, userName, password].every(Boolean)){
         return res.status(400).json(new ApiError (400,"FullName, email, userName, and password are required."))
      }

   const exsistedUser =  await user.findOne({
        $or:[{ userName }, { email } ]
   })
   if(exsistedUser){
      return res.status(409).json(new ApiError (409,"User with this email or user_name is alredy register "))
   }

    const { avatarUrl, coverImageUrl } = await uploadUserImages(req, res);

  const User =  await user.create({
    FullName:FullName,
    Avatar : avatarUrl,
    CoverImgae : coverImageUrl || "",                                                 
    email:email,
    password:password,
    userName:userName.toLowerCase(),
   })

  const createdUser =  await user.findById(User._id).select("-password -RefreshToken")

  if(!createdUser){
    throw new ApiError (500,"Something went wrong while registering the user ")
  }

   return res.status(201).json(new Apiresponse(201,createdUser,"User created"))
    
})


export {registerUser}                                                                                                               