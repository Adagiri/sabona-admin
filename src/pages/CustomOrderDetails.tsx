import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Stack,
} from '@mui/material';
import {
  LocationOn,
  Person,
  Phone,
  Email,
  Assignment,
  Receipt,
  Money,
  LocalShipping,
  Edit,
  Upload,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useFetchCustomOrderById } from '../hooks/Admin/customOrdersHooks';
import CustomOrderDetailsDialog from '../components/CustomOrderDetailsDialog';
import PricingDialog from '../components/PricingDialog';
import DriverAssignmentDialog from '../components/DriverAssignmentDialog';
import ReceiptUploadDialog from '../components/ReceiptUploadDialog';
import { useState } from 'react';

const CustomOrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [pricingDialogOpen, setPricingDialogOpen] = useState(false);
  const [driverDialogOpen, setDriverDialogOpen] = useState(false);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);

  const {
    data: order,
    isLoading,
    isError,
  } = useFetchCustomOrderById(orderId || '');

  console.log(order)

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
          Failed to load custom order details
        </Alert>
        <Button variant='contained' onClick={() => navigate('/custom-orders')}>
          Back to Custom Orders
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

  const getNextAction = () => {
    switch (order.status) {
      case 'PENDING':
        if (!order.adminServiceCharge) return 'Set Pricing';
        if (!order.customerPaid) return 'Awaiting Payment';
        return 'Assign Pickup Driver';
      case 'IN_PROGRESS':
        if (!order.customVendorPaid) return 'Upload Receipt';
        return 'Assign Delivery Driver';
      case 'READY_FOR_PICKUP':
        return 'In Transit';
      default:
        return null;
    }
  };

  const nextAction = getNextAction();

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
            Custom Order #{order.id.slice(-8)}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Custom Laundry Order - Management Dashboard
          </Typography>
        </Box>
        <Button variant='outlined' onClick={() => navigate('/custom-orders')}>
          Back to Custom Orders
        </Button>
      </Box>

      {/* Action Bar */}
      {nextAction && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'warning.light' }}>
          <Box
            display='flex'
            justifyContent='space-between'
            alignItems='center'
          >
            <Typography variant='body1' fontWeight='medium'>
              Next Action Required: {nextAction}
            </Typography>
            <Stack direction='row' spacing={1}>
              {nextAction === 'Set Pricing' && (
                <Button
                  variant='contained'
                  startIcon={<Money />}
                  onClick={() => setPricingDialogOpen(true)}
                >
                  Set Pricing
                </Button>
              )}
              {nextAction === 'Assign Pickup Driver' && (
                <Button
                  variant='contained'
                  startIcon={<Assignment />}
                  onClick={() => setDriverDialogOpen(true)}
                >
                  Assign Driver
                </Button>
              )}
              {nextAction === 'Upload Receipt' && (
                <Button
                  variant='contained'
                  startIcon={<Upload />}
                  onClick={() => setReceiptDialogOpen(true)}
                >
                  Upload Receipt
                </Button>
              )}
            </Stack>
          </Box>
        </Paper>
      )}

      <Grid container spacing={3}>
        {/* Order Status */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant='h6' gutterBottom>
              Order Status & Management
            </Typography>
            <Box display='flex' alignItems='center' gap={2} mb={2}>
              <Chip
                label={order.status}
                color={getStatusColor(order.status)}
                // size='large'
                sx={{ fontSize: '1rem', px: 2, py: 1 }}
              />
              <Chip
                label='Custom Order'
                color='secondary'
                size='small'
                variant='outlined'
              />
              <Typography variant='body2' color='text.secondary'>
                Created: {new Date(order.createdAt).toLocaleString()}
              </Typography>
            </Box>

            {/* Management Actions */}
            <Stack direction='row' spacing={2}>
              <Button
                startIcon={<Edit />}
                onClick={() => setDetailsDialogOpen(true)}
                variant='outlined'
                size='small'
              >
                Edit Details
              </Button>
              <Button
                startIcon={<Money />}
                onClick={() => setPricingDialogOpen(true)}
                variant='outlined'
                size='small'
              >
                Manage Pricing
              </Button>
              <Button
                startIcon={<Assignment />}
                onClick={() => setDriverDialogOpen(true)}
                variant='outlined'
                size='small'
              >
                Assign Drivers
              </Button>
              <Button
                startIcon={<Receipt />}
                onClick={() => setReceiptDialogOpen(true)}
                variant='outlined'
                size='small'
              >
                Manage Receipt
              </Button>
            </Stack>
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
                {order.customer?.firstName} {order.customer?.lastName}
              </Typography>
              <Box display='flex' alignItems='center' gap={1} mt={1}>
                <Phone fontSize='small' color='action' />
                <Typography variant='body2'>{order.customer?.phone}</Typography>
              </Box>
              {order.customer?.email && (
                <Box display='flex' alignItems='center' gap={1} mt={1}>
                  <Email fontSize='small' color='action' />
                  <Typography variant='body2'>
                    {order.customer?.email}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Custom Laundry Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography
              variant='h6'
              gutterBottom
              display='flex'
              alignItems='center'
              gap={1}
            >
              <LocationOn /> Custom Laundry Location
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant='body1' fontWeight='medium'>
                {order.customLaundryName}
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                {order.customLaundryDescription}
              </Typography>
              {order.customLaundryAddress && (
                <Box display='flex' alignItems='center' gap={1} mt={1}>
                  <LocationOn fontSize='small' color='action' />
                  <Typography variant='body2'>
                    {order.customLaundryAddress}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Pricing Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography
              variant='h6'
              gutterBottom
              display='flex'
              alignItems='center'
              gap={1}
            >
              <Money /> Pricing Details
            </Typography>
            <Box sx={{ mt: 2 }}>
              {order.adminServiceCharge ? (
                <>
                  <Box display='flex' justifyContent='space-between' mb={1}>
                    <Typography variant='body2'>Service Charge:</Typography>
                    <Typography variant='body2' fontWeight='medium'>
                      ${order.adminServiceCharge}
                    </Typography>
                  </Box>
                  <Box display='flex' justifyContent='space-between' mb={1}>
                    <Typography variant='body1' fontWeight='medium'>
                      Total Amount:
                    </Typography>
                    <Typography
                      variant='body1'
                      fontWeight='bold'
                      color='primary'
                    >
                      ${order.totalAmount}
                    </Typography>
                  </Box>
                  <Chip
                    label={
                      order.customerPaid
                        ? 'Payment Received'
                        : 'Awaiting Payment'
                    }
                    color={order.customerPaid ? 'success' : 'warning'}
                    size='small'
                    sx={{ mt: 1 }}
                  />
                </>
              ) : (
                <Alert severity='warning' sx={{ mt: 1 }}>
                  Pricing not set. Please set pricing to proceed.
                </Alert>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Vendor Payment Status */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography
              variant='h6'
              gutterBottom
              display='flex'
              alignItems='center'
              gap={1}
            >
              <Receipt /> Vendor Payment
            </Typography>
            <Box sx={{ mt: 2 }}>
              {order.customVendorPaid ? (
                <>
                  <Box display='flex' justifyContent='space-between' mb={1}>
                    <Typography variant='body2'>Vendor:</Typography>
                    <Typography variant='body2' fontWeight='medium'>
                      {order.customVendorName}
                    </Typography>
                  </Box>
                  <Box display='flex' justifyContent='space-between' mb={1}>
                    <Typography variant='body2'>Amount Paid:</Typography>
                    <Typography variant='body2' fontWeight='medium'>
                      ${order.customVendorPaid}
                    </Typography>
                  </Box>
                  <Box display='flex' justifyContent='space-between' mb={1}>
                    <Typography variant='body2'>Payment Method:</Typography>
                    <Typography variant='body2' fontWeight='medium'>
                      {order.customPaymentMethod}
                    </Typography>
                  </Box>
                  <Chip
                    label='Payment Confirmed'
                    color='success'
                    size='small'
                    sx={{ mt: 1 }}
                  />
                </>
              ) : (
                <Alert severity='info'>
                  Driver payment receipt not uploaded yet.
                </Alert>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Driver Assignments */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography
              variant='h6'
              gutterBottom
              display='flex'
              alignItems='center'
              gap={1}
            >
              <LocalShipping /> Driver Assignments
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              {/* Pickup Driver */}
              <Grid item xs={12} md={6}>
                <Typography variant='subtitle1' gutterBottom>
                  Pickup Driver
                </Typography>
                {order.riderOrders?.find(
                  (ro: any) => ro.type === 'RIDER_PICKUP'
                ) ? (
                  <Box>
                    <Typography variant='body2' fontWeight='medium'>
                      {
                        order.riderOrders.find(
                          (ro: any) => ro.type === 'RIDER_PICKUP'
                        ).rider?.firstName
                      }{' '}
                      {
                        order.riderOrders.find(
                          (ro: any) => ro.type === 'RIDER_PICKUP'
                        ).rider?.lastName
                      }
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {
                        order.riderOrders.find(
                          (ro: any) => ro.type === 'RIDER_PICKUP'
                        ).rider?.phone
                      }
                    </Typography>
                    <Chip
                      label='Assigned'
                      color='success'
                      size='small'
                      sx={{ mt: 1 }}
                    />
                  </Box>
                ) : (
                  <Alert severity='warning' sx={{ mt: 1 }}>
                    No pickup driver assigned
                  </Alert>
                )}
              </Grid>

              {/* Delivery Driver */}
              <Grid item xs={12} md={6}>
                <Typography variant='subtitle1' gutterBottom>
                  Delivery Driver
                </Typography>
                {order.riderOrders?.find(
                  (ro: any) => ro.type === 'RIDER_DELIVERY'
                ) ? (
                  <Box>
                    <Typography variant='body2' fontWeight='medium'>
                      {
                        order.riderOrders.find(
                          (ro: any) => ro.type === 'RIDER_DELIVERY'
                        ).rider?.firstName
                      }{' '}
                      {
                        order.riderOrders.find(
                          (ro: any) => ro.type === 'RIDER_DELIVERY'
                        ).rider?.lastName
                      }
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {
                        order.riderOrders.find(
                          (ro: any) => ro.type === 'RIDER_DELIVERY'
                        ).rider?.phone
                      }
                    </Typography>
                    <Chip
                      label='Assigned'
                      color='success'
                      size='small'
                      sx={{ mt: 1 }}
                    />
                  </Box>
                ) : (
                  <Alert severity='info' sx={{ mt: 1 }}>
                    No delivery driver assigned yet
                  </Alert>
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Management Dialogs */}
      <CustomOrderDetailsDialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        order={order}
        // onUpdate={refetch}
      />

      <PricingDialog
        open={pricingDialogOpen}
        onClose={() => setPricingDialogOpen(false)}
        order={order}
        // onUpdate={refetch}
      />

      <DriverAssignmentDialog
        open={driverDialogOpen}
        onClose={() => setDriverDialogOpen(false)}
        order={order}
        // onUpdate={refetch}
      />

      <ReceiptUploadDialog
        open={receiptDialogOpen}
        onClose={() => setReceiptDialogOpen(false)}
        order={order}
        // onUpdate={refetch}
      />
    </Box>
  );
};

export default CustomOrderDetails;
