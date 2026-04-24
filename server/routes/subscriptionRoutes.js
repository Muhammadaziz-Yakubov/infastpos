const express = require('express');
const router = express.Router();
const { getSubscriptionStatus } = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

router.get('/status', protect, getSubscriptionStatus);

module.exports = router;
