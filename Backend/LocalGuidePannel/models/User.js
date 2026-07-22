const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['user', 'local guide'],
      required: true,
    },
    // Profile fields (editable from the user Profile page)
    name: { type: String, trim: true, default: '' },
    phone: { type: String, default: '' },
    city: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 300 },
    avatar: { type: String, default: '' },
    interests: { type: [String], default: [] },
    // Per-user saved tourist-spot ids (Phase 4)
    savedSpots: { type: [String], default: [] },
    // Email OTP verification
    isVerified: { type: Boolean, default: false },
    otp: { type: String, select: false },
    otpExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

// Hash password before saving to the database
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to check if the entered password matches the hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;

