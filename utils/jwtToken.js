// Create and send token and save in the cookie.

const sendToken=(user,token,statusCode,res)=>{
    const options={
        expires:new Date(
            Date.now()+7*24*60*60*1000,
        ),
        httpOnly:true,
    }
    res.status(statusCode).cookie('token',token,options).json({
        sucsess:true,
        token,
        user
    })
}

module.exports=sendToken;