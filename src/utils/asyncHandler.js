// const asyncHandler=(fn)=>async()=>{}
                      
const asyncHandler=(requestHandler)=>{
  (req,res,next)=>{
    promise.resolve(requestHandler(req,res,next)).cathch((err)=>next(err))
  }
}

export {asyncHandler}



// const asyncHandler=(fn)=>async(req,res,next)=>{
//   try {
//     await fn(req,res,next)
//   } catch (error) {
//     res.statuse(error.statuseCode || 500).json({
//       message:error.message || "internal server error",
//       success:false
//     })
//   }
// }

