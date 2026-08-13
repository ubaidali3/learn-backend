import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/apiError.js'

import {User} from '../models/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'

import {Apirespone} from '../utils/apiResponse.js'
import jwt from 'jsonwebtoken'

const generateAccessAndRefreshTokens=async(userId)=>{
  try {
    const user=await User.findById(userId)
    const accessToken=user.generateAccessToken()
    const refreshToken=user.generateRefreshToken()

    user.refreshToken=refreshToken
   await user.save({validateBeforeSave:false})

   return {accessToken,refreshToken}


  } catch (error) {
    throw new ApiError(500 ,'something went wromg while genrating refresh and Access token')
  }
}
//// register user
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





///// login user 

const loginUser=asyncHandler(async (req,res)=>{
    //// req body -> data
    ///// username or email
    ////// find the user 
    ////// password check
    ///// access and refresh token 
    ///// send cookie
    const {email,password,username}= req.body

    console.log("LOGIN BODY:", req.body)
    if(!email && !username){
      throw new ApiError(404,"username or email is required")
    }
    // check user 
   const user = await User.findOne({
    $or :[{email},{username}]
   })
   if(!user){
    throw new ApiError(404,"User does not exist")
   }

   ////// check password 
   const isPasswordValid= await user.isPasswordCorrect(password)

     if(!isPasswordValid){
    throw new ApiError(404,"Invalid user Password")
   }

   //// refres token and access token by the way ham ne es ko leye oper menthod bnaya ha wo es ka he ha
   const {accessToken, refreshToken}= await generateAccessAndRefreshTokens(user._id)

   const loggedInUSer=await User.findById(user._id).select('-password -refreshToken')

   ///// send cookies

   const options ={
    httpOnly:true,
    secure:true
   }
   return res.status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",refreshToken,options)
   .json(
    new Apirespone(200,
      {
      user:loggedInUSer,accessToken,refreshToken
    },"User Logged in successfully")
   )
})




///// user logout 

const logOutUser=asyncHandler(async (req,res)=>{
  //// ye req.user ham ne auth.middleware.js main deya ta or oder se route ko or pir route se yaha pe direct lehka ha to confuse nhi hona ha
   await User.findByIdAndUpdate(
      req.user._id,
      {
        $set:{
          refreshToken:undefined
        }
      },{
          new:true
        }
    )

    
   const options ={
    httpOnly:true,
    secure:true
   }
   return res.status(200)
   .clearCookie("accessToken",options)
   .clearCookie("refreshToken",options)
   .json(
    new Apirespone(200,
      {},"User Logged out successfully")
   )
})


//// create refresh access token

const refreshAccessToken=asyncHandler(async (rea,res)=>{
 const incomingRefreshToken= req.cookies.refreshToken || req.body.refreshToken
 if(!incomingRefreshToken){
  throw new ApiError(401,"Unathorized Request")
 }
 const decodedToken= jwt.verify(incomingRefreshToken,
  process.env.REFRESH_TOKEN_SECRET
 )
 const user= await User.findById(decodedToken?._id)

 if(!user){
  throw new ApiError(401,"invalid refresh Token ")
 }

 if(incomingRefreshToken !== user?.refreshToken){
  throw new ApiError(401,"Refresh token is expired or used ")
 }

 const options={
  httpOnly:true,
  secure:true
 }
 const {accessToken,newRefreshToken}= await generateAccessAndRefreshTokens(user._id)
 return res
 .status(200)
 .cookie("accessToken",accessToken,options)
 .cookie("refreshToken",newRefreshToken,options)
 .json(
  new Apirespone(200,{accessToken,newRefreshToken},
    "Access Token Refreshed"
  )
 )

})




export {registerUser,loginUser,logOutUser,refreshAccessToken}



///// note ye jo capital wala User ha ye data base main jo store ha wo ye ha or ye jo ye wala "user" ha ham ne database es ko reive keya ha