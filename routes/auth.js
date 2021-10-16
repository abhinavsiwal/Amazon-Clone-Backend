const express = require('express');
const router= express.Router();

const {registerUser,loginUser,logoutUser, forgotPassword} = require('../controllers/auth-controllers');

router.post('/register',registerUser);
router.post('/login',loginUser);
router.get('/logout',logoutUser);
router.post('/password/forgot',forgotPassword);


module.exports=router;