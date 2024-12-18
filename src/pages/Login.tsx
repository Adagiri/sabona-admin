import React, { useCallback, useEffect, useState } from "react";
import { TextField, Button, Box, Typography, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useLoginUser } from "../hooks/Admin/mutation";
import { toast, ToastContainer } from "react-toastify";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { mutate: login, error } = useLoginUser();

  const [phone, setPhone] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (error) {
      showError(error?.response?.data?.message || 'Unknown error')
    }
  }, [error])

  const showError = useCallback((errorMessage: string) => {
    toast(errorMessage, { type: "error" });
  }, []);

  const handleLogin = () => {
    setIsLoading(true);
    login(
      { phone, password },
      {
        onSuccess: () => {
          navigate("/");
        },
        onSettled: ()=> {
          setIsLoading(false);
        }
      }
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        // height: "100vh",
        backgroundColor: "#f4f6f8",
      }}
    >
      <ToastContainer/>
      <Box sx={{ maxWidth: 400, width: "100%", padding: 3, backgroundColor: "white", borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h4" gutterBottom textAlign="center">
          Login
        </Typography>

        {/* {error && (
          <Typography color="error" variant="body2" textAlign="center" mb={2}>
            Invalid phone number or password
          </Typography>
        )} */}

        <TextField
          label="Phone Number"
          variant="outlined"
          fullWidth
          margin="normal"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleLogin}
          sx={{ mt: 2 }}
        >
            {/* Login */}
          {isLoading ? <CircularProgress size={24} color="inherit" /> : "Login"}
        </Button>
      </Box>
    </Box>
  );
};

export default Login;
