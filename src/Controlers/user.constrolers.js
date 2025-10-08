import {asynHandler} from "../Utils/asynHandler.js"
import {ApiError} from "../Utils/apierrors.js" 
import {user} from "../models/user.model.js"
import {upload_on_cloud} from '../Utils/cloudnary.js'
import {Apiresponse} from '../Utils/apiresponse.js'
import {uploadUserImages} from "../Validations/uploader_check.validation.js";


const generateAccessAndRefreshToken = async (userId) => {
  try {
    const User = await user.findById(userId);

    const accessToken = User.generateAccessToken();
    const refreshToken = User.generateRefreshToken();
    
    
    
    User.refreshToken = refreshToken;
    await User.save({ validateBeforeSave: false });
    
    console.log("access Tokens:", accessToken );
    console.log("refresh Tokens:", refreshToken );

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating access and refresh tokens");
  }
};


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

const loginUser = asynHandler(async (req, res) => {
  // console.log(req);
  const { email, userName, password } = req.body;

  if ((!userName || !email) && !password) {
    throw new ApiError(400, "Validation failed: either email or userName and password are required.");
  }

  const existedUser = await user.findOne({
    $or: [{ userName }, { email }],
  });

  if (!existedUser) {
    throw new ApiError(404, "User with this email or userName does not exist");
  }

  const isPasswordValid = await existedUser.isPasswordCorrect(password); 

  if (!isPasswordValid) {
    throw new ApiError(401, "Password incorrect.");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(existedUser._id);

  const loggedInUser = await user.findById(existedUser._id).select("-password -refereshToken");

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new Apiresponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully"));
});

const logoutUser = asynHandler(async(req,res) =>{
  
  await user.findByIdAndUpdate(
   req.user._id,
   {
     $set:{
      RefreshToken:undefined
     }
   },
   {
      new:true
   }
  )
  const options = {
    httpOnly :true,
    secure :true
   }
   return res.status(200).
   clearCookie("accessToken",options).
   clearCookie("refereshToken",options).
   json(new Apiresponse(200,{},"User logged out "))
})

export {registerUser , loginUser , logoutUser}  