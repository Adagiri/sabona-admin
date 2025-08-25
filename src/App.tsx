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

// Import new laundry management pages
import Laundry from './pages/Laundry';
import LaundryServices from './pages/LaundryServices';
import LaundryServiceItems from './pages/LaundryServiceItems';
import Categories from './pages/Categories';
import EditLaundry from './pages/EditLaundry';
import Icons from './pages/Icons';

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
            <Route path='/customer/:pageNumber?' element={<Customer />} />
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
              path='/laundry/:laundryId/service/:serviceId/items'
              element={<LaundryServiceItems />}
            />

            <Route path='/driver/:pageNumber?' element={<Driver />} />
            <Route path='/voucher/:pageNumber?' element={<Voucher />} />
            <Route path='/createVoucher' element={<CreateVoucher />} />
            <Route path='/voucherUsage/:voucherId' element={<VoucherUsage />} />
            <Route path='/application/:pageNumber?' element={<Application />} />
            <Route
              path='/order/:pageNumber?/:orderStatus?'
              element={<Order />}
            />
            <Route
              path='/order-details/:orderId/:start?&end?'
              element={<OrderDetails />}
            />
            <Route path='/user-details/:userId' element={<UserDetails />} />
            <Route path='/map-stats' element={<MapStats />} />
            <Route path='/tip/:pageNumber?' element={<Tip />} />
            <Route
              path='/application-details/:userId'
              element={<ApplicationDetails />}
            />
            <Route path='/laundry/icons' element={<Icons />} />
          </Route>
        </Routes>
      </Box>
    </Box>
  );
};

export default App;
