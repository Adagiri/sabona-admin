// File: src/components/Sidebar.tsx
import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from '@mui/material';
import {
  Home,
  People,
  Business,
  LocalShipping,
  Apps,
  Inventory,
  Map,
  Discount,
  Paid,
  LocalLaundryService,
  ImageOutlined,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { Settings } from 'lucide-react';

const menuItems = [
  { text: 'Home', icon: <Home />, route: '/' },
  { text: 'Order', icon: <Inventory />, route: '/order' },
  { text: 'Customer', icon: <People />, route: '/customer' },
  { text: 'Vendor', icon: <Business />, route: '/vendor' },
  { text: 'Laundry', icon: <LocalLaundryService />, route: '/laundry' },
  { text: 'Icons', icon: <ImageOutlined />, route: '/icons' }, // Fixed route
  { text: 'Driver', icon: <LocalShipping />, route: '/driver' },
  { text: 'Application', icon: <Apps />, route: '/application' },
  { text: 'Map Stats', icon: <Map />, route: '/map-stats' },
  { text: 'Voucher', icon: <Discount />, route: '/voucher' },
  { text: 'Tips', icon: <Paid />, route: '/tip' },
  { text: 'Settings', icon: <Settings />, route: '/admin-settings' },
];

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <Drawer
      variant='permanent'
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: 240, boxSizing: 'border-box' },
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
              backgroundColor:
                `/${location.pathname.split('/')[1]}` === item.route
                  ? '#E3F2FD'
                  : 'transparent',
              '&:hover': { backgroundColor: '#BBDEFB' },
              textDecoration: 'none',
              color: 'inherit',
              borderRadius: 1,
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: '40px' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
