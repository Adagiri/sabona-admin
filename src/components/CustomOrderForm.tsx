import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  MenuItem,
  Chip,
  Stack,
} from '@mui/material';
import { MapPin, AlertTriangle, CheckCircle } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

interface CustomOrderFormData {
  customLaundryName: string;
  customLaundryDescription: string;
  customLaundryLat: number;
  customLaundryLong: number;
  pickupAddress: string;
  pickupTime: string;
  pickupDate: string;
  deliveryAddress: string;
  deliveryType: 'NORMAL' | 'EXPRESS';
  paymentType: 'CASH' | 'CARD';
  note?: string;
}

// Validation schema
const customOrderSchema = yup.object({
  customLaundryName: yup
    .string()
    .required('Laundry name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),

  customLaundryDescription: yup
    .string()
    .required('Description is required')
    .min(20, 'Description must be at least 20 characters')
    .max(1000, 'Description must be less than 1000 characters'),

  customLaundryLat: yup
    .number()
    .required('Please pin the laundry location on map')
    .min(-90, 'Invalid latitude')
    .max(90, 'Invalid latitude'),

  customLaundryLong: yup
    .number()
    .required('Please pin the laundry location on map')
    .min(-180, 'Invalid longitude')
    .max(180, 'Invalid longitude'),

  pickupAddress: yup.string().required('Pickup address is required'),
  pickupTime: yup.string().required('Pickup time is required'),
  pickupDate: yup.string().required('Pickup date is required'),
  deliveryAddress: yup.string().required('Delivery address is required'),
  deliveryType: yup.string().oneOf(['NORMAL', 'EXPRESS']).required(),
  paymentType: yup.string().oneOf(['CASH', 'CARD']).required(),
  note: yup.string().optional(),
});

interface LocationValidation {
  isValid: boolean;
  nearbyLaundries: any[];
  warnings: string[];
}

export default function CustomOrderForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationValidation, setLocationValidation] =
    useState<LocationValidation | null>(null);
  const [isValidatingLocation, setIsValidatingLocation] = useState(false);
  const [orderEstimate, setOrderEstimate] = useState<any>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CustomOrderFormData>({
    resolver: yupResolver(customOrderSchema),
    defaultValues: {
      deliveryType: 'NORMAL',
      paymentType: 'CASH',
      pickupDate: new Date().toISOString().split('T')[0],
    },
  });

  const watchedLat = watch('customLaundryLat');
  const watchedLong = watch('customLaundryLong');

  // Validate location when coordinates change
  React.useEffect(() => {
    if (
      watchedLat &&
      watchedLong &&
      !isNaN(watchedLat) &&
      !isNaN(watchedLong)
    ) {
      validateLocation(watchedLat, watchedLong);
    }
  }, [watchedLat, watchedLong]);

  const validateLocation = async (lat: number, long: number) => {
    setIsValidatingLocation(true);
    try {
      const response = await fetch('/v1/customer/validate-custom-location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ lat, long }),
      });

      if (response.ok) {
        const validation = await response.json();
        setLocationValidation(validation);
      }
    } catch (error) {
      console.error('Location validation failed:', error);
    } finally {
      setIsValidatingLocation(false);
    }
  };

  const onSubmit = async (data: CustomOrderFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/v1/customer/create-custom-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setOrderEstimate(result.estimate);
        alert(
          'Custom order created successfully! Admin will review and assign a driver.'
        );
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to create custom order:', error);
      alert('Failed to create custom order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography
        variant='h4'
        gutterBottom
        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <MapPin size={32} />
        Custom Laundry Order
      </Typography>

      <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
        Order from a laundry that's not registered on our platform. Our admin
        will review and assign a driver.
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant='h6' gutterBottom>
            Custom Laundry Details
          </Typography>

          <Controller
            name='customLaundryName'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label='Laundry Name'
                fullWidth
                margin='normal'
                error={!!errors.customLaundryName}
                helperText={errors.customLaundryName?.message}
                placeholder='e.g., Quick Clean Laundry'
              />
            )}
          />

          <Controller
            name='customLaundryDescription'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label='Detailed Description of Your Laundry Needs'
                fullWidth
                multiline
                rows={4}
                margin='normal'
                error={!!errors.customLaundryDescription}
                helperText={
                  errors.customLaundryDescription?.message ||
                  'Describe your items, special instructions, preferred detergent, etc. (minimum 20 characters)'
                }
                placeholder='Example: Need washing for 5 white shirts, 3 dark pants, and 2 bed sheets. Please use gentle detergent as I have sensitive skin. Prefer air drying over machine drying. No starch needed.'
              />
            )}
          />

          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant='subtitle1' gutterBottom>
              Pin Laundry Location on Map
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller
                name='customLaundryLat'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label='Latitude'
                    type='number'
                    inputProps={{ step: 'any' }}
                    error={!!errors.customLaundryLat}
                    helperText={errors.customLaundryLat?.message}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                )}
              />
              <Controller
                name='customLaundryLong'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label='Longitude'
                    type='number'
                    inputProps={{ step: 'any' }}
                    error={!!errors.customLaundryLong}
                    helperText={errors.customLaundryLong?.message}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                )}
              />
            </Box>

            <Alert severity='info' sx={{ mt: 1 }}>
              Use the map to pin the exact location of the laundry vendor
            </Alert>
          </Box>

          {/* Location validation results */}
          {isValidatingLocation && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 2 }}>
              <CircularProgress size={16} />
              <Typography variant='body2'>Validating location...</Typography>
            </Box>
          )}

          {locationValidation && (
            <Box sx={{ my: 2 }}>
              {!locationValidation.isValid && (
                <Alert severity='warning' sx={{ mb: 2 }}>
                  Location appears to be outside our service area
                </Alert>
              )}

              {locationValidation.warnings.map((warning, index) => (
                <Alert severity='info' key={index} sx={{ mb: 1 }}>
                  <AlertTriangle size={16} style={{ marginRight: 8 }} />
                  {warning}
                </Alert>
              ))}

              {locationValidation.nearbyLaundries.length > 0 && (
                <Alert severity='info'>
                  <Typography variant='subtitle2' gutterBottom>
                    Registered laundries nearby (consider using them instead):
                  </Typography>
                  <Stack
                    direction='row'
                    spacing={1}
                    sx={{ flexWrap: 'wrap', gap: 1 }}
                  >
                    {locationValidation.nearbyLaundries.map((laundry) => (
                      <Chip
                        key={laundry.id}
                        label={laundry.name}
                        size='small'
                        variant='outlined'
                      />
                    ))}
                  </Stack>
                </Alert>
              )}
            </Box>
          )}
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant='h6' gutterBottom>
            Pickup & Delivery Details
          </Typography>

          <Controller
            name='pickupAddress'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label='Pickup Address'
                fullWidth
                margin='normal'
                error={!!errors.pickupAddress}
                helperText={errors.pickupAddress?.message}
              />
            )}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Controller
              name='pickupDate'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label='Pickup Date'
                  type='date'
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.pickupDate}
                  helperText={errors.pickupDate?.message}
                  sx={{ flex: 1 }}
                />
              )}
            />
            <Controller
              name='pickupTime'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label='Pickup Time'
                  type='time'
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.pickupTime}
                  helperText={errors.pickupTime?.message}
                  sx={{ flex: 1 }}
                />
              )}
            />
          </Box>

          <Controller
            name='deliveryAddress'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label='Delivery Address'
                fullWidth
                margin='normal'
                error={!!errors.deliveryAddress}
                helperText={errors.deliveryAddress?.message}
              />
            )}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Controller
              name='deliveryType'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label='Delivery Type'
                  fullWidth
                  margin='normal'
                >
                  <MenuItem value='NORMAL'>Normal Delivery (+10 SAR)</MenuItem>
                  <MenuItem value='EXPRESS'>
                    Express Delivery (+20 SAR)
                  </MenuItem>
                </TextField>
              )}
            />
            <Controller
              name='paymentType'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label='Payment Method'
                  fullWidth
                  margin='normal'
                >
                  <MenuItem value='CASH'>Cash</MenuItem>
                  <MenuItem value='CARD'>Card</MenuItem>
                </TextField>
              )}
            />
          </Box>

          <Controller
            name='note'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label='Additional Notes (Optional)'
                fullWidth
                margin='normal'
                multiline
                rows={2}
                placeholder='Any special instructions for the driver or additional details'
              />
            )}
          />
        </Paper>

        {/* Cost estimate */}
        {orderEstimate && (
          <Paper sx={{ p: 3, mb: 3, bgcolor: 'success.50' }}>
            <Typography
              variant='h6'
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <CheckCircle size={20} color='green' />
              Order Created Successfully!
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {orderEstimate.description}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant='body1'>
                <strong>Estimated Cost:</strong> {orderEstimate.estimatedCost}{' '}
                SAR
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Distance to vendor:{' '}
                {orderEstimate.customLaundryDistance.toFixed(1)}km
              </Typography>
            </Box>
          </Paper>
        )}

        {/* Warning about custom orders */}
        <Alert severity='warning' sx={{ mb: 3 }}>
          <Typography variant='subtitle2' gutterBottom>
            Custom Order Process:
          </Typography>
          <Typography variant='body2' component='div'>
            • Admin will review your order and assign a driver
            <br />
            • Driver will pick up your items and take them to the specified
            laundry
            <br />
            • Driver will pay the vendor and get a receipt
            <br />
            • You'll receive a PayTabs invoice to reimburse the payment
            <br />• After processing, items will be delivered back to you
          </Typography>
        </Alert>

        <Button
          type='submit'
          variant='contained'
          fullWidth
          size='large'
          disabled={
            isSubmitting ||
            (locationValidation !== null && !locationValidation.isValid)
          }
          sx={{ py: 1.5 }}
        >
          {isSubmitting ? (
            <CircularProgress size={24} color='inherit' />
          ) : (
            'Submit Custom Order for Admin Review'
          )}
        </Button>
      </form>
    </Box>
  );
}
