import { asynHandler } from "../Utils/asynHandler.js";
import { ApiError } from "../Utils/apierrors.js";
import { user } from "../models/user.model.js";
import { uploadUserImages } from "../Validations/uploader_check.validation.js";
import { Apiresponse } from "../Utils/apiresponse.js";
import { otpStore } from "./otp.controler.js"; 
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const User = await user.findById(userId);
    if (!User) {
      throw new ApiError(404, "User not found while generating tokens");
    }

    const accessToken = User.generateAccessToken();
    const refreshToken = User.generateRefreshToken();

    User.RefreshToken = refreshToken;
    await User.save({ validateBeforeSave: false });


    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error generating tokens:", error);
    throw new ApiError(500, "Something went wrong while generating access and refresh tokens");
  }
};


const registerUser = asynHandler(async (req, res) => {
  const { FullName, email, userName, password } = req.body;

 
  if (![FullName, email, userName, password].every(Boolean)) {
    return res
      .status(400)
      .json(new ApiError(400, "FullName, email, userName, and password are required."));
  }

  
  const verifiedRecord = otpStore.get(email);
  if (!verifiedRecord || !verifiedRecord.verified) {
    return res.status(401).json(new ApiError(401, "Email not verified. Please verify OTP first."));
  }

  
  const existedUser = await user.findOne({
    $or: [{ userName }, { email }],
  });

  if (existedUser) {
    return res
      .status(409)
      .json(new ApiError(409, "User with this email or username already exists."));
  }

  console.log("Proceeding with user registration...");
  
  const { avatarUrl, coverImageUrl } = await uploadUserImages(req, res);
  console.log("Avatar URL:", avatarUrl);

  
  const newUser = await user.create({
    FullName,
    Avatar: avatarUrl,
    CoverImage: coverImageUrl || "",
    email,
    password,
    userName: userName.toLowerCase(),
    isVerified: true, 
  });

  const createdUser = await user
    .findById(newUser._id)
    .select("-password -RefreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user.");
  }

 
  otpStore.delete(email);

  return res
    .status(201)
    .json(new Apiresponse(201, createdUser, "User registered successfully"));
});


const loginUser = asynHandler(async (req, res) => {
  const { email, userName, password } = req.body;

  if ((!email && !userName) || !password) {
    throw new ApiError(400, "Either email or username and password are required.");
  }

  const existedUser = await user.findOne({
    $or: [{ userName }, { email }],
  });

  if (!existedUser) {
    throw new ApiError(404, "User with this email or username does not exist.");
  }

  const isPasswordValid = await existedUser.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Incorrect password.");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(existedUser._id);

  const loggedInUser = await user
    .findById(existedUser._id)
    .select("-password -RefreshToken");

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new Apiresponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});


const logoutUser = asynHandler(async (req, res) => {
  await user.findByIdAndUpdate(
    req.user._id,
    { $set: { RefreshToken: "" } },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new Apiresponse(200, {}, "User logged out successfully"));
});

const RefreshAccessToken = async (req, res) => {

  const incomming_RefresToken = req.cookies.refreshToken || req.body.refreshToken;

  if( !incomming_RefresToken ){
    throw new ApiError(401, "Unauthorized request ( Refresh token is required )");
  }

  console.log("Incoming Refresh Token , token secrect ", incomming_RefresToken ,  process.env.REFRESH_TOKEN_SECRET );
 
  try {
 
    const DecodedToken =  jwt.verify(
     incomming_RefresToken,
     process.env.REFRESH_TOKEN_SECRET
 
    )
 
    const USER = await user.findById(DecodedToken?._id);
    console.log ("Decoded Token id ", DecodedToken?._id );
 
    if( !USER ){
     throw new ApiError(401, "Invalid Refresh Token - User not found");
 
    }
 
    if( USER?.RefreshToken !== incomming_RefresToken ){
       throw new ApiError(401, "Refresh Token is expired or used in another device");
 
      }
 
      const options = {
     httpOnly: true,
     secure: true
    }
 
    const {accessToken , newRefreshToken} = await generateAccessAndRefreshToken(USER._id);
 
    return res
     .status(200)
     .cookie("accessToken", accessToken, options)
     .cookie("refreshToken", newRefreshToken, options)
     .json(
       new Apiresponse(
         200,
         { accessToken, refreshToken: newRefreshToken },
         "Access token refreshed successfully"
       )
     );
 }
  catch (error) {
  
    throw new ApiError(401, error?.message || "Invalid Refresh Token" );
 }
};

const getCurrentUser = asynHandler(async (req, res) => {
  return res.status(200).json(200,req.user,"Current user fetched successfully");
});

export { registerUser, loginUser, logoutUser , RefreshAccessToken , getCurrentUser };
