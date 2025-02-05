import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Box, CssBaseline, Toolbar } from "@mui/material";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Customer from "./pages/Customer";
import Vendor from "./pages/Vendor";
import Driver from "./pages/Driver";
import Application from "./pages/Application";
import Order from "./pages/Order";
import OrderDetails from "./pages/OrderDetails";
import ProtectedRoute from "./pages/ProtectedRoute";
import Login from "./pages/Login";
import MapStats from "./pages/MapStats";
import UserDetails from "./pages/UserDetails";
import CreateVoucher from "./pages/CreateVoucher";
import Voucher from "./pages/Voucher";
import VoucherUsage from "./pages/VoucherUsage";
import Tip from "./pages/Tip";

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login";

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", minWidth: "100vw" }}>
      <CssBaseline />
      {!isAuthPage && <Navbar />}
      {!isAuthPage && <Sidebar />}
      <Box component="main" sx={{ flexGrow: 1, height: "calc(100vh - 64px)", mt: "64px", pl: 3, overflowY: "auto" }}>
        <Toolbar />
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/customer/:pageNumber?" element={<Customer />} />
            <Route path="/vendor/:pageNumber?" element={<Vendor />} />
            <Route path="/driver/:pageNumber?" element={<Driver />} />
            <Route path="/voucher/:pageNumber?" element={<Voucher />} />
            <Route path="/createVoucher" element={<CreateVoucher />} />
            <Route path="/voucherUsage/:voucherId" element={<VoucherUsage />} />
            <Route path="/application/:pageNumber?" element={<Application />} />
            <Route path="/order/:pageNumber?/:orderStatus?" element={<Order />} />
            <Route path="/order-details/:orderId/:start?&end?" element={<OrderDetails />} />
            <Route path="/user-details/:userId" element={<UserDetails />} />
            <Route path="/map-stats" element={<MapStats />} />
            <Route path="/tip/:pageNumber?" element={<Tip />} />
          </Route>
          {/* Default Redirect to Login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default App;
