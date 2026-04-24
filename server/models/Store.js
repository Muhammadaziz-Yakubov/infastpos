const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: { type: String },
  address: { type: String },
  phone: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
  subscriptionStatus: { 
    type: String, 
    enum: ['active', 'expired', 'trial'], 
    default: 'trial' 
  },
  subscriptionExpiry: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Store', storeSchema);
