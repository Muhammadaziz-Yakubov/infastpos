import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/auth/Login';
import Blocked from './pages/auth/Blocked';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/shared/ProtectedRoute';

// Admin Pages
// const AdminDashboard = () => <div>Admin Dashboard</div>; // Placeholder
// const AdminStores = () => <div>Admin Stores</div>;
// const AdminSubscriptions = () => <div>Admin Subscriptions</div>;

// Store Pages
// const StoreDashboard = () => <div>Store Dashboard</div>;
// const StoreProducts = () => <div>Products</div>;
// const StoreInventory = () => <div>Inventory</div>;
// const StoreReports = () => <div>Reports</div>;
// const StoreAccount = () => <div>Account</div>;
// const StoreEmployees = () => <div>Employees</div>;

// Cashier Pages
// const CashierPOS = () => <div>POS</div>;
// const CashierHistory = () => <div>Sales History</div>;

import POS from './pages/cashier/POS';
import StoreAccount from './pages/store/StoreAccount';
import Products from './pages/store/Products';
import AdminStores from './pages/super-admin/AdminStores';
import AdminDashboard from './pages/super-admin/Dashboard';
import AdminSubscriptions from './pages/super-admin/Subscriptions';
import AdminSettings from './pages/super-admin/Settings';
import SalesHistory from './pages/shared/SalesHistory';
import Dashboard from './pages/store/Dashboard';
import Employees from './pages/store/Employees';
import Inventory from './pages/store/Inventory';
import Reports from './pages/store/Reports';
import PublicReceipt from './pages/public/PublicReceipt';
import Debtors from './pages/shared/Debtors';

import { useEffect } from 'react';
import useAuthStore from './store/authStore';

const App = () => {
  const { checkAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      checkAuth();
    }
  }, []);

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/receipt/:id" element={<PublicReceipt />} />
        <Route path="/blocked" element={<ProtectedRoute><Blocked /></ProtectedRoute>} />
        
        {/* Super Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['super_admin']}><Layout /></ProtectedRoute>}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/stores" element={<AdminStores />} />
          <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>

        {/* Store Management Routes (Shared) */}
        <Route element={<ProtectedRoute allowedRoles={['store_owner', 'cashier']}><Layout /></ProtectedRoute>}>
          <Route path="/store/products" element={<Products />} />
          <Route path="/store/inventory" element={<Inventory />} />
          <Route path="/store/debtors" element={<Debtors />} />
        </Route>

        {/* Store Owner Only Routes */}
        <Route element={<ProtectedRoute allowedRoles={['store_owner']}><Layout /></ProtectedRoute>}>
          <Route path="/store/dashboard" element={<Dashboard />} />
          <Route path="/store/employees" element={<Employees />} />
          <Route path="/store/reports" element={<Reports />} />
          <Route path="/store/account" element={<StoreAccount />} />
          <Route path="/store/sales" element={<SalesHistory />} />
        </Route>

        {/* Cashier Routes */}
        <Route element={<ProtectedRoute allowedRoles={['cashier', 'store_owner']}><Layout /></ProtectedRoute>}>
          <Route path="/cashier/pos" element={<POS />} />
          <Route path="/cashier/sales-history" element={<SalesHistory />} />
        </Route>

        {/* Redirect Root to correct dashboard */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
