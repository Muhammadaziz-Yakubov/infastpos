const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee
} = require('../controllers/employeeController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const { checkSubscription } = require('../middleware/checkSubscription');

router.use(protect);
router.use(checkSubscription);
router.use(authorize('store_owner', 'super_admin'));

router.get('/', getEmployees);
router.get('/:id', getEmployeeById);
router.post('/', createEmployee);
router.put('/:id', updateEmployee);

module.exports = router;
