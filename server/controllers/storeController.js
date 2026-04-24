const Store = require('../models/Store');
const Product = require('../models/Product');
const Sale = require('../models/Sale');

// @desc    Get store profile
// @route   GET /api/store/profile
// @access  Private
const getStoreProfile = async (req, res) => {
  try {
    const store = await Store.findById(req.user.storeId).populate('owner', 'name username');
    if (!store) return res.status(404).json({ message: 'Do\'kon topilmadi' });
    res.json(store);
  } catch (error) {
    res.status(500).json({ message: 'Profilni olishda xatolik' });
  }
};

// @desc    Update store profile
// @route   PUT /api/store/profile
// @access  Private
const updateStoreProfile = async (req, res) => {
  try {
    const store = await Store.findByIdAndUpdate(req.user.storeId, req.body, { new: true });
    res.json(store);
  } catch (error) {
    res.status(500).json({ message: 'Yangilashda xatolik' });
  }
};

// @desc    Get store dashboard stats
// @route   GET /api/store/dashboard-stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const storeId = req.user.storeId;
    
    // Today's start and end
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const salesToday = await Sale.find({
      storeId,
      createdAt: { $gte: today }
    });

    const totalRevenueToday = salesToday.reduce((acc, curr) => acc + curr.finalAmount, 0);
    const totalSalesToday = salesToday.length;

    const totalProducts = await Product.countDocuments({ storeId });
    const lowStockProducts = await Product.countDocuments({
      storeId,
      $expr: { $lte: ['$quantity', '$lowStockAlert'] }
    });

    res.json({
      totalRevenueToday,
      totalSalesToday,
      totalProducts,
      lowStockProducts
    });
  } catch (error) {
    res.status(500).json({ message: 'Statistikani olishda xatolik' });
  }
};

module.exports = {
  getStoreProfile,
  updateStoreProfile,
  getDashboardStats
};
