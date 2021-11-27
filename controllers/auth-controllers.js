const User = require("../models/user");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const cloudinary = require("cloudinary").v2;

//Register a User
exports.registerUser = async (req, res, next) => {
  let result;
  try {
    result = await cloudinary.uploader.upload(req.body.avatar, {
      folder: "Avatars",
      width: 150,
      crop: "scale",
    });
  } catch (err) {
    console.log(err);
    console.log("error in cloudinary");
  }

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
      public_id: result.public_id,
      url: result.secure_url,
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
  // const resetUrl = `${req.protocol}://${req.get(
  //   "host"
  // )}/api/password/reset/${resetToken}`;
  const resetUrl = `http://localhost:3000/password/reset/${resetToken}`;
  console.log(resetUrl);
  const message = `Your password reset token is as follow:\n\n${resetUrl}\n\nIf you have not requested this email,then ignore it.`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Amazon Password Recovery",
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email}`,
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

//Reset Password
exports.resetPassword = async (req, res, next) => {
  //Hash URL Token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  let user;
  try {
    user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
  } catch (err) {
    console.log(err);
  }
  if (!user) {
    return res
      .status(400)
      .json({ message: "Password Reset Token is invalid or has been expired" });
  }

  if (req.body.password !== req.body.confirmPassword) {
    return res.status(401).json({ message: "Password do not match" });
  }

  //Setup new Password
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(req.body.password, 12);
  } catch (err) {
    console.log(err);
  }
  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  try {
    await user.save();
  } catch (err) {
    console.log(err);
  }
  let token;
  try {
    token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
  } catch (err) {
    console.log(err);
    return res
    .status(400)
    .json({ message: "Unexpected Error" });
  }
  sendToken(user, token, 200, res);
};

//Get currently logged in user details
exports.getUserProfile = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    user,
  });
};

//Update/Change Password
exports.changePassword = async (req, res, next) => {
  let user;
  try {
    user = await User.findById(req.user.id).select("+password");
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error Occured in Fetching User." });
  }
  //Check previous user password
  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(req.body.oldPassword, user.password);
    console.log(isValidPassword);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Login failed, Please try again later." });
  }
  if (!isValidPassword) {
    return res.status(401).json({ message: "Old Password is Incorrect" });
  }
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(req.body.newPassword, 12);
  } catch (err) {
    console.log(err);
  }
  user.password = hashedPassword;

  await user.save();
  let token;
  try {
    token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
  } catch (err) {
    console.log(err);
  }
  sendToken(user, token, 200, res);
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  const { name, email } = req.body;
  const newUserData = {
    name,
    email,
  };
  if (req.body.avatar !== "") {
    try {
      const user = await User.findById(req.user.id);
      const image_id = user.avatar.public_id;
      const res = await cloudinary.uploader.destroy(image_id);
      const result = await cloudinary.uploader.upload(req.body.avatar, {
        folder: "Avatars",
        width: 150,
        crop: "scale",
      });
      newUserData.avatar = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    } catch (error) {
      console.log("Error in cloudinary");
    }
  }
  try {
    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Update User Failed" });
  }
  res.status(200).json({
    success: true,
    message: "User updated Successfull",
  });
};

// Admin Routes

// Get all Users
exports.allUser = async (req, res, next) => {
  let users;
  try {
    users = await User.find();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Getting users failed" });
  }
  return res.status(200).json({
    success: true,
    users,
  });
};

// Get user details
exports.getUserDetails = async (req, res, next) => {
  let user;
  try {
    user = await User.findById(req.params.id);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: `User does not found with id:${req.params.id}` });
  }
  if (!user) {
    return res
      .status(500)
      .json({ message: `User does not found with id:${req.params.id}` });
  }
  res.status(200).json({
    success: true,
    user,
  });
};

//Update user profile admin
exports.updateUser = async (req, res, next) => {
  const { name, email, role } = req.body;
  const newUserData = {
    name,
    email,
    role,
  };
  try {
    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Update User Failed" });
  }
  res.status(200).json({
    success: true,
    message: "User updated Successfull",
  });
};

// Delete User-admin
exports.deleteUser = async (req, res, next) => {
  let user;
  try {
    user = await User.findById(req.params.id);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: `User does not found with id:${req.params.id}` });
  }
  if (!user) {
    return res
      .status(500)
      .json({ message: `User does not found with id:${req.params.id}` });
  }
  //Remove Avatar from Cloudnary -todo
  try {
    await user.remove();
  } catch (err) {
    console.log(err);
  }
  res.status(200).json({
    success: true,
  });
};
