const mongoose = require('mongoose');
const validator = require('validator'); 
const crypto=require('crypto');
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        maxLength:30,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        validate:[validator.isEmail,'Please enter a valid email address'],
    },
    password:{
        type:String,
        required:true,
        minLength:6,
        select:false,
    },
    avatar:{
        public_id:{
            type:String,
            required:true,
        },
        url:{
            type:String,
            required:true,
        }
    },
    role:{
        type:String,
        default:'user',
    },
    createdAt:{
        type:Date,
        default:Date.now,
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date,   

})
//Generate Password Reset Token
userSchema.methods.getResetPasswordToken=function(){
    //Generate token
    const resetToken=crypto.randomBytes(20).toString('hex');

    // Hash and set to resetPasswordToken
    this.resetPasswordToken=crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set token expire time 
    this.resetpasswordExpire=Date.now() + 30*60*1000;

    return resetToken;
}

module.exports= mongoose.model('User',userSchema);