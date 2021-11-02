const express = require("express");
const router = express.Router();
const {isAuthenticatedUser,authorizeRoles}=require('../middlewares/auth')

const {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  getUserProfile,
  changePassword,
  updateProfile,
  allUser,
} = require("../controllers/auth-controllers");


router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.post("/password/forgot", forgotPassword);
router.put("/password/reset/:token", resetPassword);
router.get("/profile",isAuthenticatedUser,getUserProfile);
router.put("/password/change",isAuthenticatedUser,changePassword)
router.put("/profile/update",isAuthenticatedUser,updateProfile)
router.get('/admin/users',isAuthenticatedUser,authorizeRoles('admin'),allUser)

module.exports = router;
