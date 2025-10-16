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
  CircularProgress,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { useFetchAllUsers } from '../hooks/Admin/query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Filter, LEVELS, USER_TYPES } from '../hooks/Admin/interface';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate, useSearchParams } from 'react-router-dom';

const FILTER_ARRAY = [
  { value: 'Today', status: 'Today' },
  { value: 'ByWeek', status: 'By Week' },
  { value: 'ByMonth', status: 'By Month' },
  { value: 'BySixMonths', status: 'By Six Months' },
  { value: 'ByYear', status: 'By Year' },
];

const Customer = () => {
 const [selectedFilter, setSelectedFilter] = useState<keyof Filter>('ByMonth');
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const pageNumber = searchParams.get('page') || '1';
  const [page, setPage] = useState<number>(Number(pageNumber));
  const [limit] = useState(10);

  const {
    data: customers,
    isLoading,
    error,
    isError,
  } = useFetchAllUsers({
    type: USER_TYPES.USER,
    page,
    limit,
    dateFilter: selectedFilter,
  });

  const showError = useCallback((errorMessage: string) => {
    toast(errorMessage, { type: 'error' });
  }, []);

  useEffect(() => {
    if (error) {
      showError(
        (error?.response?.data as { message?: string })?.message ||
          'Unknown error'
      );
    }
  }, [error, showError]);

  const totalPages = useMemo(
    () => Math.ceil((customers?.count ?? 0) / limit),
    [customers, limit]
  );

  const handleChange = useCallback(
    (_: React.MouseEvent<HTMLElement>, filter: keyof Filter | null) => {
      if (filter) setSelectedFilter(filter);
    },
    []
  );

  useEffect(() => {
    const currentPage = searchParams.get('page');
    if (!currentPage) {
      setSearchParams({ page: '1' }, { replace: true });
    } else {
      setPage(Number(currentPage));
    }
  }, [searchParams, setSearchParams]);

  const handlePageChange = useCallback(
    (_: unknown, value: number) => {
      setPage(value);
      setSearchParams({ page: value.toString() });
    },
    [setSearchParams]
  );

  const handleRowClick = useCallback(
    (customerId: string) => {
      if (customerId) navigate(`/customer/${customerId}`);
    },
    [navigate]
  );

  const currentStart = useMemo(() => (page - 1) * limit + 1, [page, limit]);
  const currentEnd = useMemo(
    () => Math.min(page * limit, customers?.count || 0),
    [page, limit, customers?.count]
  );

  return (
    <Box pr={5}>
      <ToastContainer />
      <Typography variant='h4' gutterBottom mb={5}>
        Customers
      </Typography>

      {/* Filter Buttons */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <ToggleButtonGroup
          color='primary'
          value={selectedFilter}
          exclusive
          onChange={handleChange}
          aria-label='Filter'
        >
          {FILTER_ARRAY.map((filter) => (
            <ToggleButton key={filter.value} value={filter.value}>
              {filter.status}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {/* Loading State */}
      {isLoading ? (
        <Box
          display='flex'
          justifyContent='center'
          alignItems='center'
          height='200px'
        >
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Box
          display='flex'
          justifyContent='center'
          alignItems='center'
          height='200px'
        >
          <Alert severity='error'>
            Failed to load customers. Please try again later.
          </Alert>
        </Box>
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: (theme) => theme.palette.secondary.main,
                }}
                hover
              >
                {[
                  'First Name',
                  'Last Name',
                  'Level',
                  'Phone',
                  'Email',
                  'Status',
                  'Created At',
                ].map((col) => (
                  <TableCell
                    key={col}
                    sx={{ fontWeight: 'bold', color: 'white' }}
                  >
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {Array.isArray(customers?.data) && customers.data.length > 0 ? (
                customers.data.map((row: any, index: number) => (
                  <TableRow
                    key={row?.id || index}
                    onClick={() => handleRowClick(row?.id)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: '#f5f5f5' },
                    }}
                  >
                    <TableCell>{row?.firstName ?? 'N/A'}</TableCell>
                    <TableCell>{row?.lastName ?? 'N/A'}</TableCell>
                    <TableCell
                      sx={
                        row?.level === LEVELS.LOYAL
                          ? { color: 'maroon', fontWeight: 'bolder' }
                          : {}
                      }
                    >
                      {row?.level ?? 'N/A'}
                    </TableCell>
                    <TableCell>{row?.phone ?? 'N/A'}</TableCell>
                    <TableCell>{row?.email ?? 'N/A'}</TableCell>
                    <TableCell
                      sx={{
                        color:
                          row?.status === 'INACTIVE'
                            ? 'red'
                            : row?.status
                            ? 'green'
                            : 'gray',
                      }}
                    >
                      {row?.status ?? 'N/A'}
                    </TableCell>
                    <TableCell>
                      {row?.createdAt
                        ? new Date(row.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align='center'>
                    No customers available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <Box
            display='flex'
            justifyContent='space-between'
            alignItems='center'
            mt={2}
            py={2}
            px={2}
          >
            <Box flex='1' display='flex' justifyContent='center' ml={20}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color='primary'
              />
            </Box>
            {customers && (
              <Typography variant='body2' sx={{ ml: 3 }}>
                Showing{' '}
                {customers?.data?.length > 0
                  ? `${currentStart}-${currentEnd}`
                  : 0}{' '}
                of {customers?.count || 0} items
              </Typography>
            )}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default Customer;
