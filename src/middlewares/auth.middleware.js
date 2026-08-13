import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken'
import {User} from '../models/user.model.js'
//// ye jo lehka ha as it is lehkna ha Q k es main "bearer" main space zaroor dena hota ha or "Authorization" as it is lehkna hota ha es leye jo jesa lehka ha os ko wese he lehko

export const verifyJWT= asyncHandler(async(req,res,next)=>{
try {
   const token= req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
 if(!token){
  throw new ApiError(404,'Unauthorized request')
 }
  const decodeToken= jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

 const user= await User.findById(decodeToken?._id).select('-password -refreshToken')
 if(!user){
  //// TODO: discuss about frontend
  throw new ApiError(401,"Invalid Access Token")
 }
 req.user=user
 next()
} catch (error) {
  throw new ApiError(401,err?.message || "invalid access token" )
}
})