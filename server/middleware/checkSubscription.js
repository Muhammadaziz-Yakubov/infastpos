const Store = require('../models/Store');
const { differenceInDays } = require('date-fns');

const checkSubscription = async (req, res, next) => {
  // Super admins are not tied to a store and don't need subscription check
  if (req.user.role === 'super_admin') {
    return next();
  }

  const storeId = req.user.storeId;
  if (!storeId) {
    return res.status(400).json({ message: 'Store ID not found for this user' });
  }

  const store = await Store.findById(storeId);
  if (!store) {
    return res.status(404).json({ message: 'Store not found' });
  }

  const now = new Date();
  const expiry = new Date(store.subscriptionExpiry);

  if (store.subscriptionStatus === 'expired' || expiry < now) {
    // Only allow access to store account page for expired stores
    if (req.path === '/store/account' || req.path === '/api/store/profile' || req.path === '/api/subscription/status') {
      return next();
    }
    return res.status(402).json({ 
      message: 'Subscription expired. Please renew to continue using the service.',
      status: 'expired'
    });
  }

  // Warning if less than 3 days left
  const daysLeft = differenceInDays(expiry, now);
  if (daysLeft >= 0 && daysLeft <= 3) {
    res.setHeader('X-Subscription-Warning', `Subscription expires in ${daysLeft} days`);
  }

  next();
};

module.exports = { checkSubscription };
