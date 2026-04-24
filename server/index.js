require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cron = require('node-cron');
const connectDB = require('./config/db.js');
const { errorMiddleware, notFound } = require('./middleware/errorMiddleware');
const User = require('./models/User');
const Store = require('./models/Store');

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(helmet()); // Security
app.use(morgan('dev')); // Logging
app.use(compression()); // Compress responses
app.use(cors({
  origin: ['http://localhost:5173', 'https://infastpos.uz', 'https://www.infastpos.uz', /\.vercel\.app$/],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Routes (to be defined)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/store', require('./routes/storeRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/sales', require('./routes/saleRoutes'));
app.use('/api/subscription', require('./routes/subscriptionRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));

// Seed Super Admin
const seedSuperAdmin = async () => {
  const adminExists = await User.findOne({ role: 'super_admin' });
  if (!adminExists) {
    await User.create({
      name: 'Muhammadaziz Yakubov',
      username: 'Muhammadaziz',
      password: 'Azizbek0717',
      role: 'super_admin'
    });
    console.log('Super Admin seeded successfully');
  }
};
seedSuperAdmin();

// Daily Cron Job for Subscription Expiry
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily subscription check...');
  const now = new Date();
  await Store.updateMany(
    { subscriptionExpiry: { $lt: now }, subscriptionStatus: { $ne: 'expired' } },
    { subscriptionStatus: 'expired' }
  );
  console.log('Subscription check completed');
});

// Error Handling
app.use(notFound);
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
