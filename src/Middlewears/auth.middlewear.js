import { user } from "../models/user.model.js";
import { ApiError } from "../Utils/apierrors.js";
import { asynHandler } from "../Utils/asynHandler.js";
import jwt from "jsonwebtoken"

export const verifyJWT = asynHandler(async(req,res,next)=>{
    try {
        const token = req.cookies?.accessToken || 
        req.header("Authorization")?.replace("Bearer ","")
        if(!token){
            throw new ApiError(401,"Unauthorized Request")
        }
        const decodedToken =  await jwt.verify(token,process.env.ACCESS_TOKEN_SECRECT)
        console.log(decodedToken)
      const finaluser =   await user.findById(decodedToken?._id).select(" -password -RefreshToken ")
      if(!finaluser){
         throw new ApiError (401,"Invalid Access token ");
      }
      req.user = finaluser;
      next()
    } catch (error) {
        console.log(error)
        throw new ApiError(401,error?.message|| "Invalid Access Token ")
    }
})