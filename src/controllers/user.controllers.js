import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/apiError.js'

import {User} from '../models/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'

import {Apirespone} from '../utils/apiResponse.js'



const registerUser=asyncHandler(async(req,res)=>{
  //// get user details from frontend
  //// validation -- not empty 
  ///// check if user already exist : username, email
  /// check for images , check for avatar
///// upload them to cloudinary, avatar
//// create user object -- create entery in DB
///// remove password and refresh token field in from response 
///// check for user creation 
///// return res


    const {username,email,fullname,password}=    req.body

    console.log("ye pora request body ha",req.body)
    // if(fullname===""){
    //   throw new apiError(400,"fullName is required")
    // }
    if(
      [fullname,email,username,password].some((filed)=>filed?.trim()==="")
    )
      {
        throw new apiError(400,"All filed are required")
    }

    /// check user already exist or not 
    const existedUser= await User.findOne({
      $or:[{username}, {email}]
    })
    if(existedUser){
      throw new ApiError(409,"User with email or username already exist")
    }

    /// cehck images or avatar

  const avatarLocalPath=  req.files?.avatar[0]?.path;
  console.log("ye file ka console ha ",req.files)
  if(!avatarLocalPath){
    throw new ApiError(400, "avatar file is required")

  }

  /// upload Cloudinary avatar

 const avatar= await uploadOnCloudinary(avatarLocalPath)
 if(!avatar){
   throw new ApiError(400, "avatar file is required")
 }


 //// create user object -- create entery in DB  
   const user= await User.create({
      fullname,
      avatar:avatar.url,
      email,
      password,
      username:username.toLowerCase()
    })

    ///// remove password and refresh token field in from response 

   const createUser= await User.findById(user._id).select(
    "-refreshToken -password"
   )
   if(!createUser){
    throw new ApiError(500, "Something went wrong while registering the user")
   }


   return res.status(201).json(
    new Apirespone(200, createUser,"User registered SuccessFully")
   )
})


export {registerUser}