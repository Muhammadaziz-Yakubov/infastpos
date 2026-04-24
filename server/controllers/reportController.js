const Sale = require('../models/Sale');

// @desc    Get sales reports
// @route   GET /api/reports
// @access  Private
const getReports = async (req, res) => {
  const { period, from, to } = req.query;
  const storeId = req.user.storeId;

  let startDate = new Date();
  let endDate = new Date();

  if (from && to) {
    startDate = new Date(from);
    endDate = new Date(to);
    endDate.setHours(23, 59, 59, 999);
  } else {
    switch (period) {
      case 'daily':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      default:
        startDate.setHours(0, 0, 0, 0);
    }
  }

  try {
    const sales = await Sale.find({
      storeId,
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // Calculate totals
    let totalRevenue = 0;
    let totalProfit = 0;
    const productStats = {};

    sales.forEach(sale => {
      totalRevenue += sale.finalAmount;
      sale.items.forEach(item => {
        const profitPerItem = (item.sellPrice - item.buyPrice) * item.quantity;
        totalProfit += profitPerItem;

        if (productStats[item.name]) {
          productStats[item.name].qty += item.quantity;
          productStats[item.name].revenue += item.total;
          productStats[item.name].profit += profitPerItem;
        } else {
          productStats[item.name] = {
            qty: item.quantity,
            revenue: item.total,
            profit: profitPerItem
          };
        }
      });
    });

    // Convert productStats to array
    const productStatsArray = Object.keys(productStats).map(name => ({
      name,
      ...productStats[name]
    })).sort((a, b) => b.revenue - a.revenue);

    res.json({
      summary: {
        totalRevenue,
        totalProfit,
        saleCount: sales.length
      },
      productStats: productStatsArray,
      sales // optionally send raw sales if needed
    });
  } catch (error) {
    res.status(500).json({ message: 'Hisobotni tayyorlashda xatolik' });
  }
};

module.exports = {
  getReports
};
