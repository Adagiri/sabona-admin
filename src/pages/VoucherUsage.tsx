import {
    Alert, Box, CircularProgress, Typography,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
    Pagination,
    Stack,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useGetCouponUsage } from "../hooks/Admin/query";
import { useCallback, useMemo, useState } from "react";
import { Discount, DriveFileRenameOutline, MoneyOff, TaskAlt, ToggleOff, ToggleOn } from "@mui/icons-material";

const VoucherUsage = () => {
    const { voucherId } = useParams<{ voucherId: string }>();
    const [page, setPage] = useState<number>(1);
    const [limit] = useState(10);
    const { data: voucherUsage, isLoading, error } = useGetCouponUsage(voucherId!);
    const navigate = useNavigate()
    const totalPages = useMemo(() => Math.ceil((voucherUsage?.data?.count ?? 0) / limit), [voucherUsage, limit]);

    const navigateToOrder = (orderId: string) => {
        navigate(`/order-details/${orderId}`);
    };

    const navigateToUser = (userId: string) => {
        navigate(`/user-details/${userId}`);
    };

    
    console.log("voucherUsage", voucherUsage)

    const columns = [
        "User Id",
        "User Name",
        "Order Id",
    ];

    console.log("voucherUsage?.count", voucherUsage?.data?.count)

    const handlePageChange = useCallback(
        (_: any, value: number) => {
            setPage(value);
        },
        [navigate]
    );

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
        <Box pb={10} p={2}>
            <Typography variant="h4" gutterBottom mb={5}>
                Voucher Usage
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
                <Stack direction={{ xs: "column", sm: "row" }} sx={{ justifyContent: 'space-between' }} spacing={4}>
                    <Box>
                        <Typography
                            variant="h6"
                            fontWeight="bold"
                            color="#333"
                            sx={{ display: "flex", alignItems: "center" }}
                        >
                            <Discount fontSize="small" sx={{ mr: 1, color: "#00796b" }} />
                            Code
                        </Typography>
                        <Typography variant="body1" color="#555" sx={{ ml: 3.3 }}>
                            {voucherUsage?.data?.coupon?.code}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography
                            variant="h6"
                            fontWeight="bold"
                            color="#333"
                            sx={{ display: "flex", alignItems: "center" }}
                        >
                            <DriveFileRenameOutline fontSize="small" sx={{ mr: 1, color: "#00796b" }} />
                            Name
                        </Typography>
                        <Typography variant="body1" color="#555" sx={{ ml: 3.3 }}>
                            {voucherUsage?.data?.coupon?.name}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography
                            variant="h6"
                            fontWeight="bold"
                            color="#333"
                            sx={{ display: "flex", alignItems: "center" }}
                        >
                            {voucherUsage?.data?.coupon?.isActive ? <ToggleOn fontSize="medium" sx={{ mr: 1, color: "#00796b" }} /> : <ToggleOff fontSize="medium" sx={{ mr: 1, color: "#00796b" }} />}
                            Active
                        </Typography>
                        <Typography variant="body1" color="#555" sx={{ ml: 3.9 }}>
                            {voucherUsage?.data?.coupon?.isActive ? "Yes" : "No"}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography
                            variant="h6"
                            fontWeight="bold"
                            color="#333"
                            sx={{ display: "flex", alignItems: "center" }}
                        >
                            <MoneyOff fontSize="medium" sx={{ mr: 1, color: "#00796b" }} />
                            Discount
                        </Typography>
                        <Typography variant="body1" color="#555" sx={{ ml: 3.9 }}>
                            {voucherUsage?.data?.coupon?.discount} {voucherUsage?.data?.coupon?.type === "FIXED" ? "SAR" : "%"}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography
                            variant="h6"
                            fontWeight="bold"
                            color="#333"
                            sx={{ display: "flex", alignItems: "center" }}
                        >
                            <TaskAlt fontSize="small" sx={{ mr: 1, color: "#00796b" }} />
                            Total Times Used
                        </Typography>
                        <Typography variant="body1" color="#555" sx={{ ml: 3.3 }} >
                            {voucherUsage?.data?.totalUsageCount}
                        </Typography>
                    </Box>



                </Stack>
            </Paper>

            {voucherUsage?.data?.totalUsageCount > 0 ? <Paper elevation={3}>
                <Table>
                    <TableHead>
                        <TableRow hover>
                            {columns.map((col) => (
                                <TableCell key={col} style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                                    {col}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {voucherUsage?.data?.usage?.map((use: any) => {
                            return (
                                <TableRow key={use.id}>
                                    <TableCell onClick={() => navigateToUser(use.userId)} style={{cursor: 'pointer'}}>{use.userId}</TableCell>
                                    <TableCell>{use.user?.firstName} {use.user?.lastName}</TableCell>
                                    <TableCell>
                                        {use.coupon?.orders.map((order: any, index: number) => (
                                            <Box mb={1} key={order.id} onClick={() => navigateToOrder(order.id)} style={{ cursor: 'pointer' }}>
                                                {order?.id}
                                                {index !== use.coupon?.orders.length - 1 && <br />}
                                            </Box>
                                        ))}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>

                <Box display="flex" justifyContent="center" mt={2} pb={2}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                    />
                </Box>
            </Paper> :
                <Box display={"flex"} justifyContent={"center"}>
                    <Alert severity="info">Coupon not used</Alert>
                </Box>}

        </Box>
    );
};

export default VoucherUsage;
