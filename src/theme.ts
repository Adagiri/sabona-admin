import { createTheme, ThemeOptions } from "@mui/material/styles";

const themeOptions: ThemeOptions = {
  palette: {
    primary: {
      main: "#033955", 
    },
    secondary: {
      main: "#F3AFAE", 
    },
    background: {
      default: "#F4F6F8", 
    },
    info: {
      main: "#B6E1DD",
    }
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
    h4: {
      fontWeight: 600,
      fontSize: "1.8rem",
    },
    body1: {
      fontSize: "1rem",
    },
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          width: 240, 
        },
      },
    },
  },
};

const theme = createTheme(themeOptions);

export default theme;
