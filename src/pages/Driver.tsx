import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, Pagination, useTheme, CircularProgress, Alert } from "@mui/material";
import { useFetchAllUsers } from "../hooks/Admin/query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { USER_TYPES } from "../hooks/Admin/interface";
import { ToastContainer, toast } from 'react-toastify';

const Driver = () => {
    const [page, setPage] = useState(1);
    const [limit] = useState(10);

    const { data: drivers, isLoading, error: errorFetchingUsers, isError } = useFetchAllUsers({
        type: USER_TYPES.RIDER,
        page,
        limit,
    });

    useEffect(() => {
        if (errorFetchingUsers) {
            showError((errorFetchingUsers?.response?.data as { message: string })?.message || 'Unknown error');
        }
    }, [errorFetchingUsers])

    const totalPages = useMemo(() => Math.ceil((drivers?.count ?? 0) / limit), [drivers, limit]);
    const handlePageChange = useCallback((_: any, value: number) => {
        setPage(value);
    }, []);

    const showError = useCallback((errorMessage: string) => {
        toast(errorMessage, { type: "error" });
    }, []);
    return (
        <Box pr={5}>
            <ToastContainer />
            <Typography variant="h4" gutterBottom mb={5}>
                Driver
            </Typography>
            {/* <TextField fullWidth placeholder="Search..." variant="outlined" sx={{ mb: 2 }} /> */}
            <Paper>
                {isLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                        <CircularProgress />
                    </Box>
                ): isError ? (
                    // Show error message when there's an error
                    <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                      <Alert severity="error">Failed to load drivers. Please try again later.</Alert>
                    </Box>
                  ) : (<Table>
                    <TableHead>
                        <TableRow
                            hover selected
                        >
                            {["First Name", "Last Name", "Type", "Phone", "Email", "Status", "Created At"].map((col) => (
                                <TableCell style={{ fontWeight: 'bold' }} key={col}>{col}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {drivers?.data && drivers?.data.length > 0 ? (
                            drivers.data.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell>{row.firstName ?? 'N/A'}</TableCell>
                                    <TableCell>{row.lastName ?? 'N/A'}</TableCell>
                                    <TableCell>{row.type}</TableCell>
                                    <TableCell>{row.phone}</TableCell>
                                    <TableCell>{row.email ?? 'N/A'}</TableCell>
                                    <TableCell style={row.status === 'INACTIVE' ? { color: 'red' } : { color: 'green' }}>
                                        {row.status}
                                    </TableCell>
                                    <TableCell>{row.createdAt}</TableCell>
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
                <Box display="flex" justifyContent="center" mt={2} py={2}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                    />
                </Box>
            </Paper>
        </Box>
    )
}

export default Driver