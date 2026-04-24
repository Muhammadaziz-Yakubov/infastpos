const express = require('express');
const router = express.Router();
const {
  createSale,
  getDebtors,
  getSales,
  getSaleById,
  payDebt
} = require('../controllers/saleController');
const { protect } = require('../middleware/auth');
const { checkSubscription } = require('../middleware/checkSubscription');

router.use(protect);
router.use(checkSubscription);

router.post('/', createSale);
router.get('/', getSales);
router.get('/debtors', getDebtors);
router.post('/debtors/:phone/pay', payDebt);
router.get('/:id', getSaleById);

module.exports = router;
