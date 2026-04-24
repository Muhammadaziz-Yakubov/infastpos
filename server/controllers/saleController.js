const Sale = require('../models/Sale');
const Product = require('../models/Product');

// @desc    Create new sale
// @route   POST /api/sales
// @access  Private
const createSale = async (req, res) => {
  const { items, totalAmount, discount, finalAmount, paymentMethod, isDebt, debtorInfo } = req.body;

  try {
    const receiptNumber = 'REC-' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 1000);

    const sale = await Sale.create({
      storeId: req.user.storeId,
      cashierId: req.user._id,
      items: items.map(item => ({
        ...item,
        buyPrice: item.buyPrice || 0
      })),
      totalAmount,
      discount,
      finalAmount,
      paymentMethod,
      isDebt: isDebt || false,
      debtorInfo: isDebt ? debtorInfo : undefined,
      receiptNumber
    });

    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { quantity: -item.quantity }
      });
    }

    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Sotuvni amalga oshirishda xatolik' });
  }
};

// @desc    Get all debtors
// @route   GET /api/sales/debtors
// @access  Private
const getDebtors = async (req, res) => {
  try {
    const sales = await Sale.find({ 
      storeId: req.user.storeId, 
      isDebt: true 
    }).sort({ createdAt: -1 });

    // Group sales by customer phone (unique identifier)
    const debtorMap = {};
    
    sales.forEach(sale => {
      const phone = sale.debtorInfo?.phone || 'unknown';
      if (!debtorMap[phone]) {
        debtorMap[phone] = {
          customerName: sale.debtorInfo?.name || 'Noma\'lum',
          customerPhone: phone,
          totalDebt: 0,
          salesCount: 0,
          sales: []
        };
      }
      debtorMap[phone].totalDebt += sale.finalAmount;
      debtorMap[phone].salesCount += 1;
      debtorMap[phone].sales.push(sale);
    });

    const debtors = Object.values(debtorMap);
    res.json(debtors);
  } catch (error) {
    res.status(500).json({ message: 'Qarzdorlar ro\'yxatini olishda xatolik' });
  }
};

// @desc    Get all store sales
// @route   GET /api/sales
// @access  Private
const getSales = async (req, res) => {
  try {
    const sales = await Sale.find({ storeId: req.user.storeId })
      .populate('cashierId', 'name')
      .sort({ createdAt: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: 'Sotuvlar tarixini olishda xatolik' });
  }
};

// @desc    Get sale by ID
// @route   GET /api/sales/:id
// @access  Private
const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findOne({ _id: req.params.id, storeId: req.user.storeId })
      .populate('cashierId', 'name')
      .populate('items.productId');
    
    if (!sale) return res.status(404).json({ message: 'Sotuv topilmadi' });
    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: 'Ma\'lumot olishda xatolik' });
  }
};

// @desc    Pay debt for a customer
// @route   POST /api/sales/debtors/:phone/pay
// @access  Private
const payDebt = async (req, res) => {
  try {
    const { phone } = req.params;
    
    // Update all debt sales for this customer in this store
    const result = await Sale.updateMany(
      { 
        storeId: req.user.storeId, 
        'debtorInfo.phone': phone,
        isDebt: true 
      },
      { 
        $set: { 
          isDebt: false,
          paymentMethod: 'cash' // Mark as paid via cash
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'To\'lanmagan qarzlar topilmadi' });
    }

    res.json({ message: 'Qarz muvaffaqiyatli yopildi', modifiedCount: result.nModified });
  } catch (error) {
    res.status(500).json({ message: 'Qarzni yopishda xatolik yuz berdi' });
  }
};

module.exports = {
  createSale,
  getDebtors,
  getSales,
  getSaleById,
  payDebt
};
