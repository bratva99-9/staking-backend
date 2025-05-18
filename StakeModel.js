const mongoose = require('mongoose');

const StakeSchema = new mongoose.Schema({
  user: String,
  asset_ids: [String],
  memo: String,
  tx: { type: String, unique: true },
  timestamp: Date
});

module.exports = mongoose.model('Stake', StakeSchema);
