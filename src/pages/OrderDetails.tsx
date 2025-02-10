import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Card,
  CardContent,
  Stack,
} from "@mui/material";
import { useFetchOrderDetails } from "../hooks/Admin/query";
import { AttachMoney, CheckCircle, Home, Info, Payment } from "@mui/icons-material";
import { TIP_TYPE } from "../hooks/Admin/interface";

const OrderDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate()
  const {
    data: orderDetails,
    isLoading,
    error,
  } = useFetchOrderDetails(orderId || "");

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Alert severity="error">Failed to fetch order details</Alert>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Order Details
      </Typography>
      <Paper
        elevation={6}
        sx={{
          mb: 4,
          borderRadius: 3,
          p: 4,
          bgcolor: "white",
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} sx={{justifyContent: 'space-between'}} spacing={4}>
          <Box>
            <Typography
              variant="h6"
              fontWeight="bold"
              color="#333"
              sx={{ display: "flex", alignItems: "center" }}
            >
              <Info fontSize="small" sx={{ mr: 1, color: "#00796b" }} />
              Order ID
            </Typography>
            <Typography variant="body1" color="#555" sx={{ ml: 3.3 }}>
              {orderDetails?.id}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="h6"
              fontWeight="bold"
              color="#333"
              sx={{ display: "flex", alignItems: "center" }}
            >
              <CheckCircle fontSize="small" sx={{ mr: 1, color: "#00796b" }} />
              Order Status
            </Typography>
            <Chip
              label={orderDetails?.status}
              sx={{
                fontWeight: "bold",
                textTransform: "none",
                bgcolor: "#e0f7fa",
                color: "#00796b",
                ml: 3.5,
                px: 2,
                py: 0.5,
                borderRadius: 1,
                boxShadow: "0px 2px 5px rgba(0,0,0,0.2)",
              }}
            />
          </Box>

          <Box>
            <Typography
              variant="h6"
              fontWeight="bold"
              color="#333"
              sx={{ display: "flex", alignItems: "center" }}
            >
              <Home fontSize="small" sx={{ mr: 1, color: "#00796b" }} />
              Laundry Name
            </Typography>
            <Typography variant="body1" color="#555" sx={{ ml: 3.5 }}>
              {orderDetails?.laundry.name}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="h6"
              fontWeight="bold"
              color="#333"
              sx={{ display: "flex", alignItems: "center" }}
            >
              <AttachMoney fontSize="small" sx={{ color: "#00796b" }} />
              Total Amount
            </Typography>
            <Typography variant="body1" color="#555" sx={{ ml: 2.5 }}>
              {orderDetails?.totalAmount} SAR
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Typography variant="h5" gutterBottom fontWeight="bold">
        Services
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
        {orderDetails?.services.map((service:any) => (
          <Card
            key={service.id}
            sx={{
              borderRadius: 2,
              boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
              },
              width: "100%",
              maxWidth: "400px",
              margin: "0 auto",
            }}
          >

            <CardContent>
              <Typography variant="h6" fontWeight="bold">
                {service.laundryService.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {service.laundryService.description}
              </Typography>
              <Divider sx={{ my: 1 }} />
              {service.items.map((item:any) => (
                <Box
                  key={item.id}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  py={1}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography>{item.laundryServiceItem.name}</Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        backgroundColor: "#e0f7fa",
                        color: "#00796b",
                        px: 1.5,
                        py: 0.3,
                        borderRadius: "5px",
                        fontWeight: "bold",
                      }}
                    >
                      x{item.quantity}
                    </Typography>
                  </Box>

                  <Typography
                    fontWeight="bold"
                    variant="body1"
                    sx={{ textAlign: "right", color: "#333" }}
                  >
                    {item.quantity * item.laundryServiceItem.price} SAR
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        ))}
      </Stack>
      <Divider sx={{ my: 5 }} />
      {orderDetails?.tip && orderDetails?.tip?.length > 0 && <Paper
        elevation={6}
        sx={{
          mb: 4,
          borderRadius: 3,
          p: 4,
          bgcolor: "white",
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Tips
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} sx={{ justifyContent: 'space-between' }} spacing={4}>
          {orderDetails?.tip?.map((tip) => {
            console.log("tip", tip.type)
            return (
            <Box  onClick={()=> navigate(`/user-details/${tip.riderId}`)} sx={{cursor:'pointer'}}>
              <Typography
                variant="h6"
                fontWeight="bold"
                color="#333"
                sx={{ display: "flex", alignItems: "center" }}
              >
                <Payment fontSize="small" sx={{ mr: 1, color: "#00796b" }} />
                {tip.type === TIP_TYPE.RIDER_PICKUP ? 'Pickup' : 'Delivery'} Rider Tip
              </Typography>
              <Typography variant="body1" color="#555" sx={{ ml: 3.3 }}>
                Amount: {tip?.amount} SAR
              </Typography>
              <Typography variant="body1" color="#555" sx={{ ml: 3.3 }}>
                Rider Id: {tip?.riderId}
              </Typography>
            </Box>)
          })}
        </Stack>
      </Paper>}

    </Box>
  );
};

export default OrderDetails;

