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
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
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
  Upload,
  ContentCopy,
  OpenInNew,
  WhatsApp,
  Sms,
  Launch,
  Schedule,
  Business,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useFetchCustomOrderById } from '../hooks/Admin/customOrdersHooks';
import DriverAssignmentDialog from '../components/DriverAssignmentDialog';
import ReceiptUploadDialog from '../components/ReceiptUploadDialog';
import { useState } from 'react';
import DeliveryDriverAssignmentDialog from '../components/DeliveryDriverAssignmentDialog';
import { toast } from 'react-toastify';
import { Cancel } from '@mui/icons-material';
import {
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  useCancelCustomOrder,
  useRegeneratePaymentLink,
} from '../hooks/Admin/mutations/customOrders';
import { Refresh } from '@mui/icons-material';

/**
 * Get contextual actions based on order state
 * Returns only the actions that are relevant for the current order status
 */
const getContextualActions = (
  order: any,
  setDriverDialogOpen: (open: boolean) => void,
  setReceiptDialogOpen: (open: boolean) => void,
  setDeliveryDriverDialogOpen: (open: boolean) => void
) => {
  const actions: Array<{
    label: string;
    icon: any;
    onClick: () => void;
    color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
    disabled?: boolean;
  }> = [];

  // PENDING: Need to assign pickup driver
  if (order.status === 'PENDING') {
    actions.push({
      label: 'Assign Pickup Driver',
      icon: Assignment,
      onClick: () => setDriverDialogOpen(true),
      color: 'primary',
    });
  }

  // IN_PROGRESS: Different actions based on progress
  if (order.status === 'IN_PROGRESS') {
    // Receipt not uploaded yet
    if (!order.customVendorReceipt && !order.customVendorPaid) {
      actions.push({
        label: 'Upload Receipt',
        icon: Upload,
        onClick: () => setReceiptDialogOpen(true),
        color: 'warning',
      });
    }

    // Receipt uploaded but customer hasn't paid
    else if (order.customVendorPaid && !order.customerPaid) {
      actions.push({
        label: 'Awaiting Customer Payment',
        icon: Receipt,
        onClick: () => {}, // No action - just showing status
        color: 'info',
        disabled: true,
      });
    }

    // Receipt uploaded AND customer paid - ready for delivery assignment
    else if (order.customVendorPaid && order.customerPaid) {
      actions.push({
        label: 'Assign Delivery Driver',
        icon: LocalShipping,
        onClick: () => setDeliveryDriverDialogOpen(true),
        color: 'success',
      });
    }
  }

  // READY_FOR_PICKUP: Show in-transit status
  if (order.status === 'READY_FOR_PICKUP') {
    actions.push({
      label: 'In Transit',
      icon: LocalShipping,
      onClick: () => {}, // No action - just showing status
      color: 'info',
      disabled: true,
    });
  }

  return actions;
};

const CustomOrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [driverDialogOpen, setDriverDialogOpen] = useState(false);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [deliveryDriverDialogOpen, setDeliveryDriverDialogOpen] =
    useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [refundCustomer, setRefundCustomer] = useState(false);
  const cancelMutation = useCancelCustomOrder();
  const regeneratePaymentLinkMutation = useRegeneratePaymentLink();

  const {
    data: order,
    isLoading,
    isError,
  } = useFetchCustomOrderById(orderId || '');

  // Helper functions
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const openMap = (lat: number, lng: number) => {
    const url = `https://maps.google.com/maps?q=${lat},${lng}&z=15&ll=${lat},${lng}`;
    window.open(url, '_blank');
  };

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

  // Check if payment link can be regenerated
  const canRegeneratePaymentLink = () => {
    if (!order?.payTabsInvoiceDateCreated || order.customerPaid) {
      return false;
    }

    const now = new Date();
    const linkCreatedAt = new Date(order.payTabsInvoiceDateCreated);
    const timeDifferenceInMinutes =
      (now.getTime() - linkCreatedAt.getTime()) / (1000 * 60);

    return timeDifferenceInMinutes >= 20;
  };

  // Get remaining time until regeneration is allowed
  const getRemainingTime = () => {
    if (!order?.payTabsInvoiceDateCreated) {
      return 0;
    }

    const now = new Date();
    const linkCreatedAt = new Date(order.payTabsInvoiceDateCreated);
    const timeDifferenceInMinutes =
      (now.getTime() - linkCreatedAt.getTime()) / (1000 * 60);
    const remainingMinutes = Math.max(
      0,
      Math.ceil(20 - timeDifferenceInMinutes)
    );

    return remainingMinutes;
  };

  const handleRegeneratePaymentLink = async () => {
    if (!canRegeneratePaymentLink()) {
      const remainingMinutes = getRemainingTime();
      toast.error(
        `Payment link can only be regenerated after 20 minutes. Please wait ${remainingMinutes} more minute(s)`
      );
      return;
    }

    try {
      await regeneratePaymentLinkMutation.mutateAsync(orderId!);
    } catch (error) {
      console.error('Failed to regenerate payment link:', error);
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

      {/* Contextual Action Bar */}
      {(() => {
        const contextualActions = getContextualActions(
          order,
          setDriverDialogOpen,
          setReceiptDialogOpen,
          setDeliveryDriverDialogOpen
        );

        if (contextualActions.length === 0) return null;

        return (
          <Paper sx={{ p: 2, mb: 3, bgcolor: '#eee' }}>
            <Box
              display='flex'
              justifyContent='space-between'
              alignItems='center'
            >
              <Box>
                <Typography
                  variant='body1'
                  fontWeight='bold'
                  color='primary.dark'
                >
                  {contextualActions[0].disabled
                    ? 'Current Status'
                    : 'Action Required'}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {contextualActions[0].label}
                </Typography>
              </Box>
              <Stack direction='row' spacing={1}>
                {contextualActions.map((action, index) => (
                  <Button
                    key={index}
                    variant='contained'
                    color={action.color || 'primary'}
                    startIcon={<action.icon />}
                    onClick={action.onClick}
                    disabled={action.disabled}
                  >
                    {action.label}
                  </Button>
                ))}
              </Stack>
            </Box>
          </Paper>
        );
      })()}

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
                startIcon={<Receipt />}
                onClick={() => setReceiptDialogOpen(true)}
                variant='outlined'
                size='small'
              >
                View/Upload Receipt
              </Button>

              {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
                <Button
                  startIcon={<Cancel />}
                  onClick={() => setCancelDialogOpen(true)}
                  variant='outlined'
                  color='error'
                  size='small'
                >
                  Cancel Order
                </Button>
              )}
            </Stack>
          </Paper>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography
              variant='h6'
              gutterBottom
              display='flex'
              alignItems='center'
              gap={1}
            >
              <Receipt /> Order Summary
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <Receipt fontSize='small' />
                </ListItemIcon>
                <ListItemText
                  primary='Order ID'
                  secondary={
                    <Box display='flex' alignItems='center' gap={1}>
                      <Typography variant='body2'>
                        #{order.id.slice(-8)}
                      </Typography>
                      <IconButton
                        size='small'
                        onClick={() => copyToClipboard(order.id, 'Order ID')}
                      >
                        <ContentCopy fontSize='small' />
                      </IconButton>
                    </Box>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Schedule fontSize='small' />
                </ListItemIcon>
                <ListItemText
                  primary='Created'
                  secondary={new Date(order.createdAt).toLocaleString()}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Money fontSize='small' />
                </ListItemIcon>
                <ListItemText
                  primary='Pricing'
                  secondary={
                    order.adminServiceCharge ? (
                      <Box>
                        <Typography variant='body2'>
                          Service Charge: {order.adminServiceCharge} SAR
                        </Typography>
                        <Typography variant='body2' fontWeight='bold'>
                          Total: {order.totalAmount} SAR
                        </Typography>
                      </Box>
                    ) : (
                      'Not set'
                    )
                  }
                />
              </ListItem>
            </List>
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
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <Person fontSize='small' />
                </ListItemIcon>
                <ListItemText
                  primary='Name'
                  secondary={`${order.customer?.name || "nil"}`}
                />
              </ListItem>
              {order.customer?.email && (
                <ListItem>
                  <ListItemIcon>
                    <Email fontSize='small' />
                  </ListItemIcon>
                  <ListItemText
                    primary='Email'
                    secondary={
                      <Box display='flex' alignItems='center' gap={1}>
                        <Typography variant='body2'>
                          {order.customer?.email}
                        </Typography>
                        <IconButton
                          size='small'
                          onClick={() =>
                            copyToClipboard(
                              order.customer?.email ?? '',
                              'Email'
                            )
                          }
                        >
                          <ContentCopy fontSize='small' />
                        </IconButton>
                      </Box>
                    }
                  />
                </ListItem>
              )}
              {order.customer?.phone && (
                <ListItem>
                  <ListItemIcon>
                    <Phone fontSize='small' />
                  </ListItemIcon>
                  <ListItemText
                    primary='Phone'
                    secondary={
                      <Box>
                        <Box display='flex' alignItems='center' gap={1}>
                          <Typography variant='body2'>
                            {order.customer?.phone}
                          </Typography>
                          <IconButton
                            size='small'
                            onClick={() =>
                              copyToClipboard(
                                order.customer?.phone ?? '',
                                'Phone'
                              )
                            }
                          >
                            <ContentCopy fontSize='small' />
                          </IconButton>
                        </Box>
                        <Box display='flex' gap={1} mt={1}>
                          <Button
                            size='small'
                            variant='outlined'
                            color='success'
                            startIcon={<WhatsApp />}
                            onClick={() => {
                              const phone = order.customer?.phone?.replace(
                                /\D/g,
                                ''
                              );
                              window.open(`https://wa.me/${phone}`, '_blank');
                            }}
                          >
                            WhatsApp
                          </Button>
                          <Button
                            size='small'
                            variant='outlined'
                            color='primary'
                            startIcon={<Sms />}
                            onClick={() => {
                              window.open(
                                `sms:${order.customer?.phone}`,
                                '_blank'
                              );
                            }}
                          >
                            Send SMS
                          </Button>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              )}
            </List>
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
              <Business /> Custom Laundry Location
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant='body1' fontWeight='medium' mb={1}>
                {order.customLaundryName}
              </Typography>
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{ mt: 1, mb: 2 }}
              >
                {order.customLaundryDescription}
              </Typography>
              {order.customLaundryAddress && (
                <Box display='flex' alignItems='flex-start' gap={1} mb={1}>
                  <LocationOn
                    fontSize='small'
                    color='action'
                    sx={{ mt: 0.5 }}
                  />
                  <Box flex={1}>
                    <Typography variant='body2' fontWeight='medium'>
                      {order.customLaundryAddress}
                    </Typography>
                    <Box mt={1}>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        display='block'
                      >
                        Lat: {order.customLaundryLat.toFixed(6)}, Lng:{' '}
                        {order.customLaundryLong.toFixed(6)}
                      </Typography>
                      <Button
                        size='small'
                        startIcon={<Launch />}
                        onClick={() =>
                          openMap(
                            order.customLaundryLat,
                            order.customLaundryLong
                          )
                        }
                        sx={{ mt: 0.5 }}
                      >
                        View on Map
                      </Button>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Pickup Details */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography
              variant='h6'
              gutterBottom
              display='flex'
              alignItems='center'
              gap={1}
            >
              <Schedule /> Pickup Details
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box display='flex' alignItems='center' gap={1} mb={2}>
                <Schedule fontSize='small' color='action' />
                <Typography variant='body2'>
                  {order.pickup?.pickupDate} at {order.pickup?.pickupTime}
                </Typography>
              </Box>
              <Box display='flex' alignItems='flex-start' gap={1} mb={1}>
                <LocationOn fontSize='small' color='action' sx={{ mt: 0.5 }} />
                <Box flex={1}>
                  <Typography variant='body2' fontWeight='medium'>
                    {order.pickup?.pickupAddress}
                  </Typography>
                  {order.pickup?.pickupLat && order.pickup?.pickupLong && (
                    <Box mt={1}>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        display='block'
                      >
                        Lat: {order.pickup.pickupLat.toFixed(6)}, Lng:{' '}
                        {order.pickup.pickupLong.toFixed(6)}
                      </Typography>
                      <Button
                        size='small'
                        startIcon={<Launch />}
                        onClick={() =>
                          openMap(
                            order.pickup!.pickupLat!,
                            order.pickup!.pickupLong!
                          )
                        }
                        sx={{ mt: 0.5 }}
                      >
                        View on Map
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Delivery Details */}
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
              <Box display='flex' alignItems='center' gap={1} mb={2}>
                <LocalShipping fontSize='small' color='action' />
                <Chip
                  label={order.deliveryType}
                  size='small'
                  color={
                    order.deliveryType === 'EXPRESS' ? 'warning' : 'default'
                  }
                />
              </Box>
              <Box display='flex' alignItems='flex-start' gap={1}>
                <LocationOn fontSize='small' color='action' sx={{ mt: 0.5 }} />
                <Box flex={1}>
                  <Typography variant='body2' fontWeight='medium'>
                    {order.delivery?.deliveryAddress}
                  </Typography>
                  {order.delivery?.deliveryLat &&
                    order.delivery?.deliveryLong && (
                      <Box mt={1}>
                        <Typography
                          variant='caption'
                          color='text.secondary'
                          display='block'
                        >
                          Lat: {order.delivery.deliveryLat.toFixed(6)}, Lng:{' '}
                          {order.delivery.deliveryLong.toFixed(6)}
                        </Typography>
                        <Button
                          size='small'
                          startIcon={<Launch />}
                          onClick={() =>
                            openMap(
                              order.delivery!.deliveryLat!,
                              order.delivery!.deliveryLong!
                            )
                          }
                          sx={{ mt: 0.5 }}
                        >
                          View on Map
                        </Button>
                      </Box>
                    )}
                </Box>
              </Box>
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
              <Receipt /> Vendor Payment & Customer Invoice
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
                    <Typography variant='body2'>
                      Amount Paid to Vendor:
                    </Typography>
                    <Typography variant='body2' fontWeight='medium'>
                      {order.customVendorPaid} SAR
                    </Typography>
                  </Box>
                  <Box display='flex' justifyContent='space-between' mb={1}>
                    <Typography variant='body2'>
                      Customer Invoice Amount:
                    </Typography>
                    <Typography
                      variant='body2'
                      fontWeight='medium'
                      color='primary.main'
                    >
                      {order.customVendorPaid} SAR
                    </Typography>
                  </Box>
                  <Box display='flex' justifyContent='space-between' mb={1}>
                    <Typography variant='body2'>Payment Method:</Typography>
                    <Typography variant='body2' fontWeight='medium'>
                      {order.customPaymentMethod}
                    </Typography>
                  </Box>
                  <Chip
                    label={
                      order.customerPaid
                        ? 'Customer Paid'
                        : 'Awaiting Customer Payment'
                    }
                    color={order.customerPaid ? 'success' : 'warning'}
                    size='small'
                    sx={{ mt: 1 }}
                  />
                </>
              ) : (
                <Alert severity='info'>
                  Driver payment receipt not uploaded yet. Upload receipt to
                  generate customer invoice.
                </Alert>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Payment Invoice Link */}
        {order.payTabsInvoiceUrl && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography
                variant='h6'
                gutterBottom
                display='flex'
                alignItems='center'
                gap={1}
              >
                <Receipt /> Customer Payment Invoice
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Alert
                  severity={order.customerPaid ? 'success' : 'warning'}
                  sx={{ mb: 2 }}
                >
                  <Typography variant='body2' fontWeight='bold'>
                    Payment Status:{' '}
                    {order.customerPaid ? 'Paid ✓' : 'Awaiting Payment'}
                  </Typography>
                  {order.customerPaymentDate && (
                    <Typography variant='caption' display='block'>
                      Paid on:{' '}
                      {new Date(order.customerPaymentDate).toLocaleString()}
                    </Typography>
                  )}
                </Alert>

                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'grey.50',
                    borderRadius: 1,
                    border: 1,
                    borderColor: 'grey.300',
                  }}
                >
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    gutterBottom
                  >
                    Invoice Link (Share with customer):
                  </Typography>
                  <Box
                    display='flex'
                    gap={1}
                    alignItems='center'
                    sx={{ mt: 1 }}
                  >
                    <TextField
                      fullWidth
                      value={order.payTabsInvoiceUrl}
                      InputProps={{
                        readOnly: true,
                        sx: { fontFamily: 'monospace', fontSize: '0.875rem' },
                      }}
                      size='small'
                    />
                    <Button
                      variant='contained'
                      onClick={() => {
                        navigator.clipboard.writeText(order.payTabsInvoiceUrl);
                        toast.success('Invoice link copied to clipboard!');
                      }}
                      startIcon={<ContentCopy />}
                    >
                      Copy
                    </Button>
                    <Button
                      variant='outlined'
                      onClick={() =>
                        window.open(order.payTabsInvoiceUrl, '_blank')
                      }
                      startIcon={<OpenInNew />}
                    >
                      Open
                    </Button>
                  </Box>

                  {/* Regenerate Payment Link Button */}
                  {!order.customerPaid && (
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant='outlined'
                        color='warning'
                        onClick={handleRegeneratePaymentLink}
                        startIcon={<Refresh />}
                        disabled={
                          !canRegeneratePaymentLink() ||
                          regeneratePaymentLinkMutation.isPending
                        }
                        fullWidth
                      >
                        {regeneratePaymentLinkMutation.isPending ? (
                          <CircularProgress size={20} />
                        ) : canRegeneratePaymentLink() ? (
                          'Regenerate Payment Link'
                        ) : (
                          `Regenerate in ${getRemainingTime()} min`
                        )}
                      </Button>
                      {order.payTabsInvoiceDateCreated && (
                        <Typography
                          variant='caption'
                          color='text.secondary'
                          display='block'
                          sx={{ mt: 1, textAlign: 'center' }}
                        >
                          Link created:{' '}
                          {new Date(
                            order.payTabsInvoiceDateCreated
                          ).toLocaleString()}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>

                {!order.customerPaid && (
                  <Alert severity='info' sx={{ mt: 2 }}>
                    Share this link with the customer via WhatsApp, SMS, or any
                    messaging app. The customer must pay this invoice before
                    delivery can proceed.
                  </Alert>
                )}
              </Box>
            </Paper>
          </Grid>
        )}

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

      <DeliveryDriverAssignmentDialog
        open={deliveryDriverDialogOpen}
        onClose={() => setDeliveryDriverDialogOpen(false)}
        order={order}
      />

      {/* Cancel Order Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        {/* Status-specific warnings */}
        {order.status === 'ACCEPTED' && (
          <Alert severity='warning' sx={{ mb: 2 }}>
            <Typography variant='subtitle2' gutterBottom>
              ⚠️ Order has been ACCEPTED
            </Typography>
            <Typography variant='body2'>
              The pickup driver has been assigned. Cancelling now may impact
              operations.
            </Typography>
          </Alert>
        )}

        {order.status === 'IN_PROGRESS' && (
          <Alert severity='error' sx={{ mb: 2 }}>
            <Typography variant='subtitle2' gutterBottom>
              ⚠️ Order is IN PROGRESS
            </Typography>
            <Typography variant='body2'>
              Work has already started. Receipt may have been uploaded. Ensure
              coordination with driver and vendor.
            </Typography>
          </Alert>
        )}

        {order.status === 'READY_FOR_PICKUP' && (
          <Alert severity='error' sx={{ mb: 2 }}>
            <Typography variant='subtitle2' gutterBottom>
              ⚠️ Order is READY FOR PICKUP
            </Typography>
            <Typography variant='body2'>
              Delivery driver may be assigned. Coordinate immediately before
              cancelling.
            </Typography>
          </Alert>
        )}

        <Alert severity='warning' sx={{ mb: 2 }}>
          This action will cancel the order. The customer will be notified.
        </Alert>
        <DialogTitle>Cancel Custom Order</DialogTitle>
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

          {order.customerPaid && (
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

export default CustomOrderDetails;
