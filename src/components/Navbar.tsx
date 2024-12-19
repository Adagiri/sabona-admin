import React, { useCallback } from "react";
import { AppBar, Toolbar, Typography, Menu, MenuItem, Avatar } from "@mui/material";
import useAuthStore from "../store/Auth";

const Navbar: React.FC = () => {
  const resetStore = useAuthStore((state) => state.resetStore);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = useCallback(()=> {
    resetStore();
  },[resetStore])

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }} elevation={0} color="transparent">
      <Toolbar>
        <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
          Sabonah Admin
        </Typography>
        <Avatar sx={{ ml: 1 }}  onClick={handleMenuOpen} />
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
