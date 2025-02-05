import { Alert, Box, CircularProgress, Pagination, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useFetchAllTips } from "../hooks/Admin/query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';

const Tip = () => {
    const { pageNumber } = useParams<{ pageNumber: string }>();
    const [page, setPage] = useState<number>(Number(pageNumber) || 1);
    const navigate = useNavigate();
    const limit = 10;
    const { data: tips, isLoading, error, isError } = useFetchAllTips({ page, limit });

    useEffect(() => {
        if (!pageNumber) {
            navigate(`/tip/1`, { replace: true });
        } else {
            setPage(Number(pageNumber));
        }
    }, [pageNumber, navigate]);

    const showError = useCallback((errorMessage: string) => {
        toast(errorMessage, { type: "error" });
    }, []);

    useEffect(() => {
        if (error) {
            showError(error.message || 'Unknown error');
        }
    }, [error, showError])

    const handlePageChange = useCallback(
        (_: any, value: number) => {
            setPage(value);
            navigate(`/tip/${value}`);
        },
        [navigate]
    );

    const totalPages = useMemo(() => Math.ceil((tips?.count ?? 0) / limit), [tips, limit]);
    const currentStart = useMemo(() => (page - 1) * limit + 1, [page, limit]);
    const currentEnd = useMemo(() => Math.min(page * limit, tips?.count || 0), [page, limit, tips?.count]);
    console.log("tips", tips);
    return (
        <Box pr={5}>
            <ToastContainer />
            <Typography variant="h4" gutterBottom mb={5}>
                Tips
            </Typography>
            <Paper>
                {isLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                        <CircularProgress />
                    </Box>
                ) : isError ? (

                    <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                        <Alert severity="error">Failed to load drivers. Please try again later.</Alert>
                    </Box>
                ) : (<Table>
                    <TableHead>
                        <TableRow
                            hover selected
                        >
                            {["Order ID", "Amount", "Created At", "Rider ID", "Transaction ID"].map((col) => (
                                <TableCell style={{ fontWeight: 'bold' }} key={col}>{col}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tips?.data && tips?.data.length > 0 ? (
                            tips.data.map((row: any, index: number) => (
                                <TableRow key={index}>
                                    <TableCell style={{ cursor: 'pointer' }} onClick={() => navigate(`/order-details/${row.orderId}`)}>{row.orderId ?? 'N/A'}</TableCell>
                                    <TableCell>{row.amount ?? 'N/A'} SAR</TableCell>
                                    <TableCell>{new Date(row.createdAt).toLocaleString() ?? 'N/A'}</TableCell>
                                    <TableCell style={{ cursor: 'pointer' }} onClick={() => navigate(`/user-details/${row.riderId}`)}>{row.riderId ?? 'N/A'}</TableCell>
                                    <TableCell>{row.transactionId ?? 'N/A'}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    No drivers
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>)}
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} py={2} px={2}>
                    <Box flex="1" display="flex" justifyContent="center" marginLeft={20}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={handlePageChange}
                            color="primary"
                        />
                    </Box>
                    {tips && (
                        <Typography variant="body2" sx={{ ml: 3 }}>
                            Showing {tips?.data?.length > 0 ? `${currentStart}-${currentEnd}` : 0} of {tips?.count || 0} items
                        </Typography>
                    )}
                </Box>
            </Paper>
        </Box>
    )
}

export default Tip