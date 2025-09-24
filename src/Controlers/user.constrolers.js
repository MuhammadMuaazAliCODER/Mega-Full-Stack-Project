import {asynHandler} from "../Utils/asynHandler.js"

const registerUser = asynHandler(async(req , res )=>{
   return res.status(200).jason({
        message:"ok",
    })

})

export {registerUser}