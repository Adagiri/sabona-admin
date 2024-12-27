import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, Pagination, CircularProgress, Alert } from "@mui/material";
import { useFetchAllUsers } from "../hooks/Admin/query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { USER_TYPES } from "../hooks/Admin/interface";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";


const Vendor = () => {
  const { pageNumber } = useParams<{ pageNumber: string }>();
  const [page, setPage] = useState<number>(Number(pageNumber) || 1);
  const [limit] = useState(10);

  const { data: vendors, isLoading, error, isError } = useFetchAllUsers({
    type: USER_TYPES.VENDOR,
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

  const totalPages = useMemo(() => Math.ceil((vendors?.count ?? 0) / limit), [vendors, limit]);

  const navigate = useNavigate();
  useEffect(() => {
    if (!pageNumber) {
      navigate(`/vendor/1`, { replace: true });
    } else {
      setPage(Number(pageNumber));
    }
  }, [pageNumber, navigate]);
  

  const handlePageChange = useCallback(
    (_: any, value: number) => {
      setPage(value);
      navigate(`/vendor/${value}`);
    },
    [navigate]
  );
  const currentStart = useMemo(() => (page - 1) * limit + 1, [page, limit]);
  const currentEnd = useMemo(() => Math.min(page * limit, vendors?.count || 0), [page, limit, vendors?.count]);
  return (
    <Box pr={5}>
      <ToastContainer />
      <Typography variant="h4" gutterBottom mb={5}>
        Vendor
      </Typography>
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="200px">
          <CircularProgress />
        </Box>
      )  : isError ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="200px">
          <Alert severity="error">Failed to load vendors. Please try again later.</Alert>
        </Box>
      ) :
        (<Paper>
          <Table>
            <TableHead>
              <TableRow hover selected>
                {["First Name", "Last Name", "Type", "Phone", "Email", "Status", "Created At"].map((col) => (
                  <TableCell style={{ fontWeight: 'bold' }} key={col}>{col}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {vendors?.data && vendors?.data?.length > 0 ? (
                vendors.data.map((row, index) => (
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
                  <TableCell colSpan={7} align="center">No vendors available</TableCell>
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
              {vendors && (
                <Typography variant="body2" sx={{ ml: 3 }}>
                  Showing {vendors?.data?.length > 0 ? `${currentStart}-${currentEnd}` : 0} of {vendors?.count || 0} items
                </Typography>
              )}
            </Box>
        </Paper>)}
    </Box>
  )
}

export default Vendor