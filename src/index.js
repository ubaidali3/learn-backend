// require('dotenv').config()

// import { app } from "./App.js";
// import connectDB from "./db/index.js";
// import  dotenv from 'dotenv'

// dotenv.config({
//   path:'./.env'
// })
// connectDB()
// .then(()=>{
//   app.listen(process.env.PORT,()=>{
//     console.log(`server was running on this  http://localhost:${process.env.PORT}`)
//   })
// })
// .catch((err)=>{
//   console.log("db connection was failed",err)
// })





import "dotenv/config";

import { app } from "./App.js";
import connectDB from "./db/index.js";

connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(
        `server was running on http://localhost:${process.env.PORT}`
      );
    });
  })
  .catch((err) => {
    console.log("db connection was failed", err);
  });






















/*
import express from 'express'

const app = express()

;(async () => {
  try {
    await mongoose.connect(`${process.env.MONOGODB_URL}/${Db_NAME}`)

    app.on("error", (err) => {
      console.log("Error", err)
      throw err
    })

    app.listen(process.env.PORT, () => {
      console.log(`Server is running at http://localhost:${process.env.PORT}`)
    })
  } catch (error) {
    console.log(error, "ERROR")
  }
})()


*/