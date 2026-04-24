const Category = require('../models/Category');

// @desc    Get all store categories
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ storeId: req.user.storeId });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Kategoriyalarni olishda xatolik' });
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res) => {
  try {
    const category = await Category.create({
      ...req.body,
      storeId: req.user.storeId
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Xatolik yuz berdi' });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = async (req, res) => {
  try {
    let category = await Category.findOne({ _id: req.params.id, storeId: req.user.storeId });
    if (!category) return res.status(404).json({ message: 'Kategoriya topilmadi' });

    category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Yangilashda xatolik' });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, storeId: req.user.storeId });
    if (!category) return res.status(404).json({ message: 'Kategoriya topilmadi' });

    await category.deleteOne();
    res.json({ message: 'Kategoriya o\'chirildi' });
  } catch (error) {
    res.status(500).json({ message: 'O\'chirishda xatolik' });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
