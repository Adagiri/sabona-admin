import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, Pagination, ToggleButtonGroup, ToggleButton, CircularProgress, Alert } from "@mui/material";
import { useFetchAllOrders } from "../hooks/Admin/query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ORDER_STATUSES, ORDER_STATUSES_ARRAY } from "../hooks/Admin/interface";
import { toast, ToastContainer } from "react-toastify";


const Order = () => {
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [selectedStatus, setSelectedStatus] = useState<ORDER_STATUSES>(ORDER_STATUSES.PENDING);

    const { data: orders, refetch: refetchOrders, error, isError, isLoading } = useFetchAllOrders({
        type: selectedStatus,
        page,
        limit,
    });

    useEffect(() => {
        if (error) {
          showError(((error as any)?.response?.data?.message))
        }
      }, [error])
    
      const showError = useCallback((errorMessage: string) => {
        toast(errorMessage, { type: "error" });
      }, []);

    useEffect(() => {
        refetchOrders();
    }, [selectedStatus, refetchOrders]);

    const handleChange = useCallback((
        _: React.MouseEvent<HTMLElement>,
        newStatus: ORDER_STATUSES,
    ) => {
        if (newStatus !== null) {
            setSelectedStatus(newStatus);
        }
    }, [])


    const totalPages = useMemo(() => Math.ceil((orders?.count ?? 0) / limit), [orders, limit]);
    const handlePageChange = useCallback((_: any, value: number) => {
        setPage(value);
    }, []);
    return (
        <Box pr={5}>
        <ToastContainer />
            <Typography variant="h4" gutterBottom mb={5}> 
                Order
            </Typography>
            {/* <TextField fullWidth placeholder="Search..." variant="outlined" sx={{ mb: 2 }} /> */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <ToggleButtonGroup
                    color="primary"
                    value={selectedStatus}
                    exclusive
                    onChange={handleChange}
                    aria-label="Platform"
                >
                    {ORDER_STATUSES_ARRAY.map((status) => (
                        <ToggleButton key={status.value} value={status.value}>{status.status}</ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </Box>
            {isLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                    <CircularProgress />
                </Box>
            ) : isError ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                    <Alert severity="error">Failed to load orders. Please try again later.</Alert>
                </Box>
            ) :(<Paper>
                <Table>
                    <TableHead>
                        <TableRow hover selected>
                            {["Order Id", "Ordered By", "Total Amount", "Total Items", "Order Status", "Laundry Name"].map((col) => (
                                <TableCell key={col}>{col}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders && orders?.data?.length > 0 ? (
                            orders.data.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell>{row?.id}</TableCell>
                                    <TableCell>{row?.user?.firstName} {row?.user?.lastName}</TableCell>
                                    <TableCell>{row?.totalAmount} SAR</TableCell>
                                    <TableCell>{row?.totalQuantity}</TableCell>
                                    <TableCell>{row?.status}</TableCell>
                                    <TableCell>{row?.laundry?.name}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    No orders
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <Box display="flex" justifyContent="center" mt={2} py={2}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                    />
                </Box>
            </Paper>)}
        </Box>
    )
}

export default Order