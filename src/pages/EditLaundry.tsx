import React, { useEffect } from 'react';
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
  Grid,
} from '@mui/material';
import { ArrowBack, NavigateNext, Save, MyLocation } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { useForm, Controller } from 'react-hook-form';
import { useFetchLaundryById } from '../hooks/Admin/query';
import VendorLocationMap from '../components/VendorLocationMap';
import { useEditLaundry } from '../hooks/Admin/mutation';
import TranslationFields from '../components/TranslationFields';

interface LaundryFormData {
  nameLocale: {
    en: string;
    ar: string;
  };
  addressLocale: {
    en: string;
    ar: string;
  };
  lat: number;
  long: number;
  vendorName: string;
  vendorEmail: string;
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
    setValue,
    trigger,
    formState: { errors, isDirty },
  } = useForm<LaundryFormData>({
    defaultValues: {
      nameLocale: { en: '', ar: '' },
      addressLocale: { en: '', ar: '' },
      lat: 0,
      long: 0,
      vendorName: '',
      vendorEmail: '',
    },
  });

  // Populate form when laundry data loads
  useEffect(() => {
    if (laundry?.data) {
      const { nameLocale, addressLocale, name, address, lat, long, vendor } =
        laundry.data;

      // Use locale fields if available, otherwise fallback to name/address
      setValue('nameLocale', nameLocale || { en: name || '', ar: name || '' });
      setValue(
        'addressLocale',
        addressLocale || { en: address || '', ar: address || '' }
      );
      setValue('lat', lat);
      setValue('long', long);

      // Combine firstName and lastName into a single name field
      const fullName = [vendor?.firstName, vendor?.lastName]
        .filter(Boolean)
        .join(' ');
      setValue('vendorName', fullName);
      setValue('vendorEmail', vendor?.email || '');
    }
  }, [laundry, setValue]);

  const nameEn = watch('nameLocale.en');
  const currentLat = watch('lat');
  const currentLong = watch('long');

  const onSubmit = async (data: LaundryFormData) => {
    try {
      await editLaundry({
        laundryId: laundryId!,
        data: {
          nameLocale: data.nameLocale,
          addressLocale: data.addressLocale,
          lat: Number(data.lat),
          long: Number(data.long),
          vendorName: data.vendorName,
          vendorEmail: data.vendorEmail,
        },
      });
      toast.success('Laundry and vendor updated successfully');
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
          setValue('lat', latitude, { shouldDirty: true });
          setValue('long', longitude, { shouldDirty: true });
          trigger(['lat', 'long']);
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

  const handleMapLocationChange = (lat: number, lng: number) => {
    setValue('lat', lat, { shouldDirty: true });
    setValue('long', lng, { shouldDirty: true });
    trigger(['lat', 'long']);
    toast.info('Location updated. Click Save to apply changes.');
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
                Update laundry and owner information
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Stack>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={4}>
          {/* Laundry Information */}
          <Paper sx={{ p: 3 }}>
            <Typography variant='h6' gutterBottom fontWeight='bold' mb={3}>
              Laundry Information
            </Typography>

            <Grid container spacing={3}>
              {/* Laundry Name - Translation Fields */}
              <Grid item xs={12}>
                <TranslationFields
                  control={control}
                  fieldName='nameLocale'
                  label='Laundry Name'
                  errors={errors}
                  required
                />
              </Grid>

              {/* Business Address - Translation Fields */}
              <Grid item xs={12}>
                <TranslationFields
                  control={control}
                  fieldName='addressLocale'
                  label='Business Address'
                  errors={errors}
                  required
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Location Information */}
          <Paper sx={{ p: 3 }}>
            <Stack
              direction='row'
              justifyContent='space-between'
              alignItems='center'
              mb={2}
            >
              <Typography variant='h6' fontWeight='bold'>
                Location
              </Typography>
              <Button
                variant='outlined'
                size='small'
                startIcon={<MyLocation />}
                onClick={handleGetCurrentLocation}
              >
                Use Current Location
              </Button>
            </Stack>

            <Typography variant='body2' color='text.secondary' mb={3}>
              Click on the map or drag the marker to update the location
            </Typography>

            <Grid container spacing={2} mb={3}>
              <Grid item xs={12} md={6}>
                <Controller
                  name='lat'
                  control={control}
                  rules={{
                    required: 'Latitude is required',
                    min: { value: -90, message: 'Latitude must be >= -90' },
                    max: { value: 90, message: 'Latitude must be <= 90' },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label='Latitude'
                      type='number'
                      fullWidth
                      error={!!errors.lat}
                      helperText={errors.lat?.message}
                      inputProps={{ step: 'any' }}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name='long'
                  control={control}
                  rules={{
                    required: 'Longitude is required',
                    min: { value: -180, message: 'Longitude must be >= -180' },
                    max: { value: 180, message: 'Longitude must be <= 180' },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label='Longitude'
                      type='number'
                      fullWidth
                      error={!!errors.long}
                      helperText={errors.long?.message}
                      inputProps={{ step: 'any' }}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  )}
                />
              </Grid>
            </Grid>

            {/* Interactive Map */}
            {currentLat && currentLong && (
              <Box sx={{ height: 300 }}>
                <VendorLocationMap
                  lat={currentLat}
                  lng={currentLong}
                  laundryName={nameEn || 'Laundry Location'}
                  editable={true}
                  onLocationChange={handleMapLocationChange}
                />
              </Box>
            )}
          </Paper>

          {/* Owner Information - NOW EDITABLE */}
          <Paper sx={{ p: 3 }}>
            <Typography variant='h6' gutterBottom fontWeight='bold' mb={3}>
              Owner Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Controller
                  name='vendorName'
                  control={control}
                  rules={{ required: 'Owner name is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label='Owner Name'
                      fullWidth
                      error={!!errors.vendorName}
                      helperText={errors.vendorName?.message}
                      placeholder='Full name'
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name='vendorEmail'
                  control={control}
                  rules={{
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label='Email'
                      type='email'
                      fullWidth
                      error={!!errors.vendorEmail}
                      helperText={errors.vendorEmail?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Box mt={2}>
              <Button
                variant='text'
                onClick={() =>
                  navigate(`/user-details/${laundry?.data?.vendorId}`)
                }
                sx={{ alignSelf: 'flex-start' }}
              >
                View Full Vendor Profile
              </Button>
            </Box>
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
