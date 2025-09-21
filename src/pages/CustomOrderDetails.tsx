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
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  ArrowBack,
  Person,
  Phone,
  Email,
  LocationOn,
  AttachMoney,
  Assignment,
  UploadFile,
  LocalShipping,
  CheckCircle,
  Edit,
  Receipt,
  Payment,
  DriveEta,
  Schedule,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import api from '../services/api-service';

interface NextAction {
  label: string;
  action: () => void;
  color: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';
  icon: React.ReactElement;
}

// API Hook for fetching custom order details - Using your existing pattern
const useFetchCustomOrderDetails = (orderId: string) => {
  return useQuery({
    queryKey: ['FETCH_CUSTOM_ORDER_DETAILS', orderId],
    queryFn: async () => {
      const response = await api.get(`/admin/custom-order/${orderId}/details`);
      return response.data;
    },
    enabled: !!orderId,
  });
};

const CustomOrderDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const {
    data: order,
    isLoading,
    error,
  } = useFetchCustomOrderDetails(orderId || '');

  // State management
  const [pricingDialogOpen, setPricingDialogOpen] = useState(false);
  const [driverDialogOpen, setDriverDialogOpen] = useState(false);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [pricingForm, setPricingForm] = useState({
    adminServiceCharge: order?.adminServiceCharge || 0,
    totalAmount: order?.totalAmount || 0,
    estimatedVendorCost: order?.estimatedVendorCost || 0,
    notes: '',
  });

  // Event handlers
  const handleBack = useCallback(() => {
    navigate('/custom-orders');
  }, [navigate]);

  const handleSetPricing = useCallback(() => {
    // TODO: Implement API call to update pricing using mutation hook
    toast.success('Pricing updated successfully');
    setPricingDialogOpen(false);
  }, []);

  const handleAssignDriver = useCallback(() => {
    // TODO: Implement API call to assign driver using mutation hook
    toast.success('Driver assigned successfully');
    setDriverDialogOpen(false);
  }, []);

  const handleUploadReceipt = useCallback(() => {
    // TODO: Implement API call to upload receipt using mutation hook
    toast.success('Receipt uploaded successfully');
    setReceiptDialogOpen(false);
  }, []);

  const handleSendInvoice = useCallback(() => {
    // TODO: Implement API call to send PayTabs invoice using mutation hook
    toast.success('Invoice sent to customer');
  }, []);

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
      ACCEPTED: 'primary',
      IN_PROGRESS: 'secondary',
      READY_FOR_PICKUP: 'info',
      COMPLETED: 'success',
      CANCELLED: 'error',
    };
    return colors[status] || 'default';
  };

  const getWorkflowSteps = () => [
    {
      label: 'Order Created',
      description: 'Customer submitted custom order request',
      completed: true,
      icon: <Assignment />,
    },
    {
      label: 'Pricing Set',
      description: 'Admin set service charge and total amount',
      completed: !!order?.adminServiceCharge,
      icon: <AttachMoney />,
    },
    {
      label: 'Driver Assigned',
      description: 'Pickup driver assigned and dispatched',
      completed: order?.riderOrders?.some(
        (r: any) => r.type === 'RIDER_PICKUP'
      ),
      icon: <DriveEta />,
    },
    {
      label: 'Items Collected',
      description: 'Driver collected items from customer',
      completed: order?.riderOrders?.some((r: any) => r.status === 'COMPLETED'),
      icon: <CheckCircle />,
    },
    {
      label: 'Receipt Uploaded',
      description: 'Admin uploaded vendor receipt',
      completed: !!order?.customVendorReceipt,
      icon: <Receipt />,
    },
    {
      label: 'Invoice Sent',
      description: 'PayTabs invoice sent to customer',
      completed: !!order?.payTabsInvoiceUrl,
      icon: <Payment />,
    },
    {
      label: 'Customer Paid',
      description: 'Customer completed payment',
      completed: order?.customerPaid || false,
      icon: <CheckCircle />,
    },
    {
      label: 'Ready for Delivery',
      description: 'Order ready for delivery assignment',
      completed: order?.status === 'READY_FOR_PICKUP',
      icon: <LocalShipping />,
    },
  ];

  const getNextActions = (): NextAction[] => {
    const actions: NextAction[] = [];

    if (!order?.adminServiceCharge) {
      actions.push({
        label: 'Set Pricing',
        action: () => setPricingDialogOpen(true),
        color: 'primary',
        icon: <AttachMoney />,
      });
    }

    if (!order?.riderOrders?.some((r: any) => r.type === 'RIDER_PICKUP')) {
      actions.push({
        label: 'Assign Pickup Driver',
        action: () => setDriverDialogOpen(true),
        color: 'secondary',
        icon: <DriveEta />,
      });
    }

    if (
      !order?.customVendorReceipt &&
      order?.riderOrders?.some((r: any) => r.status === 'COMPLETED')
    ) {
      actions.push({
        label: 'Upload Receipt',
        action: () => setReceiptDialogOpen(true),
        color: 'info',
        icon: <UploadFile />,
      });
    }

    if (!order?.payTabsInvoiceUrl && order?.customVendorReceipt) {
      actions.push({
        label: 'Send Invoice',
        action: handleSendInvoice,
        color: 'success',
        icon: <Payment />,
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

  if (error || !order) {
    return (
      <Box p={4}>
        <Alert severity='error'>
          Failed to load order details. Please try again.
        </Alert>
      </Box>
    );
  }

  const nextActions = getNextActions();
  const workflowSteps = getWorkflowSteps();

  return (
    <Box p={4}>
      {/* Header */}
      <Stack direction='row' alignItems='center' spacing={2} mb={3}>
        <IconButton onClick={handleBack}>
          <ArrowBack />
        </IconButton>
        <Typography variant='h4' fontWeight='bold'>
          Custom Order Details
        </Typography>
        <Chip
          label={order.status}
          color={getStatusColor(order.status)}
          size='medium'
        />
      </Stack>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} lg={8}>
          {/* Order Info */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Order Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant='body2' color='text.secondary'>
                    Order ID
                  </Typography>
                  <Typography variant='body1' fontWeight='bold'>
                    #{order.id.slice(-8)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant='body2' color='text.secondary'>
                    Created
                  </Typography>
                  <Typography variant='body1'>
                    {new Date(order.createdAt).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant='body2' color='text.secondary'>
                    Laundry Service
                  </Typography>
                  <Typography variant='body1' fontWeight='bold'>
                    {order.customLaundryName}
                  </Typography>
                  <Typography variant='body2' sx={{ mt: 1 }}>
                    {order.customLaundryDescription}
                  </Typography>
                </Grid>
                {order.customLaundryAddress && (
                  <Grid item xs={12}>
                    <Typography variant='body2' color='text.secondary'>
                      Service Address
                    </Typography>
                    <Typography variant='body1'>
                      {order.customLaundryAddress}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Customer Info */}
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
                    {order.customer.firstName} {order.customer.lastName}
                  </Typography>
                  <Stack direction='row' spacing={2} alignItems='center'>
                    <Stack direction='row' spacing={0.5} alignItems='center'>
                      <Email fontSize='small' color='action' />
                      <Typography variant='body2'>
                        {order.customer.email}
                      </Typography>
                    </Stack>
                    {order.customer.phone && (
                      <Stack direction='row' spacing={0.5} alignItems='center'>
                        <Phone fontSize='small' color='action' />
                        <Typography variant='body2'>
                          {order.customer.phone}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Pickup & Delivery */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Pickup & Delivery
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    gutterBottom
                  >
                    Pickup Details
                  </Typography>
                  <Stack spacing={1}>
                    <Stack direction='row' spacing={0.5} alignItems='center'>
                      <Schedule fontSize='small' color='action' />
                      <Typography variant='body2'>
                        {order.pickup.pickupDate} at {order.pickup.pickupTime}
                      </Typography>
                    </Stack>
                    <Stack
                      direction='row'
                      spacing={0.5}
                      alignItems='flex-start'
                    >
                      <LocationOn fontSize='small' color='action' />
                      <Typography variant='body2'>
                        {order.pickup.pickupAddress}
                      </Typography>
                    </Stack>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    gutterBottom
                  >
                    Delivery Details
                  </Typography>
                  <Stack spacing={1}>
                    <Stack direction='row' spacing={0.5} alignItems='center'>
                      <LocalShipping fontSize='small' color='action' />
                      <Typography variant='body2'>
                        {order.delivery.deliveryType}
                      </Typography>
                    </Stack>
                    <Stack
                      direction='row'
                      spacing={0.5}
                      alignItems='flex-start'
                    >
                      <LocationOn fontSize='small' color='action' />
                      <Typography variant='body2'>
                        {order.delivery.deliveryAddress}
                      </Typography>
                    </Stack>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Pricing Details */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack
                direction='row'
                justifyContent='space-between'
                alignItems='center'
                mb={2}
              >
                <Typography variant='h6'>Pricing Details</Typography>
                {order.adminServiceCharge && (
                  <Button
                    startIcon={<Edit />}
                    onClick={() => setPricingDialogOpen(true)}
                  >
                    Edit
                  </Button>
                )}
              </Stack>

              {order.adminServiceCharge ? (
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant='body2' color='text.secondary'>
                      Estimated Vendor Cost
                    </Typography>
                    <Typography variant='h6'>
                      {order.estimatedVendorCost || 0} SAR
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='body2' color='text.secondary'>
                      Admin Service Charge
                    </Typography>
                    <Typography variant='h6'>
                      {order.adminServiceCharge} SAR
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant='body2' color='text.secondary'>
                      Total Amount
                    </Typography>
                    <Typography variant='h5' fontWeight='bold'>
                      {order.totalAmount || 0} SAR
                    </Typography>
                  </Grid>
                </Grid>
              ) : (
                <Alert severity='warning'>
                  Pricing not set yet. Please set pricing to proceed.
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Payment Status */}
          <Card>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Payment Status
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant='body2' color='text.secondary'>
                    Customer Payment
                  </Typography>
                  <Chip
                    label={order.customerPaid ? 'Paid' : 'Pending'}
                    color={order.customerPaid ? 'success' : 'warning'}
                    sx={{ mt: 0.5 }}
                  />
                  {order.payTabsInvoiceUrl && (
                    <Button
                      size='small'
                      sx={{ mt: 1, display: 'block' }}
                      href={order.payTabsInvoiceUrl}
                      target='_blank'
                    >
                      View Invoice
                    </Button>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant='body2' color='text.secondary'>
                    Vendor Payment
                  </Typography>
                  <Typography variant='body1'>
                    {order.customVendorPaid
                      ? `${order.customVendorPaid} SAR`
                      : 'Not paid'}
                  </Typography>
                  {order.customPaymentMethod && (
                    <Typography variant='caption' color='text.secondary'>
                      Method: {order.customPaymentMethod}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          {/* Next Actions */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Next Actions
              </Typography>
              {nextActions.length > 0 ? (
                <Stack spacing={2}>
                  {nextActions.map((action, index) => (
                    <Button
                      key={index}
                      variant='contained'
                      color={action.color}
                      startIcon={action.icon}
                      onClick={action.action}
                      fullWidth
                    >
                      {action.label}
                    </Button>
                  ))}
                </Stack>
              ) : (
                <Typography variant='body2' color='text.secondary'>
                  No pending actions
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Workflow Progress */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Workflow Progress
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

          {/* Assigned Drivers */}
          <Card>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Assigned Drivers
              </Typography>
              {order.riderOrders && order.riderOrders.length > 0 ? (
                <List dense>
                  {order.riderOrders.map((riderOrder: any) => (
                    <ListItem key={riderOrder.id}>
                      <ListItemIcon>
                        <Avatar>
                          <DriveEta />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={`${riderOrder.rider.firstName} ${riderOrder.rider.lastName}`}
                        secondary={
                          <Stack>
                            <Typography variant='caption'>
                              {riderOrder.type.replace('_', ' ')}
                            </Typography>
                            <Typography variant='caption'>
                              Status: {riderOrder.status}
                            </Typography>
                            <Typography variant='caption'>
                              {riderOrder.rider.phone}
                            </Typography>
                          </Stack>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant='body2' color='text.secondary'>
                  No drivers assigned yet
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Pricing Dialog */}
      <Dialog
        open={pricingDialogOpen}
        onClose={() => setPricingDialogOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Set Order Pricing</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label='Estimated Vendor Cost'
              type='number'
              value={pricingForm.estimatedVendorCost}
              onChange={(e) =>
                setPricingForm({
                  ...pricingForm,
                  estimatedVendorCost: Number(e.target.value),
                })
              }
              InputProps={{ endAdornment: 'SAR' }}
              fullWidth
            />
            <TextField
              label='Admin Service Charge'
              type='number'
              value={pricingForm.adminServiceCharge}
              onChange={(e) =>
                setPricingForm({
                  ...pricingForm,
                  adminServiceCharge: Number(e.target.value),
                })
              }
              InputProps={{ endAdornment: 'SAR' }}
              fullWidth
            />
            <TextField
              label='Total Amount'
              type='number'
              value={pricingForm.totalAmount}
              onChange={(e) =>
                setPricingForm({
                  ...pricingForm,
                  totalAmount: Number(e.target.value),
                })
              }
              InputProps={{ endAdornment: 'SAR' }}
              fullWidth
            />
            <TextField
              label='Notes'
              multiline
              rows={3}
              value={pricingForm.notes}
              onChange={(e) =>
                setPricingForm({ ...pricingForm, notes: e.target.value })
              }
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPricingDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSetPricing} variant='contained'>
            Save Pricing
          </Button>
        </DialogActions>
      </Dialog>

      {/* Driver Assignment Dialog */}
      <Dialog
        open={driverDialogOpen}
        onClose={() => setDriverDialogOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Assign Pickup Driver</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Driver</InputLabel>
            <Select>
              <MenuItem value='1'>Mohammed Hassan - 4.8★ (156 orders)</MenuItem>
              <MenuItem value='2'>Ali Ahmed - 4.6★ (89 orders)</MenuItem>
              <MenuItem value='3'>Omar Salem - 4.9★ (203 orders)</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label='Notes for driver'
            multiline
            rows={3}
            fullWidth
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDriverDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAssignDriver} variant='contained'>
            Assign Driver
          </Button>
        </DialogActions>
      </Dialog>

      {/* Receipt Upload Dialog */}
      <Dialog
        open={receiptDialogOpen}
        onClose={() => setReceiptDialogOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Upload Vendor Receipt</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label='Vendor Name'
              fullWidth
              defaultValue={order.customLaundryName}
            />
            <TextField
              label='Amount Paid'
              type='number'
              InputProps={{ endAdornment: 'SAR' }}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Payment Method</InputLabel>
              <Select>
                <MenuItem value='CASH'>Cash</MenuItem>
                <MenuItem value='CARD'>Card</MenuItem>
                <MenuItem value='BANK_TRANSFER'>Bank Transfer</MenuItem>
                <MenuItem value='MOBILE_PAYMENT'>Mobile Payment</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant='outlined'
              component='label'
              startIcon={<UploadFile />}
              fullWidth
            >
              Upload Receipt Image
              <input type='file' hidden accept='image/*' />
            </Button>
            <TextField label='Notes' multiline rows={3} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReceiptDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUploadReceipt} variant='contained'>
            Upload Receipt
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomOrderDetails;
