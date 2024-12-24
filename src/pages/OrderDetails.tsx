import React from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useFetchOrderDetails } from "../hooks/Admin/query";

const OrderDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();

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
      <Typography variant="h4" gutterBottom>
        Order Details
      </Typography>

      <Paper sx={{ mt: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow hover selected sx={{ border: "none" }}>
                {[
                  "Order ID",
                  "Order Status",
                  "Laundry Name",
                  "Laundry Description",
                  "Total Amount",
                  "Laundry Service Item",
                  "Laundry Service Price",
                ].map((header) => (
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      pt: 1.5, 
                      pb: 1.5, 
                      border: "none",
                    }}
                    key={header}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {orderDetails && (
                <>
                  <TableRow sx={{ border: "none" }}>
                    <TableCell
                      rowSpan={orderDetails.laundry.laundryService[0]?.laundryServiceItems?.length || 1}
                      sx={{ pt: 1.5, pb: 1.5, border: "none" }}
                    >
                      {orderDetails?.id || "N/A"}
                    </TableCell>
                    <TableCell
                      rowSpan={orderDetails.laundry.laundryService[0]?.laundryServiceItems?.length || 1}
                      sx={{ pt: 1.5, pb: 1.5, border: "none" }}
                    >
                      {orderDetails?.status || "N/A"}
                    </TableCell>
                    <TableCell
                      rowSpan={orderDetails.laundry.laundryService[0]?.laundryServiceItems?.length || 1}
                      sx={{ pt: 1.5, pb: 1.5, border: "none" }}
                    >
                      {orderDetails?.laundry?.name || "N/A"}
                    </TableCell>
                    <TableCell
                      rowSpan={orderDetails.laundry.laundryService[0]?.laundryServiceItems?.length || 1}
                      sx={{ pt: 1.5, pb: 1.5, border: "none" }}
                    >
                      {orderDetails?.laundry?.laundryService?.[0]?.description || "N/A"}
                    </TableCell>
                    <TableCell
                      rowSpan={orderDetails.laundry.laundryService[0]?.laundryServiceItems?.length || 1}
                      sx={{ pt: 1.5, pb: 1.5, border: "none" }}
                    >
                      {orderDetails?.totalAmount || "N/A"} SAR
                    </TableCell>
                    <TableCell sx={{ pt: 1.5, pb: 1.5, border: "none" }}>
                      {orderDetails?.laundry?.laundryService?.[0]?.laundryServiceItems?.[0]?.name || "N/A"}
                    </TableCell>
                    <TableCell sx={{ pt: 1.5, pb: 1.5, border: "none" }}>
                      {orderDetails?.laundry?.laundryService?.[0]?.laundryServiceItems?.[0]?.price || "N/A"} SAR
                    </TableCell>
                  </TableRow>
                
                  {orderDetails?.laundry?.laundryService?.[0]?.laundryServiceItems
                    ?.slice(1)
                    .map((item) => (
                      <TableRow key={item.id} sx={{ border: "none" }}>
                        <TableCell sx={{ pt: 1.5, pb: 1.5, border: "none" }}>
                          {item.name || "N/A"}
                        </TableCell>
                        <TableCell sx={{ pt: 1.5, pb: 1.5, border: "none" }}>
                          {item.price || "N/A"} SAR
                        </TableCell>
                      </TableRow>
                    ))}
                </>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default OrderDetails;

