
import mongoose from 'mongoose'
import { Db_NAME } from '../constant.js'
const connectDB = async()=>{
try {
  const connectionInstance= await mongoose.connect(`${process.env.MONOGODB_URL}/${Db_NAME}`)
  console.log(connectionInstance)
  throw("something wrong")
} catch (error) {
  console.log("there is some err",error)
}
}

export default connectDB