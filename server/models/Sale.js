const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  cashierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    buyPrice: { type: Number, required: true },
    sellPrice: { type: Number, required: true },
    total: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['cash', 'card', 'mixed', 'debt'], 
    default: 'cash' 
  },
  isDebt: { type: Boolean, default: false },
  debtorInfo: {
    name: { type: String },
    phone: { type: String }
  },
  receiptNumber: { type: String, unique: true, required: true }
}, { timestamps: true });

saleSchema.index({ storeId: 1, createdAt: -1 });
saleSchema.index({ storeId: 1, receiptNumber: 1 });

module.exports = mongoose.model('Sale', saleSchema);
