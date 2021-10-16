const User = require("../models/user");
const bcrypt = require("bcrypt");
const crypto = require('crypto');
const jwt = require("jsonwebtoken");
const sendToken = require("../utils/jwtToken");
const sendEmail=require('../utils/sendEmail');
//Register a User
exports.registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Signing up falied, Please try again later" });
  }
  if (existingUser) {
    return res
      .status(500)
      .json({ message: "User already exists. Please try to login" });
  }

  //-----Bcrypt Password-----
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    console.log(err);
  }

  const createdUser = new User({
    name,
    email,
    password: hashedPassword,
    avatar: {
      public_id: "IMG_2928-02_chtyat",
      url: "https://res.cloudinary.com/abhinavsiwal/image/upload/v1634277630/IMG_2928-02_chtyat.jpg",
    },
  });
  try {
    await createdUser.save();
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Signing up falied, Please try again later" });
  }
  let token;
  try {
    token = jwt.sign(
      {
        id: createdUser._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
  } catch (err) {
    console.log(err);
  }
  sendToken(createdUser, token, 200, res);
};

// Login user

exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email }).select("+password");
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Login failed, Please try again later." });
  }
  if (!existingUser) {
    return res.status(401).json({ message: "User not Found." });
  }
  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Login failed, Please try again later." });
  }
  if (!isValidPassword) {
    return res.status(401).json({ message: "Incorrect Password" });
  }
  let token;
  try {
    token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
  } catch (err) {
    console.log(err);
  }
  sendToken(existingUser, token, 200, res);
};

// Logout User
exports.logoutUser = (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Logout Successfully",
  });
};

// Forgot Password
exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  let user;
  try {
   user = await User.findOne({ email: email });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
  if (!user) {
    return res.status(500).json({ message: "User not found with this email" });
  }
  //Get reset token
  const resetToken = user.getResetPasswordToken();

  try {
    await user.save({ validateBeforeSave: false });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
  //Create reset password Url
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/password/reset/${resetToken}`;
  console.log(resetUrl);
  const message = `Your password reset token is as follow:\n\n${resetUrl}\n\nIf you have not requested this email,then ignore it.`;
  try{
    await sendEmail({
      email:user.email,
      subject:'Amazon Password Recovery',
      message
    })
    res.status(200).json({
      success:true,
      message:`Email sent to ${user.email}`
    })
  }catch(err){
    user.resetPasswordToken=undefined;
    user.resetPasswordExpire=undefined;
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

//Reset Password
exports.resetPassword=async(req,res,next)=>{
  //Hash URL Token
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  let user;
  try{
    user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire:{$gt:Date.now()}
    })
  }catch(err){
    console.log(err);
  }
  if(!user){
    return res.status(400).json({message:"Password Reset Token is invalid or has been expired"});
  }

  if(req.body.password!==req.body.confirmPassword){
    return res.status(401).json({message:"Password do not match"});
  }

  //Setup new Password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  try{
    await user.save();
  }catch(err){
    console.log(err);
  }
  let token;
  try {
    token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
  } catch (err) {
    console.log(err);
  }
  sendToken(user,token,200,res)
}