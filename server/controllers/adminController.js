const Store = require('../models/Store');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Settings = require('../models/Settings');

// @desc    Get all stores
// @route   GET /api/admin/stores
// @access  Private/Admin
const getStores = async (req, res) => {
  try {
    const stores = await Store.find().populate('owner', 'name username');
    res.json(stores);
  } catch (error) {
    res.status(500).json({ message: 'Do\'konlarni olishda xatolik yuz berdi' });
  }
};

// @desc    Create store and owner
// @route   POST /api/admin/stores
// @access  Private/Admin
const createStore = async (req, res) => {
  const { name, ownerName, username, password, phone, address, logo } = req.body;

  try {
    // 1. Check if user already exists
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'Bunday loginli foydalanuvchi mavjud' });
    }

    // 2. Get settings for trial period
    const settingsDoc = await Settings.findOne();
    const trialDays = settingsDoc?.trialDays || 7;

    // 3. Create Store (initially trial)
    const store = await Store.create({
      name,
      address,
      phone,
      logo,
      subscriptionStatus: 'trial',
      subscriptionExpiry: new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000)
    });

    // 3. Create User (store_owner)
    const user = await User.create({
      name: ownerName,
      username,
      password,
      role: 'store_owner',
      storeId: store._id
    });

    // 4. Update Store with owner reference
    store.owner = user._id;
    await store.save();

    res.status(201).json({
      message: 'Do\'kon va egasi muvaffaqiyatli yaratildi',
      store,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Xatolik yuz berdi' });
  }
};

// @desc    Update store
// @route   PUT /api/admin/stores/:id
// @access  Private/Admin
const updateStore = async (req, res) => {
  const { name, ownerName, username, password, phone, address, logo } = req.body;
  try {
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ message: 'Do\'kon topilmadi' });

    // Update Store details
    store.name = name || store.name;
    store.address = address || store.address;
    store.phone = phone || store.phone;
    store.logo = logo || store.logo;
    await store.save();

    // Update Owner details
    if (store.owner) {
      const owner = await User.findById(store.owner);
      if (owner) {
        owner.name = ownerName || owner.name;
        owner.username = username || owner.username;
        owner.phone = phone || owner.phone;
        if (password) owner.password = password;
        await owner.save();
      }
    }

    res.json({ message: 'Do\'kon ma\'lumotlari yangilandi', store });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Yangilashda xatolik yuz berdi' });
  }
};

// @desc    Delete store
// @route   DELETE /api/admin/stores/:id
// @access  Private/Admin
const deleteStore = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ message: 'Do\'kon topilmadi' });

    // Delete associated users
    await User.deleteMany({ storeId: store._id });
    await store.deleteOne();

    res.json({ message: 'Do\'kon va uning foydalanuvchilari o\'chirildi' });
  } catch (error) {
    res.status(500).json({ message: 'O\'chirishda xatolik yuz berdi' });
  }
};

// @desc    Activate/Extend subscription
// @route   POST /api/admin/stores/:id/subscription
// @access  Private/Admin
const activateSubscription = async (req, res) => {
  const { plan } = req.body; // 'monthly' or 'quarterly'
  const storeId = req.params.id;

  const settingsDoc = await Settings.findOne();
  
  const prices = {
    monthly: settingsDoc?.monthlyPrice || 200000,
    quarterly: settingsDoc?.threeMonthPrice || 550000
  };

  const days = {
    monthly: 30,
    quarterly: 90
  };

  try {
    const store = await Store.findById(storeId);
    if (!store) return res.status(404).json({ message: 'Do\'kon topilmadi' });

    const startDate = new Date();
    // If current subscription is still active, extend from expiry, else from now
    const baseDate = (store.subscriptionExpiry && store.subscriptionExpiry > startDate) 
      ? new Date(store.subscriptionExpiry) 
      : startDate;
    
    const endDate = new Date(baseDate.getTime() + days[plan] * 24 * 60 * 60 * 1000);

    const subscription = await Subscription.create({
      storeId,
      plan,
      price: prices[plan],
      startDate: baseDate,
      endDate,
      status: 'active',
      activatedBy: req.user._id
    });

    store.subscriptionStatus = 'active';
    store.subscriptionExpiry = endDate;
    await store.save();

    res.status(201).json({ message: 'Obuna faollashtirildi', subscription, store });
  } catch (error) {
    res.status(500).json({ message: 'Obunani faollashtirishda xatolik yuz berdi' });
  }
};

// @desc    Get admin stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
  try {
    const totalStores = await Store.countDocuments();
    const activeStores = await Store.countDocuments({ subscriptionStatus: 'active' });
    const expiredStores = await Store.countDocuments({ subscriptionStatus: 'expired' });
    
    // Recent stores
    const recentStores = await Store.find()
      .populate('owner', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Total revenue from all subscriptions
    const subscriptions = await Subscription.find();
    const totalRevenue = subscriptions.reduce((acc, curr) => acc + curr.price, 0);

    // Growth Data (last 7 months)
    const growthData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
      const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      
      const count = await Store.countDocuments({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      });
      
      growthData.push({
        month: startOfMonth.toLocaleString('default', { month: 'short' }),
        count
      });
    }

    res.json({
      totalStores,
      activeStores,
      expiredStores,
      totalRevenue,
      recentStores,
      growthData
    });
  } catch (error) {
    res.status(500).json({ message: 'Statistikani olishda xatolik yuz berdi' });
  }
};

// @desc    Get all subscriptions
// @route   GET /api/admin/subscriptions
// @access  Private/Admin
const getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find()
      .populate('storeId', 'name')
      .sort({ createdAt: -1 });
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: 'Obunalarni olishda xatolik yuz berdi' });
  }
};

module.exports = {
  getStores,
  createStore,
  updateStore,
  deleteStore,
  activateSubscription,
  getStats,
  getSubscriptions
};
