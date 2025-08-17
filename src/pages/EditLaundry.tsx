// File: src/pages/EditLaundry.tsx

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Stack,
  Breadcrumbs,
  Link,
  IconButton,
  Alert,
} from '@mui/material';
import { ArrowBack, NavigateNext, Save, LocationOn } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { useForm, Controller } from 'react-hook-form';
import { useFetchLaundryById } from '../hooks/Admin/query';
import VendorLocationMap from '../components/VendorLocationMap';
import { useEditLaundry } from '../hooks/Admin/mutation';

interface LaundryFormData {
  name: string;
  address: string;
  lat: number;
  long: number;
}

const EditLaundry: React.FC = () => {
  const { laundryId } = useParams<{ laundryId: string }>();
  const navigate = useNavigate();

  const { data: laundry, isLoading, error } = useFetchLaundryById(laundryId!);
  const { mutateAsync: editLaundry, isPending } = useEditLaundry();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<LaundryFormData>({
    defaultValues: {
      name: '',
      address: '',
      lat: 0,
      long: 0,
    },
    values: laundry?.data
      ? {
          name: laundry.data.name,
          address: laundry.data.address || '',
          lat: laundry.data.lat,
          long: laundry.data.long,
        }
      : undefined,
  });

  const currentLat = watch('lat');
  const currentLong = watch('long');
  const currentName = watch('name');

  const onSubmit = async (data: LaundryFormData) => {
    try {
      await editLaundry({
        laundryId: laundryId!,
        data: {
          name: data.name,
          address: data.address,
          lat: Number(data.lat),
          long: Number(data.long),
        },
      });
      toast.success('Laundry updated successfully');
      navigate('/laundry');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update laundry');
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Update form values
          control._formValues.lat = latitude;
          control._formValues.long = longitude;
          control._trigger(['lat', 'long']);
          toast.success('Location updated to current position');
        },
        (error) => {
          toast.error('Failed to get current location: ' + error.message);
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser');
    }
  };

  if (isLoading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='60vh'
      >
        <Typography>Loading laundry details...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity='error'>
          Failed to load laundry:{' '}
          {(error as any)?.response?.data?.message || 'Unknown error'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <ToastContainer />

      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNext fontSize='small' />} sx={{ mb: 2 }}>
        <Link
          component='button'
          variant='body1'
          onClick={() => navigate('/laundry')}
          sx={{ textDecoration: 'none' }}
        >
          Laundry Management
        </Link>
        <Typography color='text.primary'>Edit {laundry?.data?.name}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Stack
        direction='row'
        justifyContent='space-between'
        alignItems='center'
        mb={3}
      >
        <Box>
          <Stack direction='row' alignItems='center' spacing={2}>
            <IconButton onClick={() => navigate('/laundry')}>
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant='h4' fontWeight='bold'>
                Edit Laundry
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Update laundry details and location
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Stack>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={4}>
          {/* Laundry Information */}
          <Paper sx={{ p: 3 }}>
            <Typography variant='h6' gutterBottom fontWeight='bold'>
              Laundry Information
            </Typography>

            <Stack spacing={3}>
              <Controller
                name='name'
                control={control}
                rules={{ required: 'Laundry name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label='Laundry Name'
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />

              <Controller
                name='address'
                control={control}
                rules={{ required: 'Address is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label='Address'
                    fullWidth
                    multiline
                    rows={2}
                    error={!!errors.address}
                    helperText={errors.address?.message}
                  />
                )}
              />
            </Stack>
          </Paper>

          {/* Location Information */}
          <Paper sx={{ p: 3 }}>
            <Stack
              direction='row'
              justifyContent='space-between'
              alignItems='center'
              mb={3}
            >
              <Typography variant='h6' fontWeight='bold'>
                Location Coordinates
              </Typography>
              <Button
                variant='outlined'
                startIcon={<LocationOn />}
                onClick={handleGetCurrentLocation}
              >
                Get Current Location
              </Button>
            </Stack>

            <Stack direction='row' spacing={2} mb={3}>
              <Controller
                name='lat'
                control={control}
                rules={{
                  required: 'Latitude is required',
                  min: { value: -90, message: 'Invalid latitude' },
                  max: { value: 90, message: 'Invalid latitude' },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label='Latitude'
                    type='number'
                    fullWidth
                    inputProps={{ step: 'any' }}
                    error={!!errors.lat}
                    helperText={errors.lat?.message}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                )}
              />

              <Controller
                name='long'
                control={control}
                rules={{
                  required: 'Longitude is required',
                  min: { value: -180, message: 'Invalid longitude' },
                  max: { value: 180, message: 'Invalid longitude' },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label='Longitude'
                    type='number'
                    fullWidth
                    inputProps={{ step: 'any' }}
                    error={!!errors.long}
                    helperText={errors.long?.message}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                )}
              />
            </Stack>

            {/* Map Preview */}
            {currentLat && currentLong && (
              <Box sx={{ height: 300, mt: 2 }}>
                <Typography variant='body2' color='text.secondary' mb={1}>
                  Location Preview:
                </Typography>
                <VendorLocationMap
                  lat={currentLat}
                  lng={currentLong}
                  laundryName={currentName || 'Laundry Location'}
                />
              </Box>
            )}
          </Paper>

          {/* Vendor Information (Read-only) */}
          <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
            <Typography variant='h6' gutterBottom fontWeight='bold'>
              Owner Information
            </Typography>

            <Stack spacing={2}>
              <Typography variant='body2'>
                <strong>Name:</strong> {laundry?.data?.vendor?.firstName}{' '}
                {laundry?.data?.vendor?.lastName}
              </Typography>
              <Typography variant='body2'>
                <strong>Email:</strong> {laundry?.data?.vendor?.email}
              </Typography>
              <Button
                variant='text'
                onClick={() =>
                  navigate(`/user-details/${laundry?.data?.vendorId}`)
                }
                sx={{ alignSelf: 'flex-start' }}
              >
                View Vendor Details
              </Button>
            </Stack>
          </Paper>

          {/* Action Buttons */}
          <Stack direction='row' spacing={2} justifyContent='flex-end'>
            <Button variant='outlined' onClick={() => navigate('/laundry')}>
              Cancel
            </Button>
            <Button
              type='submit'
              variant='contained'
              startIcon={<Save />}
              disabled={!isDirty || isPending}
            >
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </Stack>
        </Stack>
      </form>
    </Box>
  );
};

export default EditLaundry;
