const asynHandler = (request_hander)=>{
(req,res,next) =>
    {
    Promise.reslove(request_hander(req,res,next)).catch(err=>{

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

export {asynHandler};