const express = require('express');
const router = express.Router();
const {
  getStoreProfile,
  updateStoreProfile,
  getDashboardStats
} = require('../controllers/storeController');
const { getSettings } = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');
const { checkSubscription } = require('../middleware/checkSubscription');

router.use(protect);

router.get('/profile', getStoreProfile);
router.put('/profile', updateStoreProfile);
router.get('/dashboard-stats', checkSubscription, getDashboardStats);
router.get('/settings', getSettings);

module.exports = router;
