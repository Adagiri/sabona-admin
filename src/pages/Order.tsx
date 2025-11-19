// File: src/pages/Order.tsx
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
  Chip,
} from '@mui/material';
import { useFetchAllOrders } from '../hooks/Admin/query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ORDER_STATUSES, ORDER_STATUSES_ARRAY } from '../hooks/Admin/interface';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';

const Order = () => {
  const params = useParams();
  const { pageNumber } = useParams<{ pageNumber: string }>();
  const [selectedStatus, setSelectedStatus] = useState<ORDER_STATUSES>(
    params?.orderStatus
      ? (params?.orderStatus as ORDER_STATUSES)
      : ORDER_STATUSES.PENDING
  );
  const [limit] = useState(10);
  const [page, setPage] = useState<number>(Number(pageNumber) || 1);
  const navigate = useNavigate();

  // UPDATED: Add orderType filter to only show REGISTERED_LAUNDRY orders
  const {
    data: orders,
    refetch: refetchOrders,
    error,
    isError,
    isLoading,
    isRefetching,
  } = useFetchAllOrders({
    type: selectedStatus,
    orderType: 'REGISTERED_LAUNDRY',
    page,
    limit,
    column: 'createdAt',
    direction: 'DESC',
  });

  const currentStart = useMemo(() => (page - 1) * limit + 1, [page, limit]);
  const currentEnd = useMemo(
    () => Math.min(page * limit, orders?.count || 0),
    [page, limit, orders?.count]
  );

  useEffect(() => {
    if (error) {
      showError((error as any)?.response?.data?.message);
    }
  }, [error]);

  const showError = useCallback((errorMessage: string) => {
    toast(errorMessage, { type: 'error' });
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
    [navigate]
  );

  const totalPages = useMemo(
    () => Math.ceil((orders?.count ?? 0) / limit),
    [orders, limit]
  );

  const handleNavigateToCoupon = useCallback(
    (id: string) => {
      navigate('/voucherUsage/' + id);
    },
    [navigate]
  );

  // Navigate to full order details page
  const handleOrderClick = useCallback(
    (orderId: string) => {
      navigate(`/order-details/${orderId}`);
    },
    [navigate]
  );

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
    [navigate, selectedStatus]
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
        width: 'calc(100% - 80px)',
      }}
    >
      <ToastContainer />

      {/* UPDATED: Header to clarify this is for regular orders only */}
      <Typography variant='h4' gutterBottom mb={5}>
        Regular Orders
      </Typography>
      <Typography variant='body2' color='text.secondary' gutterBottom mb={3}>
        Tracking and management for registered laundry orders
      </Typography>

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
          value={selectedStatus}
          exclusive
          onChange={handleChange}
          aria-label='Platform'
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
            Failed to load orders. Please try again later.
          </Alert>
        </Box>
      ) : (
        <Box
          className='order-table'
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Paper
            className='table-container'
            sx={{ overflow: 'auto', width: 'auto' }}
          >
            <Table>
              <TableHead>
                <TableRow hover selected>
                  {[
                    'Order Id',
                    'Order Type', // NEW: Show order type
                    'Ordered By',
                    'Laundry',
                    'Status',
                    'Total Amount',
                    ...(selectedStatus === ORDER_STATUSES.READY_FOR_PICKUP
                      ? ['Customer Number', 'Customer Location']
                      : []),
                    ...(selectedStatus === ORDER_STATUSES.PENDING
                      ? ['Vendor Number']
                      : []),
                    'Action',
                  ].map((header) => (
                    <TableCell key={header}>{header}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {orders?.data?.map((order: any) => (
                  <TableRow
                    key={order.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleOrderClick(order.id)}
                  >
                    <TableCell>{order.id}</TableCell>

                    {/* NEW: Show order type with chip */}
                    <TableCell>
                      <Chip
                        label='Regular'
                        color='primary'
                        size='small'
                        variant='outlined'
                      />
                    </TableCell>

                    <TableCell>
                      {order.user?.firstName} {order.user?.lastName}
                    </TableCell>

                    <TableCell>{order.laundry?.name || 'N/A'}</TableCell>

                    <TableCell>
                      <Chip
                        label={order.status}
                        color={
                          order.status === 'COMPLETED' ? 'success' : 'warning'
                        }
                        size='small'
                      />
                    </TableCell>

                    <TableCell>${order.totalAmount}</TableCell>

                    {/* Conditional columns based on status */}
                    {selectedStatus === ORDER_STATUSES.READY_FOR_PICKUP && (
                      <>
                        <TableCell>{order.user?.phone}</TableCell>
                        <TableCell>{order.pickup?.pickupAddress}</TableCell>
                      </>
                    )}

                    {selectedStatus === ORDER_STATUSES.PENDING && (
                      <TableCell>{order.laundry?.vendor?.phone}</TableCell>
                    )}

                    <TableCell>
                      {order.coupon && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNavigateToCoupon(order.coupon.id);
                          }}
                        >
                          View Coupon
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Box>
      )}

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color='primary'
        />
      </Box>

      {/* Summary */}
      <Typography
        variant='body2'
        color='text.secondary'
        sx={{ mt: 2, textAlign: 'center' }}
      >
        Showing {currentStart}-{currentEnd} of {orders?.count || 0} regular
        orders
      </Typography>
    </Box>
  );
};

export default Order;
