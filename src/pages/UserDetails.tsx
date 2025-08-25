// File: src/pages/UserDetails.tsx
// Replace the Document Management Section with this updated version:

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Divider,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Controller, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import {  getDriverTipsAction, useGetUserDetails } from '../hooks/Admin/query';
import VendorLaundriesSection from '../components/VendorLaundriesSection';
import DynamicDocumentSection from '../components/DynamicDocumentSection'; // New import
import MediaItem from '../components/MediaItem';
import VendorLocationMap from '../components/VendorLocationMap';
import dayjs, { Dayjs } from 'dayjs';
import { toast } from 'react-toastify';
import { Grid2 } from '@mui/material';

interface DateRangeForm {
  dateFrom: Dayjs | null;
  dateTo: Dayjs | null;
}

const UserDetails = () => {
  const { userId } = useParams<{ userId: string }>();
  const [driverTips, setDriverTips] = useState<any>(null);
  const [tipsLoading, setTipsLoading] = useState(false);

  const { data: userDetails, isLoading, error } = useGetUserDetails(userId!);

  const {
    control: dateControl,
    handleSubmit: handleDateSubmit,
    formState: { errors: dateErrors },
  } = useForm<DateRangeForm>({
    defaultValues: {
      dateFrom: dayjs().subtract(30, 'day'),
      dateTo: dayjs(),
    },
  });

  const validateNotFuture = (value: Dayjs | null) => {
    if (!value) return 'Date is required';
    if (value.isAfter(dayjs(), 'day')) return 'Date cannot be in the future';
    return true;
  };

  const onDateRangeSubmit = async (data: DateRangeForm) => {
    if (!data.dateFrom || !data.dateTo || !userId) return;

    if (data.dateFrom.isAfter(data.dateTo)) {
      toast.error('Start date must be before end date');
      return;
    }

    setTipsLoading(true);
    try {
      const tips = await getDriverTipsAction(userId, {
        startDate: data.dateFrom.format('YYYY-MM-DD'),
        endDate: data.dateTo.format('YYYY-MM-DD'),
      });
      setDriverTips(tips);
    } catch (error) {
      console.log(error)
      toast.error('Failed to fetch driver tips');
    } finally {
      setTipsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'warning';
      case 'REJECTED':
        return 'error';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight={400}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !userDetails?.data) {
    return (
      <Alert severity='error' sx={{ m: 2 }}>
        Error loading user details. Please try again.
      </Alert>
    );
  }

  return (
    <Box p={3}>
      {/* User Information Section */}
      <Typography variant='h4' gutterBottom fontWeight='bold'>
        User Details
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Paper
        elevation={6}
        sx={{
          borderRadius: 3,
          p: 3,
          mb: 4,
          bgcolor: 'white',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={3}
          alignItems='flex-start'
        >
          <Box flex={1}>
            <Typography variant='h6' fontWeight='bold' gutterBottom>
              {userDetails.data.firstName} {userDetails.data.lastName}
            </Typography>
            <Typography variant='body2' color='text.secondary' gutterBottom>
              {userDetails.data.email}
            </Typography>
            <Typography variant='body2' color='text.secondary' gutterBottom>
              {userDetails.data.phone}
            </Typography>
            <Typography variant='body2' color='text.secondary' gutterBottom>
              User ID: {userDetails.data.id}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Joined:{' '}
              {new Date(userDetails.data.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
          <Box>
            <Chip
              label={`${userDetails.data.type} - ${userDetails.data.status}`}
              color={getStatusColor(userDetails.data.status) as any}
              sx={{
                fontWeight: 'bold',
                px: 2,
                py: 0.5,
                borderRadius: 1,
              }}
            />
          </Box>
        </Stack>
      </Paper>

      {/* Vendor Information Section */}
      {userDetails?.data.type === 'VENDOR' && (
        <>
          <Typography variant='h5' gutterBottom fontWeight='bold' mt={2}>
            Vendor Information
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3} mb={4}>
            {/* Vendor Location Map */}
            {userDetails?.data.settings?.lat &&
              userDetails?.data.settings?.long && (
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={6}
                    sx={{
                      borderRadius: 3,
                      p: 3,
                      bgcolor: 'white',
                      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                      height: 'fit-content',
                    }}
                  >
                    <Typography
                      variant='h6'
                      gutterBottom
                      fontWeight='bold'
                      color='#333'
                    >
                      📍 Business Location
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    {userDetails?.data.settings?.laundryName && (
                      <Typography variant='body2' color='text.secondary' mb={2}>
                        <strong>Laundry Name:</strong>{' '}
                        {userDetails.data.settings.laundryName}
                      </Typography>
                    )}

                    <VendorLocationMap
                      lat={userDetails.data.settings.lat}
                      lng={userDetails.data.settings.long}
                      laundryName={
                        userDetails.data.settings.laundryName ||
                        'Vendor Location'
                      }
                    />
                  </Paper>
                </Grid>
              )}

            {/* Vendor Details */}
            <Grid
              item
              xs={12}
              md={
                userDetails?.data.settings?.lat &&
                userDetails?.data.settings?.long
                  ? 6
                  : 12
              }
            >
              <Paper
                elevation={6}
                sx={{
                  borderRadius: 3,
                  p: 3,
                  bgcolor: 'white',
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                  height: 'fit-content',
                }}
              >
                <Typography
                  variant='h6'
                  gutterBottom
                  fontWeight='bold'
                  color='#333'
                >
                  🏢 Vendor Details
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Stack spacing={1}>
                  {userDetails.data.settings?.laundryName && (
                    <Typography variant='body2'>
                      <strong>Business Name:</strong>{' '}
                      {userDetails.data.settings.laundryName}
                    </Typography>
                  )}
                  <Typography variant='body2'>
                    <strong>Level:</strong> {userDetails.data.level || 'BASIC'}
                  </Typography>
                  <Typography variant='body2'>
                    <strong>Documents Uploaded:</strong>{' '}
                    {userDetails.data.settings?.isDocumentsUploaded
                      ? '✅ Yes'
                      : '❌ No'}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          {/* Vendor Laundries Section */}
          <VendorLaundriesSection vendorId={userDetails.data.id} />
        </>
      )}

      {/* Rider Information Section */}
      {userDetails?.data.type === 'RIDER' && (
        <>
          <Typography variant='h5' gutterBottom fontWeight='bold' mt={2}>
            Rider Information
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Paper
            elevation={6}
            sx={{
              borderRadius: 3,
              p: 3,
              mb: 4,
              bgcolor: 'white',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Typography
              variant='h6'
              gutterBottom
              fontWeight='bold'
              color='#333'
            >
              🚗 Rider Details
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Stack spacing={1}>
              <Typography variant='body2'>
                <strong>Level:</strong> {userDetails.data.level || 'BASIC'}
              </Typography>
              <Typography variant='body2'>
                <strong>Documents Uploaded:</strong>{' '}
                {userDetails.data.settings?.isDocumentsUploaded
                  ? '✅ Yes'
                  : '❌ No'}
              </Typography>
            </Stack>
          </Paper>
        </>
      )}

      {/* Dynamic Document Management Section */}
      <Typography variant='h5' gutterBottom fontWeight='bold' mt={4}>
        Document Management
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <DynamicDocumentSection
        userId={userDetails.data.id}
        userType={
          userDetails.data.type as 'VENDOR' | 'RIDER' | 'USER' | 'ADMIN'
        }
      />

      {/* Media Files Section */}
      <Typography variant='h5' gutterBottom fontWeight='bold' mt={4}>
        Media Files
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {userDetails?.data.medias?.length ? (
        <Grid2 container spacing={3} sx={{ mb: 4 }}>
          {userDetails.data.medias.map((file: any) => (
            <Box key={file.id} minWidth={200}>
              <MediaItem file={file} />
            </Box>
          ))}
        </Grid2>
      ) : (
        <Typography variant='body1' color='#555' mb={4}>
          No media files available
        </Typography>
      )}

      {/* Driver Tips Section - Only for Riders */}
      {userDetails?.data.type === 'RIDER' && (
        <Box mt={4}>
          <Typography variant='h5' fontWeight='bold' gutterBottom>
            Driver Tips
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <form onSubmit={handleDateSubmit(onDateRangeSubmit)}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Controller
                  name='dateFrom'
                  control={dateControl}
                  rules={{ validate: validateNotFuture }}
                  render={({ field, fieldState: { error } }) => (
                    <DatePicker
                      {...field}
                      label='Date From'
                      onChange={(date) => field.onChange(date)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!error,
                          helperText: error?.message,
                        },
                      }}
                    />
                  )}
                />
                <Controller
                  name='dateTo'
                  control={dateControl}
                  rules={{ validate: validateNotFuture }}
                  render={({ field, fieldState: { error } }) => (
                    <DatePicker
                      {...field}
                      label='Date To'
                      onChange={(date) => field.onChange(date)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!error,
                          helperText: error?.message,
                        },
                      }}
                    />
                  )}
                />
              </Stack>
            </form>
          </LocalizationProvider>

          {tipsLoading && <CircularProgress sx={{ mt: 2 }} />}

          {driverTips && (
            <Box mt={3}>
              <Typography variant='h6'>Tips Summary</Typography>
              <Typography>Total Tips: ${driverTips.total || 0}</Typography>
              <Typography>Number of Tips: {driverTips.count || 0}</Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default UserDetails;
