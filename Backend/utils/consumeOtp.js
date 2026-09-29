const bcrypt = require('bcryptjs');
const User = require('../LocalGuidePannel/models/User');

// Reserve an attempt atomically before the expensive comparison. Successful
// consumption also compares the stored hash, so concurrent use or replacement
// of the code cannot authenticate a second request.
module.exports = async function consumeOtp(email, otp, purpose, changes = {}) {
  if (typeof email !== 'string' || email.length > 254 || !/^\d{6}$/.test(otp)) return null;
  const filter = { email, otpPurpose: purpose, otpExpires: { $gt: new Date() }, otpAttempts: { $lt: 5 },
    ...(purpose === 'verify' ? { isVerified: false } : {}) };
  const candidate = await User.findOneAndUpdate(filter, { $inc: { otpAttempts: 1 } }, { new: true })
    .select('+otp +otpExpires +otpAttempts +otpPurpose');
  if (!candidate?.otp || !await bcrypt.compare(otp, candidate.otp)) return null;
  return User.findOneAndUpdate({ _id: candidate._id, otp: candidate.otp, otpPurpose: purpose,
    otpExpires: { $gt: new Date() }, ...(purpose === 'verify' ? { isVerified: false } : {}) }, {
    $set: { ...changes, isVerified: true },
    $unset: { otp: 1, otpExpires: 1, otpPurpose: 1, otpAttempts: 1 },
  }, { new: true });
};
