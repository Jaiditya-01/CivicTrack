const express = require('express');

const router = express.Router();

const {

  register,

  login,

  getMe,

  updateProfile,

  updatePassword,

  forgotPassword,

  resetPassword,

  deleteAccount,

} = require('../controllers/authController');

const { protect } = require('../middleware/auth');



router.post('/register', register);

router.post('/login', login);

router.post('/forgot-password', forgotPassword);

router.post('/reset-password/:token', resetPassword);

router.get('/me', protect, getMe);

router.put('/profile', protect, updateProfile);

router.put('/password', protect, updatePassword);

router.delete('/account', protect, deleteAccount);



module.exports = router;

