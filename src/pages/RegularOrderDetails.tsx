// src/pages/RegularOrderDetails.tsx

import { useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
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
  Cancel,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useFetchOrderDetails } from '../hooks/Admin/query';
import { toast } from 'react-toastify';
import { useCancelOrder } from '../hooks/Admin/mutations/customOrders';

const RegularOrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  // Cancel dialog state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [refundCustomer, setRefundCustomer] = useState(false);
  const cancelMutation = useCancelOrder();

  const {
    data: order,
    isLoading,
    isError,
  } = useFetchOrderDetails(orderId || '');
  

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }

    try {
      await cancelMutation.mutateAsync({
        orderId: orderId!,
        reason: cancelReason,
        refundCustomer,
      });
      setCancelDialogOpen(false);
      setCancelReason('');
      setRefundCustomer(false);
    } catch (error) {
      console.error('Failed to cancel order:', error);
    }
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
        <Box display='flex' gap={2}>
          {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
            <Button
              variant='outlined'
              color='error'
              startIcon={<Cancel />}
              onClick={() => setCancelDialogOpen(true)}
            >
              Cancel Order
            </Button>
          )}
          <Button variant='outlined' onClick={() => navigate('/order')}>
            Back to Orders
          </Button>
        </Box>
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
              <Box display='flex' alignItems='center' gap={1} mb={1}>
                <LocalShipping fontSize='small' color='action' />
                <Box>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    display='block'
                  >
                    Delivery Type
                  </Typography>
                  <Chip
                    label={order.deliveryType || 'NORMAL'}
                    size='small'
                    color={
                      order.deliveryType === 'EXPRESS' ? 'error' : 'primary'
                    }
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Box>
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
                    <TableCell>Item</TableCell>
                    <TableCell align='right'>Price</TableCell>
                    <TableCell align='right'>Quantity</TableCell>
                    <TableCell align='right'>Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.services.map((service: any) => (
                    <>
                      {service.items && service.items.length > 0 ? (
                        service.items.map((item: any, itemIndex: number) => (
                          <TableRow key={`${service.id}-${itemIndex}`}>
                            <TableCell>
                              {service.laundryService?.name || 'Service'}
                            </TableCell>
                            <TableCell>
                              {item.laundryServiceItem?.name || 'Item'}
                            </TableCell>
                            <TableCell align='right'>
                              $
                              {item.laundryServiceItem?.platformPrice?.toFixed(
                                2
                              ) || '0.00'}
                            </TableCell>
                            <TableCell align='right'>{item.quantity}</TableCell>
                            <TableCell align='right'>
                              $
                              {(
                                (item.laundryServiceItem?.platformPrice || 0) *
                                item.quantity
                              ).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow key={service.id}>
                          <TableCell>
                            {service.laundryService?.name || 'Service'}
                          </TableCell>
                          <TableCell colSpan={4}>
                            <Typography variant='body2' color='text.secondary'>
                              No items found
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            )}

            {(!order.services || order.services.length === 0) && (
              <Alert severity='info'>No service items in this order</Alert>
            )}

            <Divider sx={{ my: 2 }} />

            {/* Pricing */}
            <Box>
              {order.baseAmount && (
                <Box
                  display='flex'
                  justifyContent='space-between'
                  alignItems='center'
                  mb={1}
                >
                  <Typography variant='body1'>Base Amount</Typography>
                  <Typography variant='body1'>
                    ${order.baseAmount.toFixed(2)}
                  </Typography>
                </Box>
              )}

              {order.discountAmount && order.discountAmount > 0 && (
                <Box
                  display='flex'
                  justifyContent='space-between'
                  alignItems='center'
                  mb={1}
                >
                  <Typography variant='body1' color='success.main'>
                    Discount {order.coupon && `(${order.coupon.code})`}
                  </Typography>
                  <Typography variant='body1' color='success.main'>
                    -${order.discountAmount.toFixed(2)}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 1 }} />

              <Box
                display='flex'
                justifyContent='space-between'
                alignItems='center'
              >
                <Typography variant='h6'>Total Amount</Typography>
                <Typography variant='h6' color='primary' fontWeight='bold'>
                  ${order.totalAmount.toFixed(2)}
                </Typography>
              </Box>

              {order.paid && (
                <Box display='flex' justifyContent='flex-end' mt={1}>
                  <Chip label='Paid' color='success' size='small' />
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Additional Notes */}
        {order.notes && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant='h6' gutterBottom>
                Order Notes
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {order.notes}
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Cancel Order Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Cancel Order</DialogTitle>
        <DialogContent>
          <Alert severity='warning' sx={{ mb: 2 }}>
            This action will cancel the order. The customer will be notified.
          </Alert>

          <TextField
            label='Cancellation Reason'
            multiline
            rows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            fullWidth
            required
            sx={{ mb: 2, mt: 1 }}
            placeholder='Enter reason for cancellation...'
          />

          {order.paid && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={refundCustomer}
                  onChange={(e) => setRefundCustomer(e.target.checked)}
                />
              }
              label='Refund customer payment'
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCancelOrder}
            variant='contained'
            color='error'
            disabled={cancelMutation.isPending || !cancelReason.trim()}
          >
            {cancelMutation.isPending ? (
              <CircularProgress size={20} />
            ) : (
              'Confirm Cancellation'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RegularOrderDetails;
