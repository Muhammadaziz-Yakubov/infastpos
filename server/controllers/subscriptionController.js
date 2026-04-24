const Store = require('../models/Store');
const Subscription = require('../models/Subscription');

// @desc    Get current subscription status
// @route   GET /api/subscription/status
// @access  Private
const getSubscriptionStatus = async (req, res) => {
  try {
    const store = await Store.findById(req.user.storeId).select('subscriptionStatus subscriptionExpiry');
    if (!store) return res.status(404).json({ message: 'Do\'kon topilmadi' });
    
    // Get last 5 subscription records
    const history = await Subscription.find({ storeId: req.user.storeId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      status: store.subscriptionStatus,
      expiry: store.subscriptionExpiry,
      history
    });
  } catch (error) {
    res.status(500).json({ message: 'Ma\'lumot olishda xatolik' });
  }
};

module.exports = {
  getSubscriptionStatus
};
