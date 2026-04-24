const User = require('../models/User');

// @desc    Get all store employees
// @route   GET /api/employees
// @access  Private (Store Owner)
const getEmployees = async (req, res) => {
  try {
    const employees = await User.find({ storeId: req.user.storeId }).select('-password');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Xodimlarni olishda xatolik' });
  }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private (Store Owner)
const getEmployeeById = async (req, res) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role !== 'super_admin') {
      if (!req.user.storeId) return res.status(400).json({ message: 'Do\'kon ID si topilmadi' });
      query.storeId = req.user.storeId;
    }
    const employee = await User.findOne(query).select('-password');
    if (!employee) return res.status(404).json({ message: 'Xodim topilmadi' });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Xodimni olishda xatolik' });
  }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private (Store Owner)
const createEmployee = async (req, res) => {
  const { name, username, password, role } = req.body;

  try {
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'Bunday loginli xodim mavjud' });
    }

    const employee = await User.create({
      name,
      username,
      password,
      role: role || 'cashier',
      storeId: req.user.storeId
    });

    res.status(201).json({
      _id: employee._id,
      name: employee.name,
      username: employee.username,
      role: employee.role
    });
  } catch (error) {
    res.status(500).json({ message: 'Xodim yaratishda xatolik' });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private (Store Owner)
const updateEmployee = async (req, res) => {
  try {
    const storeId = req.user.storeId;
    if (!storeId && req.user.role !== 'super_admin') {
      return res.status(400).json({ message: 'Do\'kon ID si topilmadi' });
    }

    const query = { _id: req.params.id };
    if (req.user.role !== 'super_admin') {
      query.storeId = storeId;
    }

    let employee = await User.findOne(query);
    if (!employee) return res.status(404).json({ message: 'Xodim topilmadi' });

    const { name, username, role, isActive, password } = req.body;
    
    if (name) employee.name = name;
    if (username) {
      const existing = await User.findOne({ username, _id: { $ne: employee._id } });
      if (existing) return res.status(400).json({ message: 'Bu login allaqachon band' });
      employee.username = username;
    }
    
    if (isActive !== undefined) employee.isActive = isActive;
    if (role && role !== 'super_admin') employee.role = role;
    if (password) employee.password = password;

    await employee.save();
    res.json({ message: 'Xodim ma\'lumotlari yangilandi' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Yangilashda xatolik' });
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee
};
