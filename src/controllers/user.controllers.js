import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/apiError.js'

import {User} from '../models/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'

import {Apirespone} from '../utils/apiResponse.js'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

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



/// change password to new password by creating this method
const changeCurrentPassword= asyncHandler(async (req,res)=>{
  const {oldPassword,newPassword}=req.body
  const user=await  User.findById(req.user?._id)
  
  const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)
  if(!isPasswordCorrect){
    throw new ApiError(400,"Inavalid Password")
  }
  user.password=newPassword
   await user.save({validateBeforeSave:false})

   return res.status(200)
   .json(new ApiError(200,{},"Password changed successfully"))

})    


///// get userCurrent

const getCurrentUser=asyncHandler(async (req,res)=>{
  return res.status(200)
  .json(200,req.user,"current user feteched Successfullt")
})


//// update account details

const updateAccountDetails=asyncHandler(async(req,res)=>{
  const {fullname,email}=req.body
  if(!fullname|| !email){
    throw new ApiError(400,"All fields are required")
  }
 const user= User.findByIdAndUpdate(req.user?._id,
    {
      $set:{
        fullname,
        email
      }
    },
    {new:true}

  ).select('-password')
  return res.status(200)
  .json(new Apirespone(200,user,"Account details updated Successfully"))
})



const updateUserAvatar=asyncHandler(async (req,res)=>{
      const avatarLocalPath=req.file?.path

      if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is missing")
      }
    const avatar= await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
      throw new ApiError(400,"Error while uploading on avatar")
    }
    const user= await User.findByIdAndUpdate(req.user?._id,
        {
          $set:{
            avatar:avatar.url
          }
        },
        {new:true}
      ).select("-password")

      return res.status(200)
      .json(new Apirespone(200,user,"avatar image updated successfully"))
})




const getUserChannelProfile=asyncHandler(async (req,res)=>{
    const {username}=req.params
    if(!username?.trim()){
      throw new ApiError(400,"username is missing")
    }

    const channel=await User.aggregate([
      {
        $match:{
          username:username?.toLowerCase()
        }
      },
      //// check k hamre pass kitne subscriber ha 
      {
        $lookup:{
          from:'subscription',
          localField:"_id",
          foreignField:"channel",
          as:"subscribers"
        }
      },
      ///// cehck k hame ne kitne channel subscribe keye ha 
      {
        $lookup:{
          from:'subscription',
          localField:"_id",
          foreignField:"subscriber",
          as:"subscribeTo"
        }
      },
      ///// ye jo hame lehka ha ye to rhega he rhega blke or b fields add kr jai ga
      {
        //// es pr main ne maloom keya ha k mere kitne subsciber ha or user ne kitne channel subscribe keye haa....
        $addFields:{
          subscribersCount:{
            $size:'$subscribers'
          },
           channelSubscribeToCount:{
            $size:'$subscribeTo'
          },
          isSubscribed:{
            $cond:{
              if:{$in:[req.user?._id,'$subscribers.subscriber']},
              then:true,
              else:false

            }
          }
        }
      },
      {
        $project:{
          fullname:1,
          username:1,
          subscribersCount:1,
          channelSubscribeToCount:1,
          isSubscribed:1,
          avatar:1,
          email:1      
        }
      }

    ])
    console.log(channel)
    if(!channel?.length){
      throw new ApiError(404,"channel does not exist")
    }

    return res
    .status(200)
    .json(
      new Apirespone(200,channel[0],"user channel feteced successfully")
    )
})



///// watchHistory pipline


const getWatchHistory=asyncHandler(async (req,res)=>{
 const user=await User.aggregate([
  {
    $match:{
      _id:new mongoose.Types.ObjectId(req.user._id)
    }
  },
  {
    $lookup:{
      from:'video',
      localField:'watchHistory',
      foreignField:'_id',
      as:'watchHistory',
      pipeline:[
        {
          $lookup:{
            from:'user',
            localField:'owner',
            foreignField:'_id',
            as:'owner',
            pipeline:[
              {
                $project:{
                  fullname:1,
                  username:1,
                  avatar:1
                }
              }
            ]
          }
        },
        {
          $addFields:{
            owner:{
              $first:'$owner'
            }
          }
        }
      ]
    }
  }
 ]) 
 
 return res 
 .status(200)
 .json(new Apirespone(200,user[0].watchHistory,"watch history fetched successfully"))
})
export {registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  getUserChannelProfile,
  getWatchHistory
}



///// note ye jo capital wala User ha ye data base main jo store ha wo ye ha or ye jo ye wala "user" ha ham ne database es ko reive keya ha