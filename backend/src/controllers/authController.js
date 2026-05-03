const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const mongoose = require('mongoose');
function makeOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendEmailOTP(to, otp) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[DEV] OTP for ${to}: ${otp}`);
    return;
  }
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  await transporter.sendMail({
    from: `"StudyPlatform" <${process.env.EMAIL_USER}>`,
    to,
    subject: '🔐 Your OTP Code - StudyPlatform',
    html: `
      <div style="font-family:sans-serif;max-width:400px;margin:auto;padding:30px;background:#0f172a;color:#fff;border-radius:12px">
        <h2 style="color:#a78bfa">StudyPlatform</h2>
        <p>Your OTP verification code is:</p>
        <div style="font-size:48px;font-weight:bold;letter-spacing:12px;color:#f59e0b;text-align:center;padding:20px 0">${otp}</div>
        <p style="color:#94a3b8;font-size:13px">This code expires in 10 minutes. Do not share it with anyone.</p>
      </div>
    `,
  });
}

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if ((!email && !phone) || !password || !name)
      return res.status(400).json({ message: 'Name, password, and email or phone are required' });

    const exists = await User.findOne({ $or: [email ? { email } : null, phone ? { phone } : null].filter(Boolean) });
    if (exists && !exists.isVerified) {
  const otpCode = makeOTP();
  exists.otpCode = otpCode;
  exists.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await exists.save();

  if (exists.email) await sendEmailOTP(exists.email, otpCode);

  return res.status(200).json({
    message: "User exists, OTP resent",
    userId: exists._id,
    otpForDemo: process.env.NODE_ENV !== 'production' ? otpCode : undefined,
  });
}
if (exists && exists.isVerified) {
  return res.status(409).json({
    message: "User already registered. Please login."
  });
}
    const passwordHash = await bcrypt.hash(password, 12);
    const otpCode = makeOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({ name, email, phone, passwordHash, otpCode, otpExpiresAt });

    // Send OTP via email if email provided
    if (email) await sendEmailOTP(email, otpCode);

    res.status(201).json({
      message: 'Registered successfully. Check your email for OTP.',
      userId: user._id,
      // Only expose in dev — remove in production!
      otpForDemo: process.env.NODE_ENV !== 'production' ? otpCode : undefined,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { userId, otpCode } = req.body;
    console.log('VERIFY OTP REQUEST:', { userId, otpCode }); // 🔥 ADD THIS

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      console.log('INVALID USERID:', userId); // 🔥 ADD THIS
      return res.status(400).json({ message: 'Invalid or missing userId' });
    }

    const user = await User.findById(userId);
    console.log('USER FOUND:', user ? 'YES' : 'NO', user ? user._id : null); // 🔥 ADD THIS
    if (!user) return res.status(404).json({ message: 'User not found' });

    console.log('USER OTP CODE:', user.otpCode, 'INPUT OTP:', otpCode); // 🔥 ADD THIS
    if (user.otpCode !== otpCode)
      return res.status(400).json({ message: 'Invalid OTP' });

    console.log('OTP EXPIRES AT:', user.otpExpiresAt, 'NOW:', new Date()); // 🔥 ADD THIS
    if (user.otpExpiresAt < new Date())
      return res.status(400).json({ message: 'OTP expired. Register again.' });

    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    console.log('SAVING USER...'); // 🔥 ADD THIS
    await user.save();

    const token = jwt.sign(
      { id: user._id, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'OTP verified successfully!',
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
    });

  } catch (err) {
    console.error("VERIFY OTP ERROR:", err); // 🔥 ADD THIS
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;
    if (!emailOrPhone || !password)
      return res.status(400).json({ message: 'Email/phone and password required' });

    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    if (!user.isVerified)
      return res.status(403).json({ message: 'Account not verified. Please verify your OTP first.', userId: user._id });

    const token = jwt.sign({ id: user._id, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Already verified' });

    const otpCode = makeOTP();
    user.otpCode = otpCode;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    if (user.email) await sendEmailOTP(user.email, otpCode);

    res.json({
      message: 'OTP resent',
      otpForDemo: process.env.NODE_ENV !== 'production' ? otpCode : undefined,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash -otpCode -otpExpiresAt');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
