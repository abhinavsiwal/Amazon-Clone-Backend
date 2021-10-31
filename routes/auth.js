const express = require("express");
const router = express.Router();
const {isAuthenticatedUser}=require('../middlewares/auth')

const {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  getUserProfile,
  changePassword,
} = require("../controllers/auth-controllers");


router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.post("/password/forgot", forgotPassword);
router.put("/password/reset/:token", resetPassword);
router.get("/profile",isAuthenticatedUser,getUserProfile);
router.put("/password/change",isAuthenticatedUser,changePassword)

module.exports = router;
