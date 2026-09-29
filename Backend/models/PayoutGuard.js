const mongoose = require('mongoose');
// A durable per-recipient write serializes balance checks within Mongo transactions.
module.exports = mongoose.model('PayoutGuard', new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId, revision: { type: Number, default: 0 },
}));
