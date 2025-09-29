import {asynHandler} from "../Utils/asynHandler.js"
import {ApiError} from "../Utils/apierrors.js" 
import {user} from "../models/user.model.js"
import {upload_on_cloud} from '../Utils/cloudnary.js'
import {Apiresponse} from '../Utils/apiresponse.js'
// const registerUser = asynHandler(async(req , res )=>{
//    return res.status(200).json({
//         message:"ok your API is working ",
//     })

// })

const registerUser = asynHandler(async(req , res )=>{
  /*
    User Registration Flow:

    1. Get user details from frontend
       - User details depend on our UserSchema

    2. Validation
       - Ensure fields are not empty

    3. Check if user already exists
       - Validate uniqueness of username & email

    4. Handle images
       - Especially check for avatar image

    5. Upload images to Cloudinary
       - Upload avatar (and other required images)

    6. Create user object
       - Insert new user entry into database

    7. Clean response
       - Remove password and refreshToken fields

    8. Verify creation
       - Check if user was successfully created

    9. Return response
       - Send appropriate success or error response
*/
     
     const {FullName,email,userName,password} = req.body 
     console.log("Email :",email);
    //  if (FullName === "") {
    //     throw new ApiError(400,"Full name is required")
    //  }
    if ([FullName , email , userName , password ].some((field) => field?.trim()==="")
     ){
        throw new ApiError (400,"All fields are required ")
    }

  const exsistedUser =  await user.findOne({
        $or:[{ userName }, { email } ]
    })
    if(exsistedUser){
        throw new ApiError(409,"User with email or username alredy exists")
    }
   const avatarLocalPath =  req.files?.avatar[0]?.path;
   const coverImageLocalPath =  req.files?.coverimage[0]?.path;

   if (!avatarLocalPath) {
    throw new ApiError(400,"Avatar File is required ")
   }
   const avat = await upload_on_cloud(avatarLocalPath);
   const coverImg = await upload_on_cloud(coverImageLocalPath);

   if(!avat){
    throw new ApiError(400,"Avatar File is required ")
   }
  const User =  await user.create({
    FullName:FullName,
    Avatar : avat.url,
    CoverImgae : coverImg?.url || "",
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