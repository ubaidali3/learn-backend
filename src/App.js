import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'


const app=express()
app.use(cors({
  origin:process.env.CORS_ORIGIN,
  credentials:true
}))
app.use(express.json({
  limit:'16kb'
}))
app.use(express.urlencoded({
  extended:true,
  limit:'16kb ' 
}))

app.use(express.static('public'))
app.use(cookieParser())

/// routes   
import userRouter from './routes/user.routes.js'

//// routes declrartion 

app.use('/api/v1/user',userRouter)  /// es code ka mtlb ha k jow api/v1/user pe pir os k baad jo controller ya routes hoga wo oder chla jai ga jesa http://localhost:800/api/v1/user/register pe chla jai ga to es main confuse nhi hona ha 



export {app}        