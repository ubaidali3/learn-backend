import mongoose, { Schema } from "mongoose";

const subscriptionSchema=new mongoose.Schema(
  {
    subscriber:{
      type:Schema.Types.ObjectId,  /// one who is scubscribing
      ref:'User'
    },
    channel:{
      type:Schema.Types.ObjectId,  /// one to whom  'scubscriber' is subscribing
      ref:'User'
    },


},{timestamps:true})



export const Subscription= mongoose.model('Subscription',subscriptionSchema)