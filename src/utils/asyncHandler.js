// const asyncHandler=(fn)=>async()=>{}
                      
const asyncHandler=(requestHandler)=>{
 return (req,res,next)=>{
    Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
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

