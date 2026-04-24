const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  name: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
