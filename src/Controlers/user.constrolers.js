import {asynHandler} from "../Utils/asynHandler.js"

const registerUser = asynHandler(async(req , res )=>{
   return res.status(200).json({
        message:"ok your API is working ",
    })

})

export {registerUser}