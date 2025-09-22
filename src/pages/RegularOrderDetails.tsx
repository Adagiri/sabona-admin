
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import {
  LocationOn,
  Person,
  Phone,
  Email,
  LocalShipping,
  Business,
  AccessTime,
  Receipt,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useFetchOrderDetails } from '../hooks/Admin/query';

const RegularOrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const {
    data: order,
    isLoading,
    isError,
  } = useFetchOrderDetails(orderId || '');

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

  if (isError || !order) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        height='50vh'
        flexDirection='column'
      >
        <Alert severity='error' sx={{ mb: 2 }}>
          Failed to load order details
        </Alert>
        <Button variant='contained' onClick={() => navigate('/order')}>
          Back to Orders
        </Button>
      </Box>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      case 'IN_PROGRESS':
        return 'warning';
      case 'PENDING':
        return 'default';
      default:
        return 'primary';
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto' }}>
      {/* Header */}
      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        mb={3}
      >
        <Box>
          <Typography variant='h4' gutterBottom>
            Order #{order.id.slice(-8)}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Regular Laundry Order - Tracking Details
          </Typography>
        </Box>
        <Button variant='outlined' onClick={() => navigate('/order')}>
          Back to Orders
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Order Status */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant='h6' gutterBottom>
              Order Status
            </Typography>
            <Box display='flex' alignItems='center' gap={2}>
              <Chip
                label={order.status}
                color={getStatusColor(order.status)}
                sx={{ fontSize: '1rem', px: 2, py: 1 }}
              />
              <Typography variant='body2' color='text.secondary'>
                Created: {new Date(order.createdAt).toLocaleString()}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Customer Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography
              variant='h6'
              gutterBottom
              display='flex'
              alignItems='center'
              gap={1}
            >
              <Person /> Customer Information
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant='body1' fontWeight='medium'>
                {order.user?.firstName} {order.user?.lastName}
              </Typography>
              <Box display='flex' alignItems='center' gap={1} mt={1}>
                <Phone fontSize='small' color='action' />
                <Typography variant='body2'>{order.user?.phone}</Typography>
              </Box>
              {order.user?.email && (
                <Box display='flex' alignItems='center' gap={1} mt={1}>
                  <Email fontSize='small' color='action' />
                  <Typography variant='body2'>{order.user?.email}</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Laundry Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography
              variant='h6'
              gutterBottom
              display='flex'
              alignItems='center'
              gap={1}
            >
              <Business /> Laundry Service
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant='body1' fontWeight='medium'>
                {order.laundry?.name}
              </Typography>
              {order.laundry?.vendor?.phone && (
                <Box display='flex' alignItems='center' gap={1} mt={1}>
                  <Phone fontSize='small' color='action' />
                  <Typography variant='body2'>
                    {order.laundry?.vendor?.phone}
                  </Typography>
                </Box>
              )}
              <Chip
                label='Registered Laundry'
                color='primary'
                size='small'
                variant='outlined'
                sx={{ mt: 1 }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Pickup Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography
              variant='h6'
              gutterBottom
              display='flex'
              alignItems='center'
              gap={1}
            >
              <LocalShipping /> Pickup Details
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box display='flex' alignItems='center' gap={1} mb={1}>
                <LocationOn fontSize='small' color='action' />
                <Typography variant='body2'>
                  {order.pickup?.pickupAddress}
                </Typography>
              </Box>
              <Box display='flex' alignItems='center' gap={1} mb={1}>
                <AccessTime fontSize='small' color='action' />
                <Typography variant='body2'>
                  {order.pickup?.pickupDate} at {order.pickup?.pickupTime}
                </Typography>
              </Box>
              {order.pickup?.rider && (
                <Typography variant='body2' color='text.secondary'>
                  Driver: {order.pickup.rider.firstName}{' '}
                  {order.pickup.rider.lastName}
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Delivery Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography
              variant='h6'
              gutterBottom
              display='flex'
              alignItems='center'
              gap={1}
            >
              <LocalShipping /> Delivery Details
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box display='flex' alignItems='center' gap={1} mb={1}>
                <LocationOn fontSize='small' color='action' />
                <Typography variant='body2'>
                  {order.delivery?.deliveryAddress}
                </Typography>
              </Box>
              <Typography variant='body2' color='text.secondary'>
                Type: {order.delivery?.deliveryType}
              </Typography>
              {order.delivery?.rider && (
                <Typography variant='body2' color='text.secondary'>
                  Driver: {order.delivery.rider.firstName}{' '}
                  {order.delivery.rider.lastName}
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography
              variant='h6'
              gutterBottom
              display='flex'
              alignItems='center'
              gap={1}
            >
              <Receipt /> Order Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {/* Services Table */}
            {order.services && order.services.length > 0 && (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Service</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell align='right'>Quantity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.services.map((service: any, serviceIndex: number) =>
                    service.items?.map((item: any, itemIndex: number) => (
                      <TableRow key={`${serviceIndex}-${itemIndex}`}>
                        <TableCell>{service.name || 'Service'}</TableCell>
                        <TableCell>{item.name || 'Item'}</TableCell>
                        <TableCell align='right'>{item.quantity}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}

            <Divider sx={{ my: 2 }} />

            {/* Pricing */}
            <Box
              display='flex'
              justifyContent='space-between'
              alignItems='center'
            >
              <Typography variant='h6'>Total Amount</Typography>
              <Typography variant='h6' color='primary' fontWeight='bold'>
                ${order.totalAmount}
              </Typography>
            </Box>

            {order.coupon && (
              <Box
                display='flex'
                justifyContent='space-between'
                alignItems='center'
                mt={1}
              >
                <Typography variant='body2' color='text.secondary'>
                  Coupon Applied: {order.coupon.code}
                </Typography>
                <Typography variant='body2' color='success.main'>
                  Discount Applied
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RegularOrderDetails;
