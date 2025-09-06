import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Chip,
} from '@mui/material';
import { LocationOn, Money, Person, Schedule } from '@mui/icons-material';
import { useUpdateCustomOrderPricing } from '../hooks/Admin/customOrdersHooks';

interface CustomOrder {
  id: string;
  customLaundryName: string;
  customLaundryDescription: string;
  customLaundryAddress?: string;
  adminServiceCharge?: number;
  totalAmount?: number;
  customer: {
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  pickup: {
    pickupDate: string;
    pickupTime: string;
    pickupAddress: string;
  };
  delivery: {
    deliveryAddress: string;
    deliveryType: string;
  };
}

interface PricingDialogProps {
  open: boolean;
  onClose: () => void;
  order: CustomOrder;
  // ✅ Removed onUpdate prop - React Query handles cache invalidation
}

const PricingDialog: React.FC<PricingDialogProps> = ({
  open,
  onClose,
  order,
}) => {
  const [adminServiceCharge, setAdminServiceCharge] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // ✅ Use React Query mutation hook
  const updatePricingMutation = useUpdateCustomOrderPricing();

  useEffect(() => {
    if (order) {
      setAdminServiceCharge(order.adminServiceCharge?.toString() || '');
      setTotalAmount(order.totalAmount?.toString() || '');
      setEstimatedCost('');
      setNotes('');
      setErrors({});
    }
  }, [order]);

  const validateInputs = () => {
    const newErrors: { [key: string]: string } = {};

    const serviceCharge = parseFloat(adminServiceCharge);
    const total = parseFloat(totalAmount);
    const estimated = parseFloat(estimatedCost);

    if (!adminServiceCharge || serviceCharge <= 0) {
      newErrors.adminServiceCharge = 'Service charge must be greater than 0';
    }

    if (!totalAmount || total <= 0) {
      newErrors.totalAmount = 'Total amount must be greater than 0';
    }

    if (!estimatedCost || estimated <= 0) {
      newErrors.estimatedCost = 'Estimated vendor cost is required';
    }

    if (serviceCharge && total && estimated) {
      if (total < estimated + serviceCharge) {
        newErrors.totalAmount =
          'Total should cover estimated cost + service charge';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Use mutation instead of manual fetch
  const handleUpdatePricing = () => {
    if (!validateInputs()) {
      return;
    }

    updatePricingMutation.mutate(
      {
        orderId: order.id,
        adminServiceCharge: parseFloat(adminServiceCharge),
        totalAmount: parseFloat(totalAmount),
        estimatedVendorCost: parseFloat(estimatedCost),
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const calculateMargin = () => {
    const service = parseFloat(adminServiceCharge);
    const total = parseFloat(totalAmount);
    const estimated = parseFloat(estimatedCost);

    if (service && total && estimated) {
      const actualMargin = total - estimated;
      const marginPercentage = ((actualMargin / total) * 100).toFixed(1);
      return { actualMargin, marginPercentage };
    }
    return null;
  };

  const margin = calculateMargin();

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>
        <Box display='flex' alignItems='center' gap={1}>
          <Money color='primary' />
          Set Customer Pricing (Based on Actual Vendor Cost)
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Order Summary */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
          <Typography variant='h6' gutterBottom fontWeight='bold'>
            Order Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box display='flex' alignItems='center' gap={1} mb={1}>
                <Person fontSize='small' color='action' />
                <Typography variant='body2'>
                  <strong>Customer:</strong> {order.customer?.firstName}{' '}
                  {order.customer?.lastName}
                </Typography>
              </Box>
              <Box display='flex' alignItems='center' gap={1} mb={1}>
                <Schedule fontSize='small' color='action' />
                <Typography variant='body2'>
                  <strong>Pickup:</strong> {order.pickup.pickupDate} at{' '}
                  {order.pickup.pickupTime}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant='body2' gutterBottom>
                <strong>Laundry:</strong> {order.customLaundryName}
              </Typography>
              <Box display='flex' alignItems='center' gap={1}>
                <LocationOn fontSize='small' color='action' />
                <Typography variant='body2' color='text.secondary'>
                  {order.customLaundryAddress || 'Address not provided'}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Typography variant='body2'>
            <strong>Description:</strong> {order.customLaundryDescription}
          </Typography>

          <Box mt={2}>
            <Chip
              label={`Delivery: ${order.delivery.deliveryType}`}
              size='small'
              color='info'
            />
          </Box>
        </Paper>

        {/* Pricing Form */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label='Estimated Vendor Cost (SAR)'
              value={estimatedCost}
              onChange={(e) => setEstimatedCost(e.target.value)}
              type='number'
              inputProps={{ min: 0, step: 0.01 }}
              error={!!errors.estimatedCost}
              helperText={
                errors.estimatedCost || 'What you expect the vendor to charge'
              }
              required
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label='Admin Service Charge (SAR)'
              value={adminServiceCharge}
              onChange={(e) => setAdminServiceCharge(e.target.value)}
              type='number'
              inputProps={{ min: 0, step: 0.01 }}
              error={!!errors.adminServiceCharge}
              helperText={
                errors.adminServiceCharge ||
                'Your service fee for managing this order'
              }
              required
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label='Total Amount (SAR)'
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              type='number'
              inputProps={{ min: 0, step: 0.01 }}
              error={!!errors.totalAmount}
              helperText={
                errors.totalAmount || 'Final amount customer will pay'
              }
              required
            />
          </Grid>
        </Grid>

        {/* Calculation Summary */}
        {margin && (
          <Paper sx={{ p: 2, mt: 3, bgcolor: 'success.light', opacity: 0.1 }}>
            <Typography variant='h6' gutterBottom>
              Pricing Breakdown
            </Typography>
            <Box display='flex' justifyContent='space-between' mb={1}>
              <Typography>Estimated Vendor Cost:</Typography>
              <Typography fontWeight='bold'>{estimatedCost} SAR</Typography>
            </Box>
            <Box display='flex' justifyContent='space-between' mb={1}>
              <Typography>Admin Service Charge:</Typography>
              <Typography fontWeight='bold'>
                {adminServiceCharge} SAR
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box display='flex' justifyContent='space-between' mb={1}>
              <Typography fontWeight='bold'>Customer Pays:</Typography>
              <Typography fontWeight='bold' color='primary'>
                {totalAmount} SAR
              </Typography>
            </Box>
            <Box display='flex' justifyContent='space-between'>
              <Typography>Actual Margin:</Typography>
              <Typography
                fontWeight='bold'
                color={margin.actualMargin >= 0 ? 'success.main' : 'error.main'}
              >
                {margin.actualMargin.toFixed(2)} SAR ({margin.marginPercentage}
                %)
              </Typography>
            </Box>
          </Paper>
        )}

        {/* Notes */}
        <TextField
          fullWidth
          label='Pricing Notes (Optional)'
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          multiline
          rows={3}
          sx={{ mt: 3 }}
          placeholder='Add any notes about the pricing decisions...'
        />

        {/* Warning for low margins */}
        {margin && margin.actualMargin < 10 && (
          <Alert severity='warning' sx={{ mt: 2 }}>
            <Typography variant='body2'>
              <strong>Low margin warning:</strong> Your net profit is less than
              10 SAR. Consider increasing your service charge to ensure adequate
              profit margin after VAT.
            </Typography>
          </Alert>
        )}

        {/* Negative margin error */}
        {margin && margin.actualMargin < 0 && (
          <Alert severity='error' sx={{ mt: 2 }}>
            <Typography variant='body2'>
              <strong>Negative margin!</strong> The total amount is less than
              vendor cost. This will result in a loss. Please adjust your
              pricing.
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={updatePricingMutation.isPending}>
          Cancel
        </Button>
        <Button
          onClick={handleUpdatePricing}
          variant='contained'
          disabled={
            updatePricingMutation.isPending ||
            !adminServiceCharge ||
            !totalAmount ||
            !estimatedCost
          }
          startIcon={
            updatePricingMutation.isPending ? (
              <CircularProgress size={20} />
            ) : null
          }
        >
          {updatePricingMutation.isPending ? 'Updating...' : 'Update Pricing'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PricingDialog;
