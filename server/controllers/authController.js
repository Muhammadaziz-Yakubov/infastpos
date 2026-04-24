const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username }).populate('storeId', 'name phone');

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        storeId: user.storeId?._id,
        storeName: user.storeId?.name,
        storePhone: user.storeId?.phone,
        isActive: user.isActive,
        token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: '7d',
        }),
      });
    } else {
      res.status(401).json({ message: 'Login yoki parol noto\'g\'ri' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Serverda xatolik yuz berdi' });
  }
};

const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password').populate('storeId', 'name phone');
  if (user) {
    res.json({
      ...user._doc,
      storeName: user.storeId?.name,
      storePhone: user.storeId?.phone,
      storeId: user.storeId?._id
    });
  } else {
    res.status(404).json({ message: 'Foydalanuvchi topilmadi' });
  }
};

module.exports = {
  login,
  getMe,
};
