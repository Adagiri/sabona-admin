import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, Pagination, ToggleButtonGroup, ToggleButton, CircularProgress, Alert } from "@mui/material";
import { useFetchAllOrders } from "../hooks/Admin/query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ORDER_STATUSES, ORDER_STATUSES_ARRAY } from "../hooks/Admin/interface";
import { toast, ToastContainer } from "react-toastify";


const Order = () => {
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [selectedStatus, setSelectedStatus] = useState<ORDER_STATUSES>(ORDER_STATUSES.PENDING);

    const { data: orders, refetch: refetchOrders, error, isError, isLoading, isRefetching } = useFetchAllOrders({
        type: selectedStatus,
        page,
        limit,
        column: 'createdAt',
        direction: 'DESC',
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
    }, [selectedStatus, refetchOrders, page]);

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
        <Box width='calc(100% - 80px)' overflow={'hidden'}>
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
            {isLoading || isRefetching ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                    <CircularProgress />
                </Box>
            ) : isError ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                    <Alert severity="error">Failed to load orders. Please try again later.</Alert>
                </Box>
            ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
            <Paper sx={{borderWidth:2, overflow: 'auto', width: 'auto' }}>
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
                            ].map((col) => (
                                <TableCell style={{ fontWeight: "bold" }} key={col}>
                                    {col}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders && orders?.data?.length > 0 ? (
                            orders.data.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell>{row?.id}</TableCell>
                                    <TableCell>
                                        {row?.user?.firstName || row?.user?.lastName ? `${row?.user?.firstName || ""} ${row?.user?.lastName || ""}`.trim() : "N/A"}
                                    </TableCell>
                                    {selectedStatus === ORDER_STATUSES.READY_FOR_PICKUP && (
                                        <>
                                            <TableCell>{row?.user?.phone || "N/A"}</TableCell>
                                            <TableCell>
                                                {row?.pickup?.pickupAddress || "N/A"}
                                            </TableCell>
                                        </>
                                    )}
                                    {selectedStatus === ORDER_STATUSES.PENDING && (
                                        <TableCell>{row?.user?.phone || "N/A"}</TableCell>
                                    )}
                                    <TableCell>{row?.totalAmount} SAR</TableCell>
                                    {/* <TableCell>{row?.totalQuantity}</TableCell> */}
                                    <TableCell>
                                        <button
                                            style={{
                                                background: "none",
                                                border: "none",
                                                color: "inherit",
                                                cursor: "pointer",
                                                textDecoration: "none",
                                                fontWeight: "bold",
                                            }}
                                            onClick={() => { }
                                                // navigate(`/order-details/${row?.id}`)
                                            }
                                        >
                                            {row?.totalQuantity}
                                        </button>
                                    </TableCell>
                                    <TableCell>{row?.status}</TableCell>
                                    <TableCell>{row?.laundry?.name}</TableCell>
                                    <TableCell> {row?.laundry?.vendor?.phone || "N/A"}
                                    </TableCell>
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
                                        <TableCell>
                                            {row?.delivery?.rider?.phone || "N/A"}
                                        </TableCell>
                                    )}
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
            </Paper>
            </Box>)}
        </Box>
    )
}

export default Order