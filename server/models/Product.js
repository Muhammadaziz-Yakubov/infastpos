const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  name: { type: String, required: true },
  barcode: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  buyPrice: { type: Number, required: true },
  sellPrice: { type: Number, required: true },
  quantity: { type: Number, default: 0 },
  unit: { 
    type: String, 
    enum: ['dona', 'kg', 'litr', 'metr', 'quti', 'pachka', 'juft', 'gramm'], 
    default: 'dona' 
  },
  lowStockAlert: { type: Number, default: 5 },
  image: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

productSchema.index({ storeId: 1 });
productSchema.index({ storeId: 1, barcode: 1 });
productSchema.index({ name: 'text' }); // Search by name optimization

module.exports = mongoose.model('Product', productSchema);
