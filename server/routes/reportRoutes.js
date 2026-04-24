const express = require('express');
const router = express.Router();
const { getReports } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { checkSubscription } = require('../middleware/checkSubscription');

router.get('/', protect, checkSubscription, getReports);

module.exports = router;
