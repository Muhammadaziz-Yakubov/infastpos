const express = require('express');
const router = express.Router();
const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProducts
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { checkSubscription } = require('../middleware/checkSubscription');

router.use(protect);
router.use(checkSubscription);

router.get('/', getProducts);
router.post('/', createProduct);
router.delete('/', deleteProducts);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
