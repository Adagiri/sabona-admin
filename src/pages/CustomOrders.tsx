import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Grid,
  CircularProgress,
  IconButton,
  Tooltip,
  ChipProps,
} from '@mui/material';
import { Search, Refresh, ArrowForward, LocationOn } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import CustomOrdersStats from '../components/CustomOrdersStats';
import { useFetchCustomOrders } from '../hooks/Admin/customOrdersHooks';

interface CustomOrder {
  id: string;
  customLaundryName: string;
  customLaundryDescription: string;
  customLaundryAddress?: string;
  status: string;
  adminServiceCharge?: number;
  totalAmount?: number;
  customerPaid: boolean;
  createdAt: string;
  customer: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
}

const CustomOrders: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOrders, setFilteredOrders] = useState<CustomOrder[]>([]);

  const {
    data: customOrdersData,
    isLoading,
    error,
    refetch,
  } = useFetchCustomOrders();

  const customOrders = customOrdersData?.data || [];

  const handleOrderClick = useCallback(
    (orderId: string) => {
      navigate(`/custom-order/${orderId}`);
    },
    [navigate]
  );

  useEffect(() => {
    filterOrders();
  }, [customOrders, searchTerm]);

  const handleRefresh = () => {
    refetch();
  };

  const filterOrders = () => {
    let filtered = customOrders;

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.customLaundryName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          `${order.customer?.firstName} ${order.customer?.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.customer?.email
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  };
type StatusColor = Exclude<ChipProps['color'], undefined>;

const getStatusColor = (status: string): StatusColor => {
  switch (status) {
    case 'PENDING':
      return 'warning';
    case 'ACCEPTED':
      return 'info';
    case 'IN_PROGRESS':
      return 'primary';
    case 'READY_FOR_PICKUP':
      return 'secondary';
    case 'COMPLETED':
      return 'success';
    case 'CANCELLED':
      return 'error';
    default:
      return 'default';
  }
};

const getOrderStatus = (
  order: CustomOrder
): { label: string; color: StatusColor } => {
  if (!order.adminServiceCharge) {
    return { label: 'Needs Pricing', color: 'warning' };
  }
  if (!order.customerPaid && order.adminServiceCharge) {
    return { label: 'Awaiting Payment', color: 'info' };
  }
  if (order.customerPaid && order.status !== 'COMPLETED') {
    return { label: 'In Progress', color: 'primary' };
  }
  return {
    label: order.status.replace('_', ' '),
    color: getStatusColor(order.status),
  };
};

  if (isLoading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        height='50vh'
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        height='50vh'
        flexDirection='column'
      >
        <Typography color='error' gutterBottom>
          Failed to load custom orders
        </Typography>
        <Button onClick={handleRefresh} variant='contained'>
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={3}>
        <Typography variant='h4' gutterBottom fontWeight='bold'>
          Custom Orders
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Overview of all custom laundry orders. Click on any order to manage
          it.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <CustomOrdersStats />

      {/* Search and Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems='center'>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder='Search by order ID, customer name, laundry name, or email...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant='outlined'
              onClick={handleRefresh}
              fullWidth
              startIcon={<Refresh />}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Orders Table */}
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Laundry Location</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align='center'>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.map((order) => {
              const statusInfo = getOrderStatus(order);
              return (
                <TableRow
                  key={order.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleOrderClick(order.id)}
                >
                  <TableCell>
                    <Typography variant='body2' fontWeight='bold'>
                      #{order.id.slice(-8)}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Box>
                      <Typography variant='body2' fontWeight='medium'>
                        {order.customer?.firstName} {order.customer?.lastName}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {order.customer?.email}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box>
                      <Typography variant='body2' fontWeight='medium'>
                        {order.customLaundryName}
                      </Typography>
                      {order.customLaundryAddress && (
                        <Box display='flex' alignItems='center' mt={0.5}>
                          <LocationOn fontSize='small' color='action' />
                          <Typography variant='caption' color='text.secondary'>
                            {order.customLaundryAddress.length > 40
                              ? `${order.customLaundryAddress.slice(0, 40)}...`
                              : order.customLaundryAddress}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={statusInfo.label}
                      color={statusInfo.color}
                      size='small'
                    />
                    {order.customerPaid && (
                      <Chip
                        label='Paid'
                        color='success'
                        size='small'
                        sx={{ ml: 0.5 }}
                      />
                    )}
                  </TableCell>

                  <TableCell>
                    {order.totalAmount ? (
                      <Typography variant='body2' fontWeight='medium'>
                        ${order.totalAmount}
                      </Typography>
                    ) : (
                      <Typography variant='caption' color='text.secondary'>
                        Not set
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell>
                    <Typography variant='body2'>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                  </TableCell>

                  <TableCell align='center'>
                    <Tooltip title='Manage Order'>
                      <IconButton
                        size='small'
                        color='primary'
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOrderClick(order.id);
                        }}
                      >
                        <ArrowForward />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {filteredOrders.length === 0 && !isLoading && (
          <Box p={4} textAlign='center'>
            <Typography color='text.secondary'>
              {searchTerm
                ? 'No custom orders found matching your search criteria'
                : 'No custom orders found'}
            </Typography>
            {searchTerm && (
              <Button
                variant='text'
                onClick={() => setSearchTerm('')}
                sx={{ mt: 1 }}
              >
                Clear Search
              </Button>
            )}
          </Box>
        )}
      </Paper>

      {/* Summary */}
      {filteredOrders.length > 0 && (
        <Box mt={2} textAlign='center'>
          <Typography variant='body2' color='text.secondary'>
            Showing {filteredOrders.length} of {customOrders.length} custom
            orders
            {searchTerm && ` matching "${searchTerm}"`}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default CustomOrders;
