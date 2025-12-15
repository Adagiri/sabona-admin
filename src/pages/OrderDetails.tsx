import React, { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Card,
  CardContent,
  Stack,
  Button,
  IconButton,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  LinearProgress,
} from '@mui/material';
import {
  ArrowBack,
  Person,
  Phone,
  Email,
  LocationOn,
  AttachMoney,
  Assignment,
  LocalShipping,
  CheckCircle,
  Schedule,
  Store,
  Receipt,
  DriveEta,
  AccessTime,
  Edit,
  LocalLaundryService,
  StarRate,
} from '@mui/icons-material';
import { useFetchOrderDetails } from '../hooks/Admin/query';
import { toast } from 'react-toastify';
import { Cancel } from '@mui/icons-material';
import { FormControlLabel, Checkbox } from '@mui/material';
import {
  useCancelOrder,
  useAcceptOrder,
} from '../hooks/Admin/mutations/customOrders';
import {
  useAcceptPickupRide,
  useMarkPickedUp,
  useMarkDroppedAtVendor,
  useMarkReadyForDelivery,
  useAcceptDeliveryRide,
  useMarkDelivered,
  useAddOrderNotes,
} from '../hooks/Admin/mutations/orders';
import { LinkIcon } from 'lucide-react';

const OrderDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const {
    data: orderDetails,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useFetchOrderDetails(orderId || '');

  // State management
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [refundCustomer, setRefundCustomer] = useState(false);

  // Mutations
  const cancelMutation = useCancelOrder();
  const acceptOrderMutation = useAcceptOrder();
  const acceptPickupRideMutation = useAcceptPickupRide();
  const markPickedUpMutation = useMarkPickedUp();
  const markDroppedAtVendorMutation = useMarkDroppedAtVendor();
  const markReadyMutation = useMarkReadyForDelivery();
  const acceptDeliveryRideMutation = useAcceptDeliveryRide();
  const markDeliveredMutation = useMarkDelivered();
  const addNotesMutation = useAddOrderNotes();

  // Check if any mutation is pending
  const isAnyMutationPending =
    cancelMutation.isPending ||
    acceptOrderMutation.isPending ||
    acceptPickupRideMutation.isPending ||
    markPickedUpMutation.isPending ||
    markDroppedAtVendorMutation.isPending ||
    markReadyMutation.isPending ||
    acceptDeliveryRideMutation.isPending ||
    markDeliveredMutation.isPending ||
    addNotesMutation.isPending;

  // Track which action button is loading
  const getActionLoading = (label: string) => {
    switch (label) {
      case 'Accept Pickup Ride (Driver)':
        return acceptPickupRideMutation.isPending;
      case 'Mark Picked Up (Driver)':
        return markPickedUpMutation.isPending;
      case 'Mark Dropped at Vendor (Driver)':
        return markDroppedAtVendorMutation.isPending;
      case 'Mark Ready (Vendor)':
        return markReadyMutation.isPending;
      case 'Accept Delivery Ride (Driver)':
        return acceptDeliveryRideMutation.isPending;
      case 'Mark Delivered (Driver)':
        return markDeliveredMutation.isPending;
      default:
        return false;
    }
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

  // Event handlers
  const handleBack = useCallback(() => {
    navigate('/order');
  }, [navigate]);

  const handleRefresh = useCallback(() => {
    refetch();
    toast.success('Order details refreshed');
  }, [refetch]);

  const handleOpenNotesDialog = useCallback(() => {
    // Pre-populate with existing notes when opening
    setAdminNotes(orderDetails?.adminNotes || '');
    setNotesDialogOpen(true);
  }, [orderDetails?.adminNotes]);

  const handleSaveNotes = useCallback(async () => {
    if (!orderId) {
      toast.error('Order ID is missing');
      return;
    }

    // Allow empty notes to clear them
    try {
      await addNotesMutation.mutateAsync({
        orderId: orderId!,
        notes: adminNotes,
      });
      setNotesDialogOpen(false);
      setAdminNotes('');
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  }, [adminNotes, orderId, addNotesMutation]);

  const handleAcceptOrder = useCallback(async () => {
    if (!orderId) return;

    try {
      await acceptOrderMutation.mutateAsync(orderId);
      await refetch(); // Refresh order details after accepting
    } catch (error) {
      console.error('Failed to accept order:', error);
    }
  }, [orderId, acceptOrderMutation, refetch]);

  // Driver and vendor action handlers
  const handleAcceptPickupRide = useCallback(async () => {
    if (!orderId) return;
    try {
      await acceptPickupRideMutation.mutateAsync(orderId);
      await refetch();
    } catch (error) {
      console.error('Failed to accept pickup ride:', error);
    }
  }, [orderId, acceptPickupRideMutation, refetch]);

  const handleMarkPickedUp = useCallback(async () => {
    if (!orderId) return;
    try {
      await markPickedUpMutation.mutateAsync(orderId);
      await refetch();
    } catch (error) {
      console.error('Failed to mark as picked up:', error);
    }
  }, [orderId, markPickedUpMutation, refetch]);

  const handleMarkDroppedAtVendor = useCallback(async () => {
    if (!orderId) return;
    try {
      await markDroppedAtVendorMutation.mutateAsync(orderId);
      await refetch();
    } catch (error) {
      console.error('Failed to mark as dropped at vendor:', error);
    }
  }, [orderId, markDroppedAtVendorMutation, refetch]);

  const handleMarkReady = useCallback(async () => {
    if (!orderId) return;
    try {
      await markReadyMutation.mutateAsync(orderId);
      await refetch();
    } catch (error) {
      console.error('Failed to mark as ready:', error);
    }
  }, [orderId, markReadyMutation, refetch]);

  const handleAcceptDeliveryRide = useCallback(async () => {
    if (!orderId) return;
    try {
      await acceptDeliveryRideMutation.mutateAsync(orderId);
      await refetch();
    } catch (error) {
      console.error('Failed to accept delivery ride:', error);
    }
  }, [orderId, acceptDeliveryRideMutation, refetch]);

  const handleMarkDelivered = useCallback(async () => {
    if (!orderId) return;
    try {
      await markDeliveredMutation.mutateAsync(orderId);
      await refetch();
    } catch (error) {
      console.error('Failed to mark as delivered:', error);
    }
  }, [orderId, markDeliveredMutation, refetch]);

  // Utility functions
  const getStatusColor = (
    status: string
  ):
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning' => {
    const colors: Record<
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
    return colors[status] || 'default';
  };

  const formatCurrency = (amount: number) => `${amount.toFixed(2)} SAR`;

  // Helper function to get the correct price based on delivery type
  const getItemPrice = (item: any) => {
    // Use snapshot values (price at time of purchase)
    if (orderDetails?.deliveryType === 'EXPRESS') {
      return item.expressPlatformPriceSnapshot || item.platformPriceSnapshot || 0;
    }
    return item.platformPriceSnapshot || 0;
  };

  // Helper function to get vendor price based on delivery type
  const getVendorPrice = (item: any) => {
    if (orderDetails?.deliveryType === 'EXPRESS') {
      return item.expressVendorPriceSnapshot || item.vendorPriceSnapshot || 0;
    }
    return item.vendorPriceSnapshot || 0;
  };

  const getOrderWorkflowSteps = () => [
    {
      label: 'Order Placed',
      description: 'Customer placed order and payment confirmed',
      completed: true,
      icon: <Assignment />,
    },
    {
      label: 'Vendor Accepted',
      description: 'Laundry vendor accepted the order',
      completed: orderDetails?.status !== 'PENDING',
      icon: <Store />,
    },
    {
      label: 'In Progress',
      description: 'Order is being processed by vendor',
      completed: ['IN_PROGRESS', 'READY_FOR_PICKUP', 'COMPLETED'].includes(
        orderDetails?.status || ''
      ),
      icon: <LocalLaundryService />,
    },
    {
      label: 'Pickup Assigned',
      description: 'Pickup driver assigned and dispatched',
      completed: !!orderDetails?.pickup?.rider,
      icon: <DriveEta />,
    },
    {
      label: 'Items Collected',
      description: 'Driver collected items from customer',
      completed:
        orderDetails?.status === 'READY_FOR_PICKUP' ||
        orderDetails?.status === 'COMPLETED',
      icon: <CheckCircle />,
    },
    {
      label: 'Delivery Assigned',
      description: 'Delivery driver assigned',
      completed: !!orderDetails?.delivery?.rider,
      icon: <LocalShipping />,
    },
    {
      label: 'Completed',
      description: 'Order delivered to customer',
      completed: orderDetails?.status === 'COMPLETED',
      icon: <CheckCircle />,
    },
  ];

  // Get next available actions based on order status and pickup/delivery status
  const getNextActions = () => {
    if (!orderDetails) return [];

    const actions = [];
    const { status, pickup, delivery } = orderDetails;

    // Driver pickup actions
    if (status === 'ACCEPTED' && pickup?.status === 'PENDING') {
      actions.push({
        label: 'Accept Pickup Ride (Driver)',
        handler: handleAcceptPickupRide,
        color: 'success' as const,
        icon: <CheckCircle />,
      });
    }

    if (status === 'ACCEPTED' && pickup?.status === 'ACCEPTED') {
      actions.push({
        label: 'Mark Picked Up (Driver)',
        handler: handleMarkPickedUp,
        color: 'primary' as const,
        icon: <DriveEta />,
      });
    }

    if (status === 'ACCEPTED' && pickup?.status === 'PICKED_UP') {
      actions.push({
        label: 'Mark Dropped at Vendor (Driver)',
        handler: handleMarkDroppedAtVendor,
        color: 'info' as const,
        icon: <Store />,
      });
    }

    // Vendor action
    if (status === 'IN_PROGRESS') {
      actions.push({
        label: 'Mark Ready (Vendor)',
        handler: handleMarkReady,
        color: 'warning' as const,
        icon: <AccessTime />,
      });
    }

    // Driver delivery actions
    if (status === 'READY_FOR_PICKUP' && delivery?.status === 'PENDING') {
      actions.push({
        label: 'Accept Delivery Ride (Driver)',
        handler: handleAcceptDeliveryRide,
        color: 'success' as const,
        icon: <CheckCircle />,
      });
    }

    if (status === 'READY_FOR_PICKUP' && delivery?.status === 'ACCEPTED') {
      actions.push({
        label: 'Mark Delivered (Driver)',
        handler: handleMarkDelivered,
        color: 'primary' as const,
        icon: <LocalShipping />,
      });
    }

    return actions;
  };

  if (isLoading) {
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

  if (error || !orderDetails) {
    return (
      <Box p={4}>
        <Alert severity='error'>
          Failed to load order details. Please try again.
          <Button onClick={handleRefresh} sx={{ ml: 2 }}>
            Retry
          </Button>
        </Alert>
      </Box>
    );
  }

  const workflowSteps = getOrderWorkflowSteps();
  const nextActions = getNextActions();

  return (
    <Box p={4}>
      {/* Loading indicator for background refetch */}
      {isFetching && (
        <LinearProgress
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
          }}
        />
      )}

      {/* Header */}
      <Stack direction='row' alignItems='center' spacing={2} mb={3}>
        <IconButton onClick={handleBack}>
          <ArrowBack />
        </IconButton>
        <Typography variant='h4' fontWeight='bold'>
          Order Details
        </Typography>
        <Chip
          label={orderDetails.status}
          color={getStatusColor(orderDetails.status)}
          size='medium'
        />
        <Button
          variant='outlined'
          onClick={handleRefresh}
          size='small'
          disabled={isAnyMutationPending || isFetching}
        >
          Refresh
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} lg={8}>
          {/* Order Summary */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Order Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant='body2' color='text.secondary'>
                    Order ID
                  </Typography>
                  <Typography variant='body1' fontWeight='bold'>
                    #{orderDetails.id.slice(-8)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant='body2' color='text.secondary'>
                    Total Amount
                  </Typography>
                  <Typography variant='h6' fontWeight='bold' color='primary'>
                    {formatCurrency(orderDetails.totalAmount)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant='body2' color='text.secondary'>
                    Total Items
                  </Typography>
                  <Typography variant='body1' fontWeight='bold'>
                    {orderDetails.totalQuantity} items
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant='body2' color='text.secondary'>
                    Order Date
                  </Typography>
                  <Typography variant='body1'>
                    {new Date(orderDetails.createdAt).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Customer Information
              </Typography>
              <Stack direction='row' spacing={2} alignItems='center'>
                <Avatar>
                  <Person />
                </Avatar>
                <Box>
                  <Typography variant='body1' fontWeight='bold'>
                    {orderDetails.user.firstName} {orderDetails.user.lastName}
                  </Typography>
                  <Stack direction='row' spacing={2} alignItems='center'>
                    <Stack direction='row' spacing={0.5} alignItems='center'>
                      <Phone fontSize='small' color='action' />
                      <Typography variant='body2'>
                        {orderDetails.user.phone}
                      </Typography>
                    </Stack>
                    {orderDetails.user.email && (
                      <Stack direction='row' spacing={0.5} alignItems='center'>
                        <Email fontSize='small' color='action' />
                        <Typography variant='body2'>
                          {orderDetails.user.email}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Laundry Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Laundry Information
              </Typography>
              <Stack direction='row' spacing={2} alignItems='center'>
                <Avatar>
                  <Store />
                </Avatar>
                <Box>
                  <Typography variant='body1' fontWeight='bold'>
                    {orderDetails.laundry?.name}
                  </Typography>
                  <Stack direction='row' spacing={2} alignItems='center'>
                    <Stack direction='row' spacing={0.5} alignItems='center'>
                      <Phone fontSize='small' color='action' />
                      <Typography variant='body2'>
                        {orderDetails.laundry?.vendor.phone}
                      </Typography>
                    </Stack>
                    <Stack direction='row' spacing={0.5} alignItems='center'>
                      <LocationOn fontSize='small' color='action' />
                      <Typography variant='body2'>
                        {orderDetails.laundry?.address ||
                          'Address not provided'}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Order Items
                {orderDetails.deliveryType === 'EXPRESS' && (
                  <Chip
                    label='Express Pricing'
                    size='small'
                    color='error'
                    sx={{ ml: 1 }}
                  />
                )}
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Service</TableCell>
                      <TableCell>Item</TableCell>
                      <TableCell align='center'>Quantity</TableCell>
                      <TableCell align='right'>Unit Price</TableCell>
                      <TableCell align='right'>Vendor Gets</TableCell>
                      <TableCell align='right'>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orderDetails.services?.map((service: any) =>
                      service.items?.map((item: any, itemIndex: number) => {
                        const unitPrice = getItemPrice(item);
                        const vendorPrice = getVendorPrice(item);
                        return (
                          <TableRow key={`${service.id}-${itemIndex}`}>
                            <TableCell>
                              <Typography variant='body2' fontWeight='medium'>
                                {item.serviceName || service.laundryService?.name || 'Service'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant='body2'>
                                {item.itemName || item.laundryServiceItem?.name || 'Item'}
                              </Typography>
                            </TableCell>
                            <TableCell align='center'>
                              <Typography variant='body2' fontWeight='bold'>
                                {item.quantity}
                              </Typography>
                            </TableCell>
                            <TableCell align='right'>
                              <Typography variant='body2'>
                                {formatCurrency(unitPrice)}
                              </Typography>
                            </TableCell>
                            <TableCell align='right'>
                              <Typography variant='body2' color='text.secondary'>
                                {formatCurrency(vendorPrice)}
                              </Typography>
                            </TableCell>
                            <TableCell align='right'>
                              <Typography variant='body2' fontWeight='bold'>
                                {formatCurrency(unitPrice * item.quantity)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography variant='body1' fontWeight='bold'>
                          Total Amount
                        </Typography>
                      </TableCell>
                      <TableCell align='right'>
                        <Typography
                          variant='h6'
                          fontWeight='bold'
                          color='primary'
                        >
                          {formatCurrency(orderDetails.totalAmount)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Pickup & Delivery */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Pickup & Delivery Details
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    gutterBottom
                  >
                    Pickup Information
                  </Typography>
                  <Stack spacing={1}>
                    <Stack direction='row' spacing={0.5} alignItems='center'>
                      <Schedule fontSize='small' color='action' />
                      <Typography variant='body2'>
                        {orderDetails.pickup?.pickupDate} at{' '}
                        {orderDetails.pickup?.pickupTime}
                      </Typography>
                    </Stack>
                    <Stack
                      direction='row'
                      spacing={0.5}
                      alignItems='flex-start'
                    >
                      <LocationOn fontSize='small' color='action' />
                      <Typography variant='body2'>
                        {orderDetails.pickup?.pickupAddress}
                      </Typography>
                    </Stack>
                    {orderDetails.pickup?.rider && (
                      <Stack direction='row' spacing={0.5} alignItems='center'>
                        <DriveEta fontSize='small' color='action' />
                        <Typography variant='body2'>
                          Driver: {orderDetails.pickup.rider.firstName}{' '}
                          {orderDetails.pickup.rider.lastName}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    gutterBottom
                  >
                    Delivery Information
                  </Typography>
                  <Stack spacing={1}>
                    <Stack direction='row' spacing={0.5} alignItems='center'>
                      <LocalShipping fontSize='small' color='action' />
                      <Box>
                        <Typography variant='caption' color='text.secondary'>
                          Delivery Type
                        </Typography>
                        <Chip
                          label={orderDetails?.deliveryType || 'NORMAL'}
                          size='small'
                          color={
                            orderDetails?.deliveryType === 'EXPRESS'
                              ? 'error'
                              : 'primary'
                          }
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </Stack>
                    <Stack
                      direction='row'
                      spacing={0.5}
                      alignItems='flex-start'
                    >
                      <LocationOn fontSize='small' color='action' />
                      <Typography variant='body2'>
                        {orderDetails.delivery?.deliveryAddress}
                      </Typography>
                    </Stack>
                    {orderDetails.delivery?.rider && (
                      <Stack direction='row' spacing={0.5} alignItems='center'>
                        <DriveEta fontSize='small' color='action' />
                        <Typography variant='body2'>
                          Driver: {orderDetails.delivery.rider.firstName}{' '}
                          {orderDetails.delivery.rider.lastName}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Payment Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant='body2' color='text.secondary'>
                    Payment Type
                  </Typography>
                  <Typography variant='body1' fontWeight='bold'>
                    {orderDetails.paymentType || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant='body2' color='text.secondary'>
                    Payment Status
                  </Typography>
                  <Chip
                    label={orderDetails.paid ? 'Paid' : 'Pending'}
                    color={orderDetails.paid ? 'success' : 'warning'}
                    size='small'
                  />
                </Grid>
                {orderDetails.coupon && (
                  <Grid item xs={12}>
                    <Typography variant='body2' color='text.secondary'>
                      Coupon Applied
                    </Typography>
                    <Typography variant='body1'>
                      {orderDetails.coupon.code} -{' '}
                      {formatCurrency(orderDetails.discountAmount || 0)}{' '}
                      discount
                    </Typography>
                  </Grid>
                )}
                {(orderDetails.paymentLink || orderDetails.payTabsInvoiceUrl) && (
                  <Grid item xs={12}>
                    <Typography variant='body2' color='text.secondary' gutterBottom>
                      Payment Link
                    </Typography>
                    <Button
                      variant='outlined'
                      size='small'
                      startIcon={<LinkIcon />}
                      onClick={() =>
                        window.open(
                          orderDetails.paymentLink || orderDetails.payTabsInvoiceUrl,
                          '_blank'
                        )
                      }
                    >
                      Open Payment Link
                    </Button>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          {/* Quick Actions */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Quick Actions
              </Typography>
              <Stack spacing={2}>
                {/* Add/Edit Notes */}
                <Button
                  variant='contained'
                  color='primary'
                  startIcon={<Edit />}
                  onClick={handleOpenNotesDialog}
                  disabled={isAnyMutationPending || isFetching}
                  fullWidth
                >
                  {orderDetails?.adminNotes ? 'Edit Notes' : 'Add Notes'}
                </Button>

                {/* Cancel Order */}
                {orderDetails?.status !== 'CANCELLED' &&
                  orderDetails?.status !== 'COMPLETED' && (
                    <Button
                      variant='outlined'
                      color='error'
                      startIcon={<Cancel />}
                      onClick={() => setCancelDialogOpen(true)}
                      disabled={isAnyMutationPending || isFetching}
                    >
                      Cancel Order
                    </Button>
                  )}

                {/* Accept Order (PENDING → ACCEPTED) */}
                {orderDetails.status === 'PENDING' && (
                  <Button
                    variant='contained'
                    color='success'
                    startIcon={<CheckCircle />}
                    onClick={handleAcceptOrder}
                    disabled={acceptOrderMutation.isPending || isAnyMutationPending || isFetching}
                    fullWidth
                  >
                    {acceptOrderMutation.isPending ? (
                      <CircularProgress size={20} color='inherit' />
                    ) : (
                      'Accept Order (Vendor)'
                    )}
                  </Button>
                )}

                {/* Dynamic Next Actions */}
                {nextActions.map((action, index) => {
                  const isLoading = getActionLoading(action.label);
                  return (
                    <Button
                      key={index}
                      variant='contained'
                      color={action.color}
                      startIcon={!isLoading && action.icon}
                      onClick={action.handler}
                      disabled={isLoading || isAnyMutationPending || isFetching}
                      fullWidth
                    >
                      {isLoading ? (
                        <CircularProgress size={20} color='inherit' />
                      ) : (
                        action.label
                      )}
                    </Button>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>

          {/* Admin Notes - Display existing notes */}
          {orderDetails?.adminNotes && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Stack direction='row' justifyContent='space-between' alignItems='center' mb={2}>
                  <Typography variant='h6'>
                    Admin Notes
                  </Typography>
                  <IconButton size='small' onClick={handleOpenNotesDialog}>
                    <Edit fontSize='small' />
                  </IconButton>
                </Stack>
                <Typography variant='body2' color='text.secondary' sx={{ whiteSpace: 'pre-wrap' }}>
                  {orderDetails.adminNotes}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Order Timeline */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Order Progress
              </Typography>
              <Stepper orientation='vertical'>
                {workflowSteps.map((step, index) => (
                  <Step key={index} active={step.completed}>
                    <StepLabel
                      icon={
                        step.completed ? (
                          <CheckCircle color='success' />
                        ) : (
                          <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                            {index + 1}
                          </Avatar>
                        )
                      }
                    >
                      <Typography variant='body2' fontWeight='bold'>
                        {step.label}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography variant='caption' color='text.secondary'>
                        {step.description}
                      </Typography>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>

          {/* Order Statistics */}
          <Card>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Order Statistics
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Receipt />
                  </ListItemIcon>
                  <ListItemText
                    primary='Total Items'
                    secondary={`${orderDetails.totalQuantity} items`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AttachMoney />
                  </ListItemIcon>
                  <ListItemText
                    primary='Order Value'
                    secondary={formatCurrency(orderDetails.totalAmount)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Schedule />
                  </ListItemIcon>
                  <ListItemText
                    primary='Processing Time'
                    secondary='Estimated 2-3 days'
                  />
                </ListItem>
                {orderDetails.tip && orderDetails.tip.length > 0 && (
                  <ListItem>
                    <ListItemIcon>
                      <StarRate />
                    </ListItemIcon>
                    <ListItemText
                      primary='Tips Given'
                      secondary={`${formatCurrency(
                        orderDetails.tip.reduce(
                          (sum: number, tip: any) => sum + tip.amount,
                          0
                        )
                      )}`}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Notes Dialog */}
      <Dialog
        open={notesDialogOpen}
        onClose={() => setNotesDialogOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>{orderDetails?.adminNotes ? 'Edit Admin Notes' : 'Add Admin Notes'}</DialogTitle>
        <DialogContent>
          <TextField
            label='Admin Notes'
            multiline
            rows={4}
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            fullWidth
            sx={{ mt: 1 }}
            placeholder='Add any notes about this order...'
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotesDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveNotes}
            variant='contained'
            disabled={addNotesMutation.isPending}
          >
            {addNotesMutation.isPending ? (
              <CircularProgress size={20} />
            ) : (
              'Save Notes'
            )}
          </Button>
        </DialogActions>
      </Dialog>

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
            sx={{ mb: 2 }}
            placeholder='Enter reason for cancellation...'
          />

          {orderDetails?.paid && (
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

export default OrderDetails;
