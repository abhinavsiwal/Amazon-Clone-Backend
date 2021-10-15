const mongoose = require('mongoose');
const validator = require('validator'); 

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

module.exports= mongoose.model('User',userSchema);