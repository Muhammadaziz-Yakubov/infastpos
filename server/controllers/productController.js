const Product = require('../models/Product');

// @desc    Get all store products
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ storeId: req.user.storeId }).populate('category', 'name');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Mahsulotlarni olishda xatolik yuz berdi' });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private
const createProduct = async (req, res) => {
  try {
    const product = await Product.create({
      ...req.body,
      storeId: req.user.storeId
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Xatolik yuz berdi' });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = async (req, res) => {
  try {
    let product = await Product.findOne({ _id: req.params.id, storeId: req.user.storeId });
    if (!product) return res.status(404).json({ message: 'Mahsulot topilmadi' });

    product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Yangilashda xatolik yuz berdi' });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, storeId: req.user.storeId });
    if (!product) return res.status(404).json({ message: 'Mahsulot topilmadi' });

    await product.deleteOne();
    res.json({ message: 'Mahsulot o\'chirildi' });
  } catch (error) {
    res.status(500).json({ message: 'O\'chirishda xatolik yuz berdi' });
  }
};

// @desc    Delete multiple products
// @route   DELETE /api/products
// @access  Private
const deleteProducts = async (req, res) => {
  try {
    const { ids } = req.body;
    await Product.deleteMany({ _id: { $in: ids }, storeId: req.user.storeId });
    res.json({ message: 'Mahsulotlar o\'chirildi' });
  } catch (error) {
    res.status(500).json({ message: 'O\'chirishda xatolik yuz berdi' });
  }
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProducts
};
