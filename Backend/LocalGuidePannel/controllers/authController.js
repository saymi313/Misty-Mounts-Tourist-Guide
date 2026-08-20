const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendOtpEmail } = require('../../utils/mailer');
const { createNotification } = require('../../UserBackend/controllers/notificationController');
const { getReferralConfig } = require('../../AdminBackend/controllers/settingsController');

const OTP_MAX_ATTEMPTS = 5; // lock the code after this many wrong guesses
// Coerce request values to plain strings so a JSON object like {"$gt":""} can
// never reach a Mongo query as an operator (defence-in-depth beside mongo-sanitize).
const str = (v) => (typeof v === "string" ? v : "");

// Generate a unique referral code (MM + 6 chars).
const genReferralCode = async () => {
  for (let i = 0; i < 6; i++) {
    const code = 'MM' + Math.random().toString(36).slice(2, 8).toUpperCase();
    if (!(await User.exists({ referralCode: code }))) return code;
  }
  return 'MM' + Date.now().toString(36).toUpperCase();
};

const signToken = (user) =>
  jwt.sign({ id: user._id, type: user.type }, process.env.JWT_SECRET, { expiresIn: '30d' });

const genOtp = () => String(crypto.randomInt(100000, 1000000)); // CSPRNG 6-digit

const publicAuthUser = (u) => ({
  type: u.type,
  name: u.name || u.username,
  email: u.email,
  avatar: u.avatar || '',
  agencyName: u.agencyName || '',
  isApproved: u.isApproved !== false,
});

// Generate, store (hashed) and email a fresh OTP. Email failure is logged, not fatal.
const setAndSendOtp = async (user, purpose = "verify") => {
  const otp = genOtp();
  user.otp = await bcrypt.hash(otp, 10);
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  user.otpAttempts = 0; // reset the brute-force counter for the new code
  await user.save();
  try {
    await sendOtpEmail(user.email, user.name || user.username, otp, purpose);
  } catch (e) {
    console.error(`OTP email to ${user.email} failed: ${e.message} — dev OTP: ${otp}`);
  }
};

// POST /api/user/auth/signup
const signup = async (req, res) => {
  const email = str(req.body.email).trim().toLowerCase();
  const username = str(req.body.username).trim();
  const password = str(req.body.password);
  const { type, name, ref } = req.body;
  try {
    if (!email || !username || !password || !type) {
      return res.status(400).json({ message: 'email, username, password and type are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
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

    // Travel agencies must be vetted by an admin before their tours go public.
    const isApproved = type !== 'travel agency';
    const referralCode = await genReferralCode();
    const referredBy = (ref || '').trim().toUpperCase();
    const newUser = new User({
      email, username, password, type, name: name || username, isVerified: false, isApproved,
      referralCode, referredBy,
    });
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
  const email = str(req.body.email).trim().toLowerCase();
  const otp = str(req.body.otp);
  try {
    if (!email || !otp) return res.status(400).json({ message: 'email and otp are required' });

    const user = await User.findOne({ email }).select('+otp +otpExpires +otpAttempts');
    if (!user) return res.status(400).json({ message: 'Invalid code. Please try again.' });
    if (user.isVerified) {
      return res.status(200).json({ message: 'Already verified', token: signToken(user), ...publicAuthUser(user) });
    }
    if (!user.otp || !user.otpExpires || user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'Your code has expired. Please request a new one.' });
    }
    if ((user.otpAttempts || 0) >= OTP_MAX_ATTEMPTS) {
      user.otp = undefined; user.otpExpires = undefined; await user.save();
      return res.status(429).json({ message: 'Too many incorrect codes. Please request a new one.' });
    }
    const ok = await bcrypt.compare(otp, user.otp);
    if (!ok) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save();
      return res.status(400).json({ message: 'Invalid code. Please try again.' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    if (!user.referralCode) user.referralCode = await genReferralCode();
    await user.save();

    // Two-sided referral: reward the referrer AND give the new joiner welcome
    // credit, once, when their invite completes verification. Amounts + on/off
    // are admin-configurable (Settings). Credit is discount-only.
    if (user.referredBy) {
      const { enabled, reward, welcome } = await getReferralConfig();
      const referrer = enabled ? await User.findOne({ referralCode: user.referredBy }) : null;
      if (referrer && String(referrer._id) !== String(user._id)) {
        if (reward > 0) {
          referrer.referralCount = (referrer.referralCount || 0) + 1;
          referrer.referralCredits = (referrer.referralCredits || 0) + reward;
          await referrer.save();
          createNotification(referrer._id, {
            type: "system",
            title: "You earned referral credit",
            body: `${user.name || "A friend"} joined with your invite. You've earned PKR ${reward} in travel credit.`,
            link: "/profile",
          });
        }
        if (welcome > 0) {
          user.referralCredits = (user.referralCredits || 0) + welcome;
          await user.save();
          createNotification(user._id, {
            type: "system",
            title: `Welcome — here's PKR ${welcome} credit`,
            body: `You joined with a friend's invite, so we've added PKR ${welcome} in travel credit. It applies automatically at checkout.`,
            link: "/profile",
          });
        }
      }
    }

    res.status(200).json({ message: 'Email verified', token: signToken(user), ...publicAuthUser(user) });
  } catch (error) {
    console.error('verifyOtp error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/user/auth/resend-otp
const resendOtp = async (req, res) => {
  const email = str(req.body.email).trim().toLowerCase();
  try {
    if (!email) return res.status(400).json({ message: 'email is required' });
    const user = await User.findOne({ email });
    // Respond the same whether or not the account exists (no enumeration).
    if (user && !user.isVerified) await setAndSendOtp(user);
    res.status(200).json({ message: 'If an unverified account exists, a code has been sent.', email });
  } catch (error) {
    console.error('resendOtp error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/user/auth/login
const login = async (req, res) => {
  const email = str(req.body.email).trim().toLowerCase();
  const password = str(req.body.password);
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

// POST /api/user/auth/forgot-password
const forgotPassword = async (req, res) => {
  const email = str(req.body.email).trim().toLowerCase();
  try {
    if (!email) return res.status(400).json({ message: "email is required" });
    const user = await User.findOne({ email });
    // Send a reset code only if the account exists, but respond the same either
    // way so we don't leak which emails are registered.
    if (user) await setAndSendOtp(user, "reset");
    res.status(200).json({ message: "If an account exists, a reset code has been sent.", email });
  } catch (error) {
    console.error("forgotPassword error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/user/auth/reset-password
const resetPassword = async (req, res) => {
  const email = str(req.body.email).trim().toLowerCase();
  const otp = str(req.body.otp);
  const password = str(req.body.password);
  try {
    if (!email || !otp || !password) {
      return res.status(400).json({ message: "email, otp and password are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }
    const user = await User.findOne({ email }).select("+otp +otpExpires +otpAttempts");
    // Generic response (no account enumeration) for missing/expired codes.
    if (!user || !user.otp || !user.otpExpires || user.otpExpires < new Date()) {
      return res.status(400).json({ message: "Invalid or expired code." });
    }
    if ((user.otpAttempts || 0) >= OTP_MAX_ATTEMPTS) {
      user.otp = undefined; user.otpExpires = undefined; await user.save();
      return res.status(429).json({ message: "Too many incorrect codes. Please request a new one." });
    }
    const ok = await bcrypt.compare(otp, user.otp);
    if (!ok) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save();
      return res.status(400).json({ message: "Invalid or expired code." });
    }

    user.password = password; // hashed by the pre-save hook
    user.otp = undefined;
    user.otpExpires = undefined;
    user.isVerified = true; // a successful reset also confirms the email
    await user.save();

    res.status(200).json({ message: "Password reset", token: signToken(user), ...publicAuthUser(user) });
  } catch (error) {
    console.error("resetPassword error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { signup, login, verifyOtp, resendOtp, forgotPassword, resetPassword };
