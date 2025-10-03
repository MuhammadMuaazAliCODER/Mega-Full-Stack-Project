import {ApiError} from "./apierrors.js"

const asynHandler = (request_hander) => {
    return (req,res,next) => {
        Promise.resolve(request_hander(req, res, next)).catch(err => {
            console.log(err);
            res.status(err.statusCode || 500).json(new ApiError (err.statusCode, err.errors))
        })
    }
}

const asynHandler2 = (fn)=> async (err,req,res,next) => {
try {
    await fn(err,req,res,next)
    
} catch (error) {
    res.status(500 || err.code).json({ message:error.message})
}
}

export {asynHandler} ;
export {asynHandler2};