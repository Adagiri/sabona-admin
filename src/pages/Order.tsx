import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Pagination,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useFetchAllOrders } from "../hooks/Admin/query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ORDER_STATUSES, ORDER_STATUSES_ARRAY } from "../hooks/Admin/interface";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

const Order = () => {
  const params = useParams();
  const { pageNumber } = useParams<{ pageNumber: string }>();
  const [selectedStatus, setSelectedStatus] = useState<ORDER_STATUSES>( params?.orderStatus ? params?.orderStatus as ORDER_STATUSES : ORDER_STATUSES.PENDING
  );
  const [limit] = useState(10);

  const [page, setPage] = useState<number>(Number(pageNumber) || 1);

  const { data: orders, refetch: refetchOrders, error, isError, isLoading, isRefetching } = useFetchAllOrders({
    type: selectedStatus,
    page,
    limit,
    column: 'createdAt',
    direction: 'DESC',
  });

  const currentStart = useMemo(() => (page - 1) * limit + 1, [page, limit]);
  const currentEnd = useMemo(() => Math.min(page * limit, orders?.count || 0), [page, limit, orders?.count]);

  useEffect(() => {
    if (error) {
      showError((error as any)?.response?.data?.message);
    }
  }, [error]);

  const showError = useCallback((errorMessage: string) => {
    toast(errorMessage, { type: "error" });
  }, []);

  useEffect(() => {
    refetchOrders();
  }, [selectedStatus, refetchOrders, page]);

  const handleChange = useCallback(
    (_: React.MouseEvent<HTMLElement>, newStatus: ORDER_STATUSES) => {
      if (newStatus !== null) {
        setSelectedStatus(newStatus);
        navigate(`/order/1/${newStatus}`);
        setPage(1);
      }
    },
    []
  );
  const totalPages = useMemo(
    () => Math.ceil((orders?.count ?? 0) / limit),
    [orders, limit]
  );

  const navigate = useNavigate();

  const handleNavigateToCoupon = useCallback((id: string)=> {
    navigate('/voucherUsage/'+id)
  },[navigate])

  useEffect(() => {
    if (!pageNumber) {
      navigate(`/order/1`, { replace: true });
    } else {
      setPage(Number(pageNumber));
    }
  }, [pageNumber, navigate]);


  const handlePageChange = useCallback(
    (_: any, value: number) => {
      setPage(value);
      navigate(`/order/${value}/${selectedStatus}`);
    },
    [navigate]
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
        width: 'calc(100% - 80px)',
      }}
    >
      <ToastContainer />
      <Typography variant="h4" gutterBottom mb={5}>
        Order
      </Typography>
      {/* <TextField fullWidth placeholder="Search..." variant="outlined" sx={{ mb: 2 }} /> */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mb: 2,
        }}
      >
        <ToggleButtonGroup
          color="primary"
          value={selectedStatus}
          exclusive
          onChange={handleChange}
          aria-label="Platform"
        >
          {ORDER_STATUSES_ARRAY.map((status) => (
            <ToggleButton key={status.value} value={status.value}>
              {status.status}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
      {isLoading || isRefetching ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="200px"
        >
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="200px"
        >
          <Alert severity="error">
            Failed to load orders. Please try again later.
          </Alert>
        </Box>
      ) : (
        <Box
          className="order-table"
          sx={{ display: "flex", justifyContent: "center", alignItems: "center", mb: 2 }}
        >
          <Paper className="table-container" sx={{ overflow: "auto", width: "auto" }}>
            <Table>
              <TableHead>
                <TableRow hover selected>
                  {[
                    "Order Id",
                    "Ordered By",
                    ...(selectedStatus === ORDER_STATUSES.READY_FOR_PICKUP
                      ? ["Customer Number", "Customer Location"]
                      : []),
                    ...(selectedStatus === ORDER_STATUSES.PENDING
                      ? ["Customer Phone Number"]
                      : []),
                    "Total Amount",
                    "Total Items",
                    "Order Status",
                    "Laundry Name",
                    "Laundry Phone Number",
                    ...(selectedStatus === ORDER_STATUSES.ACCEPTED
                      ? ["Assigned Pickup Rider", "Assigned Delivery Rider"]
                      : []),
                    ...(selectedStatus === ORDER_STATUSES.READY_FOR_PICKUP
                      ? ["Rider Number"]
                      : []),
                      "Coupon Code"
                  ].map((col) => (
                    <TableCell className="table-header" style={{ fontWeight: "bold" }} key={col}>
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {orders && orders?.data?.length > 0 ? (
                  orders.data.map((row, index) => (
                    <TableRow key={index} onClick={() => navigate(`/order-details/${row?.id}`)} sx={{ cursor: 'pointer' }}>
                      <TableCell>{row?.id}</TableCell>
                      <TableCell>
                        {row?.user?.firstName || row?.user?.lastName
                          ? `${row?.user?.firstName || ""} ${row?.user?.lastName || ""}`.trim()
                          : "N/A"}
                      </TableCell>
                      {selectedStatus === ORDER_STATUSES.READY_FOR_PICKUP && (
                        <>
                          <TableCell>{row?.user?.phone || "N/A"}</TableCell>
                          <TableCell>{row?.pickup?.pickupAddress || "N/A"}</TableCell>
                        </>
                      )}
                      {selectedStatus === ORDER_STATUSES.PENDING && (
                        <TableCell>{row?.user?.phone || "N/A"}</TableCell>
                      )}
                      <TableCell>{row?.totalAmount} SAR</TableCell>
                      <TableCell>
                        <button
                          className="table-link"
                          onClick={() => navigate(`/order-details/${row?.id}`)}
                        >
                          {row?.totalQuantity}
                        </button>
                      </TableCell>
                      <TableCell>{row?.status}</TableCell>
                      <TableCell>{row?.laundry?.name}</TableCell>
                      <TableCell>{row?.laundry?.vendor?.phone || "N/A"}</TableCell>
                      {selectedStatus === ORDER_STATUSES.ACCEPTED && (
                        <>
                          <TableCell>
                            {row?.pickup?.rider
                              ? `${row?.pickup?.rider?.firstName} : ${row?.pickup?.rider?.phone}`
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            {row?.delivery?.rider
                              ? `${row?.delivery?.rider?.firstName} : ${row?.delivery?.rider?.phone}`
                              : "N/A"}
                          </TableCell>
                        </>
                      )}
                      {selectedStatus === ORDER_STATUSES.READY_FOR_PICKUP && (
                        <TableCell>{row?.delivery?.rider?.phone || "N/A"}</TableCell>
                      )}
                      <TableCell style={{cursor: 'pointer'}} onClick={(e) => 
                        { e.stopPropagation();
                          row?.coupon?.id && handleNavigateToCoupon(row?.coupon?.id)
                          }}>{row?.coupon?.code || "N/A"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No orders
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} py={2} px={2}>
              <Box flex="1" display="flex" justifyContent="center" marginLeft={20}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
              {orders && (
                <Typography variant="body2" sx={{ ml: 3 }}>
                  Showing {orders?.data?.length > 0 ? `${currentStart}-${currentEnd}` : 0} of {orders?.count || 0} items
                </Typography>
              )}
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default Order;
