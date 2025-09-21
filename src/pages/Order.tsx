import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  IconButton,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Card,
  CardContent,
  Grid,
  Tooltip,
  Button,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Visibility,
  Search,
  Download,
  Refresh,
  MoreVert,
  Person,
  Phone,
  LocationOn,
  AttachMoney,
  Assignment,
  LocalLaundryService,
} from '@mui/icons-material';
import { useFetchAllOrders } from '../hooks/Admin/query';
import {
  ORDER_STATUSES,
  ORDER_STATUSES_ARRAY,
  Order,
} from '../hooks/Admin/interface';
import { ToastContainer, toast } from 'react-toastify';
import {
  navigateToOrderDetails,
  getOrderTypeLabel,
  getOrderTypeBadgeColor,
} from '../utils/orderNavigation';

const OrderPage = () => {
  const navigate = useNavigate();
  const { pageNumber, orderStatus } = useParams<{
    pageNumber: string;
    orderStatus: string;
  }>();

  // State management
  const [selectedStatus, setSelectedStatus] = useState<ORDER_STATUSES>(
    (orderStatus as ORDER_STATUSES) || ORDER_STATUSES.PENDING
  );
  const [page, setPage] = useState<number>(Number(pageNumber) || 1);
  const [searchTerm, setSearchTerm] = useState('');
  const [limit] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // API data fetching
  const {
    data: orders,
    refetch: refetchOrders,
    error,
    isError,
    isLoading,
    isRefetching,
  } = useFetchAllOrders({
    type: selectedStatus,
    page,
    limit,
    column: 'createdAt',
    direction: 'DESC',
  });

  // Computed values
  const totalPages = useMemo(
    () => Math.ceil((orders?.count ?? 0) / limit),
    [orders?.count, limit]
  );
  const currentStart = useMemo(() => (page - 1) * limit + 1, [page, limit]);
  const currentEnd = useMemo(
    () => Math.min(page * limit, orders?.count || 0),
    [page, limit, orders?.count]
  );

  // Filter orders by search term
  const filteredOrders = useMemo(() => {
    if (!orders?.data || !searchTerm) return orders?.data || [];

    return orders.data.filter((order: Order) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        order.id.toLowerCase().includes(searchLower) ||
        `${order.user.firstName} ${order.user.lastName}`
          .toLowerCase()
          .includes(searchLower) ||
        order.user.phone.includes(searchTerm) ||
        (order.laundry?.name || '').toLowerCase().includes(searchLower)
      );
    });
  }, [orders?.data, searchTerm]);

  // Event handlers
  const handleStatusChange = useCallback(
    (_: React.MouseEvent<HTMLElement>, newStatus: ORDER_STATUSES) => {
      if (newStatus !== null) {
        setSelectedStatus(newStatus);
        setPage(1);
        navigate(`/order/1/${newStatus}`);
      }
    },
    [navigate]
  );

  const handlePageChange = useCallback(
    (_: React.ChangeEvent<unknown>, value: number) => {
      setPage(value);
      navigate(`/order/${value}/${selectedStatus}`);
    },
    [navigate, selectedStatus]
  );

  const handleOrderClick = useCallback(
    (order: Order) => {
      // Use orderType if available, otherwise default to REGISTERED_LAUNDRY
      const orderType = (order as any).orderType || 'REGISTERED_LAUNDRY';
      navigateToOrderDetails(navigate, order.id, orderType);
    },
    [navigate]
  );

  const handleRefresh = useCallback(() => {
    refetchOrders();
  }, [refetchOrders]);

  const handleExport = useCallback(() => {
    // Implementation for export functionality
    toast.info('Export functionality will be implemented');
  }, []);

  const showError = useCallback((errorMessage: string) => {
    toast.error(errorMessage);
  }, []);

  // Effects
  useEffect(() => {
    if (error) {
      showError(
        (error as any)?.response?.data?.message || 'Failed to fetch orders'
      );
    }
  }, [error, showError]);

  useEffect(() => {
    refetchOrders();
  }, [selectedStatus, page, refetchOrders]);

  // Utility functions
  const getStatusColor = (status: string) => {
    const statusColors: Record<
      string,
      | 'default'
      | 'primary'
      | 'secondary'
      | 'error'
      | 'info'
      | 'success'
      | 'warning'
    > = {
      PENDING: 'warning',
      PENDING_PAYMENT: 'info',
      ACCEPTED: 'primary',
      IN_PROGRESS: 'secondary',
      READY_FOR_PICKUP: 'info',
      COMPLETED: 'success',
      CANCELLED: 'error',
      REJECTED: 'error',
    };
    return statusColors[status] || 'default';
  };

  const formatCurrency = (amount: number) => `${amount.toFixed(2)} SAR`;

  if (isLoading && !isRefetching) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='60vh'
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (isError && !orders) {
    return (
      <Box p={4}>
        <Alert severity='error'>Failed to load orders. Please try again.</Alert>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <ToastContainer position='top-right' />

      {/* Header */}
      <Stack
        direction='row'
        justifyContent='space-between'
        alignItems='center'
        mb={3}
      >
        <Typography variant='h4' fontWeight='bold'>
          Order Management
        </Typography>
        <Stack direction='row' spacing={2}>
          <Button
            variant='outlined'
            startIcon={<Download />}
            onClick={handleExport}
          >
            Export
          </Button>
          <Button
            variant='outlined'
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={isRefetching}
          >
            {isRefetching ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Stack>
      </Stack>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack
                direction='row'
                alignItems='center'
                justifyContent='space-between'
              >
                <Box>
                  <Typography color='text.secondary' gutterBottom>
                    Total Orders
                  </Typography>
                  <Typography variant='h4' fontWeight='bold'>
                    {orders?.count || 0}
                  </Typography>
                </Box>
                <Assignment color='primary' fontSize='large' />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack
                direction='row'
                alignItems='center'
                justifyContent='space-between'
              >
                <Box>
                  <Typography color='text.secondary' gutterBottom>
                    Selected Status
                  </Typography>
                  <Typography variant='h6' fontWeight='bold'>
                    {
                      ORDER_STATUSES_ARRAY.find(
                        (s) => s.value === selectedStatus
                      )?.status
                    }
                  </Typography>
                </Box>
                <AttachMoney color='success' fontSize='large' />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack
                direction='row'
                alignItems='center'
                justifyContent='space-between'
              >
                <Box>
                  <Typography color='text.secondary' gutterBottom>
                    Showing Results
                  </Typography>
                  <Typography variant='h6' fontWeight='bold'>
                    {filteredOrders.length > 0
                      ? `${currentStart}-${currentEnd}`
                      : 0}
                  </Typography>
                </Box>
                <LocalLaundryService color='info' fontSize='large' />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack
                direction='row'
                alignItems='center'
                justifyContent='space-between'
              >
                <Box>
                  <Typography color='text.secondary' gutterBottom>
                    Search Results
                  </Typography>
                  <Typography variant='h6' fontWeight='bold'>
                    {filteredOrders.length}
                  </Typography>
                </Box>
                <Search color='secondary' fontSize='large' />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems='center'
        >
          <TextField
            placeholder='Search orders...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />

          <ToggleButtonGroup
            value={selectedStatus}
            exclusive
            onChange={handleStatusChange}
            size='small'
            sx={{ flexWrap: 'wrap' }}
          >
            {ORDER_STATUSES_ARRAY.map((status) => (
              <ToggleButton key={status.value} value={status.value}>
                {status.status}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>
      </Paper>

      {/* Orders Table */}
      <Paper>
        {isRefetching && (
          <Box display='flex' justifyContent='center' p={2}>
            <CircularProgress size={24} />
          </Box>
        )}

        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Order Info</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Laundry</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Pickup Info</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders && filteredOrders.length > 0 ? (
              filteredOrders.map((order: Order) => (
                <TableRow
                  key={order.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleOrderClick(order)}
                >
                  <TableCell>
                    <Stack direction='column' spacing={0.5}>
                      <Typography variant='body2' fontWeight='bold'>
                        #{order.id.slice(-8)}
                      </Typography>
                      <Chip
                        label={getOrderTypeLabel(
                          (order as any).orderType || 'REGISTERED_LAUNDRY'
                        )}
                        color={getOrderTypeBadgeColor(
                          (order as any).orderType || 'REGISTERED_LAUNDRY'
                        )}
                        size='small'
                      />
                      <Typography variant='caption' color='text.secondary'>
                        {new Date().toLocaleDateString()}
                      </Typography>
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Stack direction='column' spacing={0.5}>
                      <Stack direction='row' alignItems='center' spacing={0.5}>
                        <Person fontSize='small' color='action' />
                        <Typography variant='body2' fontWeight='medium'>
                          {order.user.firstName} {order.user.lastName}
                        </Typography>
                      </Stack>
                      <Stack direction='row' alignItems='center' spacing={0.5}>
                        <Phone fontSize='small' color='action' />
                        <Typography variant='caption' color='text.secondary'>
                          {order.user.phone}
                        </Typography>
                      </Stack>
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Stack direction='column' spacing={0.5}>
                      <Typography variant='body2' fontWeight='medium'>
                        {order.laundry?.name || 'N/A'}
                      </Typography>
                      {order.laundry?.vendor?.phone && (
                        <Typography variant='caption' color='text.secondary'>
                          Vendor: {order.laundry.vendor.phone}
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={order.status}
                      color={getStatusColor(order.status)}
                      size='small'
                    />
                  </TableCell>

                  <TableCell>
                    <Stack direction='column' spacing={0.5}>
                      <Typography variant='body2' fontWeight='bold'>
                        {formatCurrency(order.totalAmount)}
                      </Typography>
                      {order.totalQuantity && (
                        <Typography variant='caption' color='text.secondary'>
                          {order.totalQuantity} items
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Stack direction='column' spacing={0.5}>
                      {order.pickup?.pickupAddress && (
                        <Stack
                          direction='row'
                          alignItems='center'
                          spacing={0.5}
                        >
                          <LocationOn fontSize='small' color='action' />
                          <Typography variant='caption' noWrap>
                            {order.pickup.pickupAddress.substring(0, 25)}...
                          </Typography>
                        </Stack>
                      )}
                      {order.pickup?.rider && (
                        <Typography variant='caption' color='text.secondary'>
                          Rider: {order.pickup.rider.firstName}
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Stack direction='row' spacing={1}>
                      <Tooltip title='View Details'>
                        <IconButton
                          size='small'
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOrderClick(order);
                          }}
                        >
                          <Visibility fontSize='small' />
                        </IconButton>
                      </Tooltip>

                      <IconButton
                        size='small'
                        onClick={(e) => {
                          e.stopPropagation();
                          setAnchorEl(e.currentTarget);
                        }}
                      >
                        <MoreVert fontSize='small' />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align='center' sx={{ py: 4 }}>
                  <Typography color='text.secondary'>
                    {searchTerm
                      ? 'No orders found matching your search'
                      : 'No orders found'}
                  </Typography>
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
          p={2}
        >
          <Typography variant='body2' color='text.secondary'>
            Showing{' '}
            {filteredOrders.length > 0 ? `${currentStart}-${currentEnd}` : 0} of{' '}
            {orders?.count || 0} orders
          </Typography>

          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color='primary'
            showFirstButton
            showLastButton
          />
        </Box>
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => setAnchorEl(null)}>Edit Order</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Send Notification</MenuItem>
        <Divider />
        <MenuItem
          onClick={() => setAnchorEl(null)}
          sx={{ color: 'error.main' }}
        >
          Cancel Order
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default OrderPage;
