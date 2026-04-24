const Product = require('../models/Product');

// @desc    Get inventory (products with stock info)
// @route   GET /api/inventory
// @access  Private
const getInventory = async (req, res) => {
  try {
    const products = await Product.find({ storeId: req.user.storeId })
      .select('name quantity lowStockAlert unit barcode')
      .populate('category', 'name');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Inventarni olishda xatolik' });
  }
};

// @desc    Stock In (add quantity)
// @route   POST /api/inventory/in
// @access  Private
const stockIn = async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    const product = await Product.findOne({ _id: productId, storeId: req.user.storeId });
    if (!product) return res.status(404).json({ message: 'Mahsulot topilmadi' });

    product.quantity += Number(quantity);
    await product.save();

    res.json({ message: 'Mahsulot miqdori oshirildi', quantity: product.quantity });
  } catch (error) {
    res.status(500).json({ message: 'Xatolik yuz berdi' });
  }
};

// @desc    Stock Out (reduce quantity manually)
// @route   POST /api/inventory/out
// @access  Private
const stockOut = async (req, res) => {
  const { productId, quantity, reason } = req.body;
  try {
    const product = await Product.findOne({ _id: productId, storeId: req.user.storeId });
    if (!product) return res.status(404).json({ message: 'Mahsulot topilmadi' });

    if (product.quantity < quantity) {
      return res.status(400).json({ message: 'Omborda yetarli mahsulot yo\'q' });
    }

    product.quantity -= Number(quantity);
    await product.save();

    res.json({ message: 'Mahsulot miqdori kamaytirildi', quantity: product.quantity });
  } catch (error) {
    res.status(500).json({ message: 'Xatolik yuz berdi' });
  }
};

module.exports = {
  getInventory,
  stockIn,
  stockOut
};
