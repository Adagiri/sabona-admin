import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, Pagination, CircularProgress, Alert, ToggleButtonGroup, ToggleButton } from "@mui/material";
import { useFetchAllUsers } from "../hooks/Admin/query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Filter, LEVELS, USER_TYPES } from "../hooks/Admin/interface";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

const FILTER_ARRAY = [
  { value: 'Today', status: "Today" },
  { value: 'ByWeek', status: "By Week" },
  { value: 'ByMonth', status: "By Month" },
  { value: 'BySixMonths', status: "By Six Months" },
  { value: 'ByYear', status: "By Year" },
]

const Customer = () => {
  const [selectedFilter, setSelectedFilter] = useState<any>('ByMonth');
  const { pageNumber } = useParams<{ pageNumber: string }>();
const [page, setPage] = useState<number>(Number(pageNumber) || 1);

  const [limit] = useState(10);

  const { data: customers, isLoading, error, isError } = useFetchAllUsers({
    type: USER_TYPES.USER,
    page,
    limit,
    dateFilter: selectedFilter,
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

  const handleChange = useCallback((
    _: React.MouseEvent<HTMLElement>,
    filter: keyof Filter | null,
  ) => {
    if (filter !== null) {
      setSelectedFilter(filter);
    }
  }, [setSelectedFilter]);

  const navigate = useNavigate();
  useEffect(() => {
    if (!pageNumber) {
      navigate(`/customer/1`, { replace: true });
    } else {
      setPage(Number(pageNumber));
    }
  }, [pageNumber, navigate]);
  
  const handlePageChange = useCallback(
    (_: any, value: number) => {
      setPage(value);
      navigate(`/customer/${value}`); 
    },
    [navigate]
  );
  const currentStart = useMemo(() => (page - 1) * limit + 1, [page, limit]);
  const currentEnd = useMemo(() => Math.min(page * limit, customers?.count || 0), [page, limit, customers?.count]);
  
  return (
    <Box pr={5}>
      <ToastContainer />
      <Typography variant="h4" gutterBottom mb={5}>
        Customer
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
        <ToggleButtonGroup
          color="primary"
          value={selectedFilter}
          exclusive
          onChange={handleChange}
          aria-label="Platform"
        >
          {FILTER_ARRAY.map(filter => (
            <ToggleButton key={filter.value} value={filter.value}>{filter.status}</ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
      {/* <TextField fullWidth placeholder="Search..." variant="outlined" sx={{ mb: 2 }} /> */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="200px">
          <CircularProgress />
        </Box>
      ) : isError ? (
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
                {["First Name", "Last Name", "Level", "Phone", "Email", "Status", "Created At"].map((col) => (
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
                      <TableCell style={row.level === LEVELS.LOYAL ? { color: 'maroon', fontWeight: 'bolder' } : {}}>{row.level}</TableCell>
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
          <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} py={2} px={2}>
              <Box flex="1" display="flex" justifyContent="center" marginLeft={20}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
              {customers && (
                <Typography variant="body2" sx={{ ml: 3 }}>
                  Showing {customers?.data?.length > 0 ? `${currentStart}- ${currentEnd}` : 0} of {customers?.count || 0} items
                </Typography>
              )}
            </Box>
        </Paper>)}
    </Box>
  );
}

export default Customer;
