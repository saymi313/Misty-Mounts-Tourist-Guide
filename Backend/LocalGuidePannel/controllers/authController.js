const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendOtpEmail } = require('../../utils/mailer');

const signToken = (user) =>
  jwt.sign({ id: user._id, type: user.type }, process.env.JWT_SECRET, { expiresIn: '30d' });

const genOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const publicAuthUser = (u) => ({
  type: u.type,
  name: u.name || u.username,
  email: u.email,
  avatar: u.avatar || '',
});

// Generate, store (hashed) and email a fresh OTP. Email failure is logged, not fatal.
const setAndSendOtp = async (user) => {
  const otp = genOtp();
  user.otp = await bcrypt.hash(otp, 10);
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await user.save();
  try {
    await sendOtpEmail(user.email, user.name || user.username, otp);
  } catch (e) {
    console.error(`OTP email to ${user.email} failed: ${e.message} — dev OTP: ${otp}`);
  }
};

// POST /api/user/auth/signup
const signup = async (req, res) => {
  const { email, username, password, type, name } = req.body;
  try {
    if (!email || !username || !password || !type) {
      return res.status(400).json({ message: 'email, username, password and type are required' });
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      // Allow an unverified account (same email) to receive a fresh code.
      if (!existing.isVerified && existing.email === email) {
        await setAndSendOtp(existing);
        return res.status(200).json({ needsVerification: true, email: existing.email, message: 'Verification code sent' });
      }
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = new User({ email, username, password, type, name: name || username, isVerified: false });
    await newUser.save(); // hashes password via pre-save hook
    await setAndSendOtp(newUser);

    res.status(201).json({ needsVerification: true, email: newUser.email, message: 'Verification code sent to your email' });
  } catch (error) {
    console.error('signup error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/user/auth/verify-otp
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    if (!email || !otp) return res.status(400).json({ message: 'email and otp are required' });

    const user = await User.findOne({ email }).select('+otp +otpExpires');
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) {
      return res.status(200).json({ message: 'Already verified', token: signToken(user), ...publicAuthUser(user) });
    }
    if (!user.otp || !user.otpExpires || user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'Your code has expired. Please request a new one.' });
    }
    const ok = await bcrypt.compare(String(otp), user.otp);
    if (!ok) return res.status(400).json({ message: 'Invalid code. Please try again.' });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified', token: signToken(user), ...publicAuthUser(user) });
  } catch (error) {
    console.error('verifyOtp error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/user/auth/resend-otp
const resendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) return res.status(400).json({ message: 'email is required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Already verified' });
    await setAndSendOtp(user);
    res.status(200).json({ message: 'Verification code resent', email });
  } catch (error) {
    console.error('resendOtp error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/user/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) return res.status(400).json({ message: 'Invalid credentials' });

    if (!user.isVerified) {
      await setAndSendOtp(user);
      return res.status(403).json({
        needsVerification: true,
        email: user.email,
        message: 'Please verify your email — a new code has been sent.',
      });
    }

    res.status(200).json({ message: 'Login successful', token: signToken(user), ...publicAuthUser(user) });
  } catch (error) {
    console.error('login error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { signup, login, verifyOtp, resendOtp };
