const express = require('express');
const router = express.Router();
const {
  getStores,
  createStore,
  updateStore,
  deleteStore,
  activateSubscription,
  getStats,
  getSubscriptions
} = require('../controllers/adminController');
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.use(protect);
router.use(authorize('super_admin'));

router.get('/stores', getStores);
router.post('/stores', createStore);
router.put('/stores/:id', updateStore);
router.delete('/stores/:id', deleteStore);
router.post('/stores/:id/subscription', activateSubscription);
router.get('/subscriptions', getSubscriptions);
router.get('/stats', getStats);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

module.exports = router;
