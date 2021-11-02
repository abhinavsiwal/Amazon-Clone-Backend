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
  getUserDetails,
  updateUser,
  deleteUser,
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
router.get('/admin/user/:id',isAuthenticatedUser,authorizeRoles('admin'),getUserDetails)
router.put('/admin/user/:id',isAuthenticatedUser,authorizeRoles('admin'),updateUser)
router.delete('/admin/user/:id',isAuthenticatedUser,authorizeRoles('admin'),deleteUser)

module.exports = router;
