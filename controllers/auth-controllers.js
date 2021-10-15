const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendToken = require("../utils/jwtToken");
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
        id: this._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
  } catch (err) {
      console.log(err)
  }
  sendToken(createdUser,token,200,res);
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
    token = jwt.sign({ userId: existingUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
  } catch (err) {
      console.log(err);
  }
  sendToken(existingUser,token,200,res);
};
