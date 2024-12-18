import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, Pagination, CircularProgress, Alert } from "@mui/material";
import { useFetchAllUsers } from "../hooks/Admin/query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { USER_TYPES } from "../hooks/Admin/interface";
import { toast, ToastContainer } from "react-toastify";

const Customer = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data: customers, isLoading, error, isError } = useFetchAllUsers({
    type: USER_TYPES.USER,
    page,
    limit,
  });

  useEffect(() => {
    if (error) {
      showError((error?.response?.data as { message: string })?.message || 'Unknown error');
    }
  }, [error])

  const showError = useCallback((errorMessage: string) => {
    toast(errorMessage, { type: "error" });
  }, []);

  const totalPages = useMemo(() => Math.ceil((customers?.count ?? 0) / limit), [customers, limit]);
  const handlePageChange = useCallback((_: any, value: number) => {
    setPage(value);
  }, []);
  return (
    <Box pr={5}>
      <ToastContainer />
      <Typography variant="h4" gutterBottom mb={5}>
        Customer
      </Typography>
      {/* <TextField fullWidth placeholder="Search..." variant="outlined" sx={{ mb: 2 }} /> */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="200px">
          <CircularProgress />
        </Box>
      ): isError ? (
        // Show error message when there's an error
        <Box display="flex" justifyContent="center" alignItems="center" height="200px">
          <Alert severity="error">Failed to load customers. Please try again later.</Alert>
        </Box>
      ) :
       (<Paper>
        <Table>
          <TableHead>
            <TableRow style={{
              backgroundColor: 'secondary',
            }} hover selected>
              {["First Name", "Last Name", "Type", "Phone", "Email", "Status", "Created At"].map((col) => (
                <TableCell style={{ fontWeight: 'bold' }} key={col}>{col}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {customers?.data && customers?.data?.length > 0 ? (
              customers.data.map((row, index) => {
                return (
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
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">No customers available</TableCell>
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
  );
}

export default Customer;
