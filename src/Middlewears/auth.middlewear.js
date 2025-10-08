import { user } from "../models/user.model.js";
import { ApiError } from "../Utils/apierrors.js";
import { asynHandler } from "../Utils/asynHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asynHandler(async (req, res, next) => {
  try {
  
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized Request - No token provided");
    }

   
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
   

   
    const finalUser = await user
      .findById(decodedToken?.id)
      .select("-password -RefreshToken");

    if (!finalUser) {
      throw new ApiError(401, "Invalid Access token - User not found");
    }

   
    req.user = finalUser;
    next();
  } catch (error) {
   
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});
