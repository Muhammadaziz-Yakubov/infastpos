const express = require('express');
const router = express.Router();
const {
  getInventory,
  stockIn,
  stockOut
} = require('../controllers/inventoryController');
const { protect } = require('../middleware/auth');
const { checkSubscription } = require('../middleware/checkSubscription');

router.use(protect);
router.use(checkSubscription);

router.get('/', getInventory);
router.post('/in', stockIn);
router.post('/out', stockOut);

module.exports = router;
