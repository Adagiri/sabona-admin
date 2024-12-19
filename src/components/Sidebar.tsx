import React from "react";
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar } from "@mui/material";
import { Home, People, Business, LocalShipping, Apps, Inventory } from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  { text: "Home", icon: <Home />, route: "/" },
  { text: "Order", icon: <Inventory />, route: "/order" },
  { text: "Customer", icon: <People />, route: "/customer" },
  { text: "Vendor", icon: <Business />, route: "/vendor" },
  { text: "Driver", icon: <LocalShipping />, route: "/driver" },
  { text: "Application", icon: <Apps />, route: "/application" },
];

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 300,
        flexShrink: 0,
        "& .MuiDrawer-paper": { width: 300, boxSizing: "border-box" },
      }}
    >
      <Toolbar />
      <List>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            component={Link}
            to={item.route}
            sx={{
              backgroundColor: location.pathname === item.route ? "#E3F2FD" : "transparent",
              "&:hover": { backgroundColor: "#BBDEFB" },
              textDecoration: "none",
              color: "inherit",
              borderRadius: 1,
              // mb: 0.5,
            }}
          >
            <ListItemIcon sx={{ color: "inherit",  minWidth: "40px", }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
