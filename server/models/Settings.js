const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  monthlyPrice: { type: Number, default: 200000 },
  threeMonthPrice: { type: Number, default: 550000 },
  trialDays: { type: Number, default: 7 }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
