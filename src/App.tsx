import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Box, CssBaseline, Toolbar } from "@mui/material";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Customer from "./pages/Customer";
import Vendor from "./pages/Vendor";
import Driver from "./pages/Driver";
import Application from "./pages/Application";
import Order from "./pages/Order";
import ProtectedRoute from "./pages/ProtectedRoute";
import Login from "./pages/Login";

const App: React.FC = () => {
  return (
    <Router>
      <Box sx={{ display: "flex", minHeight: "100vh", minWidth: "100vw" }}>
        <CssBaseline />
        <Navbar />
        <Sidebar />
        <Box component="main"
          sx={{
            flexGrow: 1,
            height: "calc(100vh - 64px)",
            mt: "64px",
            pl: 3,
            pr: 3,
            overflowY: "auto",
          }}
        >
          <Toolbar />
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Home />} />
              <Route path="/customer" element={<Customer />} />
              <Route path="/vendor" element={<Vendor />} />
              <Route path="/driver" element={<Driver />} />
              <Route path="/application" element={<Application />} />
              <Route path="/order" element={<Order />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
};

export default App;
