// File: src/App.tsx
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Customer from './pages/Customer';
import Vendor from './pages/Vendor';
import Driver from './pages/Driver';
import Application from './pages/Application';
import Order from './pages/Order';
import OrderDetails from './pages/OrderDetails';
import ProtectedRoute from './pages/ProtectedRoute';
import Login from './pages/Login';
import MapStats from './pages/MapStats';
import UserDetails from './pages/UserDetails';
import CreateVoucher from './pages/CreateVoucher';
import Voucher from './pages/Voucher';
import VoucherUsage from './pages/VoucherUsage';
import Tip from './pages/Tip';
import ApplicationDetails from './pages/ApplicationDetails';

// Import laundry management pages
import Laundry from './pages/Laundry';
import LaundryServices from './pages/LaundryServices';
import LaundryServiceItems from './pages/LaundryServiceItems';
import LaundryServiceCategories from './pages/LaundryServiceCategories';
import Categories from './pages/Categories';
import EditLaundry from './pages/EditLaundry';
import Icons from './pages/Icons';
import AdminSettings from './pages/AdminSettings';
import Dashboard from './pages/Dashboard';
import Finance from './pages/Finance';

// Import custom orders management page
import CustomOrders from './pages/CustomOrders';

// NEW: Import the new order detail pages
import RegularOrderDetails from './pages/RegularOrderDetails';
import CustomOrderDetails from './pages/CustomOrderDetails';
import CustomerDetails from './pages/CustomerDetails';
import Withdrawals from './pages/Withdrawal';
import PreWithdrawal from './pages/PreWithdrawal';

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', minWidth: '100vw' }}>
      <CssBaseline />
      {!isAuthPage && <Navbar />}
      {!isAuthPage && <Sidebar />}
      <Box
        component='main'
        sx={{
          flexGrow: 1,
          height: 'calc(100vh - 64px)',
          mt: '64px',
          pl: 3,
          overflowY: 'auto',
        }}
      >
        <Toolbar />
        <Routes>
          <Route path='/login' element={<Login />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path='/' element={<Home />} />
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/finance' element={<Finance />} />
            <Route path='/customers' element={<Customer />} />
            <Route path='/customer/:customerId' element={<CustomerDetails />} />
            <Route path='/vendor/:pageNumber?' element={<Vendor />} />

            {/* Laundry Management Routes */}
            <Route path='/laundry' element={<Laundry />} />
            <Route path='/laundry/categories' element={<Categories />} />
            <Route path='/laundry/:laundryId/edit' element={<EditLaundry />} />
            <Route
              path='/laundry/:laundryId/services'
              element={<LaundryServices />}
            />
            <Route
              path='/laundry/:laundryId/service/:serviceId/categories'
              element={<LaundryServiceCategories />}
            />
            <Route
              path='/laundry/:laundryId/service/:serviceId/category/:categoryId/items'
              element={<LaundryServiceItems />}
            />

            {/* UPDATED: Order Management Routes */}
            {/* Regular orders page - shows only REGISTERED_LAUNDRY orders */}
            <Route
              path='/order/:pageNumber?/:orderStatus?'
              element={<Order />}
            />

            {/* Custom Orders Management Routes */}
            <Route path='/custom-orders' element={<CustomOrders />} />

            {/* NEW: Order Detail Routes */}
            {/* Regular order details - tracking only */}
            <Route
              path='/regular-order/:orderId'
              element={<RegularOrderDetails />}
            />

            {/* Custom order details - full management */}
            <Route
              path='/custom-order/:orderId'
              element={<CustomOrderDetails />}
            />

            {/* LEGACY: Keep existing order-details route for backward compatibility */}
            <Route
              path='/order-details/:orderId/:start?&end?'
              element={<OrderDetails />}
            />

            <Route path='/driver/:pageNumber?' element={<Driver />} />
            <Route path='/voucher/:pageNumber?' element={<Voucher />} />
            <Route path='/createVoucher' element={<CreateVoucher />} />
            <Route path='/voucherUsage/:voucherId' element={<VoucherUsage />} />
            <Route path='/application/:pageNumber?' element={<Application />} />
            <Route path='/user-details/:userId' element={<UserDetails />} />
            <Route path='/map-stats' element={<MapStats />} />
            <Route path='/tip/:pageNumber?' element={<Tip />} />
            <Route
              path='/application-details/:userId'
              element={<ApplicationDetails />}
            />
            <Route path='/icons' element={<Icons />} />
            <Route path='/admin-settings' element={<AdminSettings />} />
            <Route path='/withdrawals' element={<Withdrawals />} />
            <Route path='/pre-withdrawals' element={<PreWithdrawal />} />
          </Route>
        </Routes>
      </Box>
    </Box>
  );
};

export default App;
