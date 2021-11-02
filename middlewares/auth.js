const jwt = require('jsonwebtoken');
const User = require('../models/user')
exports.isAuthenticatedUser=async(req,res,next)=>{

    const {token} = req.cookies;
    
    if(!token){
        return res.status(401).json({message:"Login first to access this resource"});
    }

    const decodedToken = jwt.verify(token,process.env.JWT_SECRET);
    req.user = await User.findById(decodedToken.id);
    
    next();

}

//Handling users roles 
exports.authorizeRoles=(...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return res.status(403).json({message:`Role (${req.user.role}) is not allowed to access this resource`})
        }
        next();
    }
}