const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const {
  register,
  verifyOTP,
  login,
  resendOTP,
  getMe,
} = require('../controllers/authController');

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.post('/resend-otp', resendOTP);
router.get('/me', auth, getMe);

module.exports = router;
