import mongoose, { Schema } from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const userSchema= new mongoose.Schema(
  {
    username:{
      type:String,
      required:true,
      unique:true,
      lowercase:true,
      trim:true,
      index:true
    },
    email:{
      type:String,
      required:true,
      unique:true,
      lowercase:true,
      trim:true,
     
    },
      fullname:{
      type:String,
      required:true,lowercase:true,
      trim:true,
      index:true
     
    },
    avatar:{
      type:String, /// cloudunary url
      required:true,
    },
  
    watchHistory:[
      {
        type:Schema.Types.ObjectId,
        ref:'Video'
      }
    ],
    password:{
      type:String,
       required:[true,'Password is required']
    },
    refreshToken:{
       type:String,

    }

  },{timestamps:true}
)              
userSchema.pre("save",async function (next){
  if(!this.isModified('password')) return next()
    this.password=await bcrypt.hash(this.password,10)
    next()
})

userSchema.method.isPasswordCorrect=async function (Password) {
  return await bcrypt.compare(Password,this.password)
}  ///ye jo database main pasword hash store howa ha ye function on se match kre ga          



userSchema.methods.generateAccessToken=function () {
 return jwt.sign({
    _id:this._id,
    email:this.email,
    username:this.username,
    fullname:this.fullname
  },
  process.env.ACCESS_TOKEN_SECRET,{
    expiresIn:process.env.ACCESS_TOKEN_EXPIRY
  }
)
}  //// "Mujhe protected resources access karne ki permission hai."
userSchema.methods.generateRefreshToken=function () {
  return jwt.sign({
    _id:this._id,
   
  },
  process.env.REFRESH_TOKEN_SECRET,{
    expiresIn:process.env.REFRESH_TOKEN_EXPIRAY
  }
)
}

export const User=mongoose.model('User',userSchema)