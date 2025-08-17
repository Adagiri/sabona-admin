import {
  Box,
  Typography,
  Paper,
  Chip,
  Divider,
  Stack,
  Grid2,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Grid,
} from '@mui/material';
import { CheckCircle, Home, Phone, Email } from '@mui/icons-material';
import { getDriverTipsAction, useGetUserDetails } from '../hooks/Admin/query';
import { useNavigate, useParams } from 'react-router-dom';
import MediaItem from '../components/MediaItem';
import { StringUtil } from '../utils/stringUtil';
import { useForm, Controller } from 'react-hook-form';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useCallback, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import DocumentUploadSection from '../components/DocumentUploadSection';
import VendorLocationMap from '../components/VendorLocationMap';
import VendorLaundriesSection from '../components/VendorLaundriesSection';

interface DateRangeFormData {
  dateFrom: Dayjs | null;
  dateTo: Dayjs | null;
}

interface Tip {
  id: string;
  amount: number;
  orderId: string;
  createdAt: string;
}

interface DriverTips {
  id: string;
  receivedTips: Tip[];
}

const UserDetails = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { data: userDetails } = useGetUserDetails(params.userId as string);
  const [driverTips, setDriverTips] = useState<DriverTips>();

  const {
    control: dateControl,
    handleSubmit: handleDateSubmit,
    watch,
  } = useForm<DateRangeFormData>({
    defaultValues: {
      dateFrom: null,
      dateTo: null,
    },
  });

  const onDateRangeSubmit = useCallback(
    async (data: DateRangeFormData) => {
      try {
        const res = await getDriverTipsAction(params.userId as string, {
          startDate: data.dateFrom?.format('YYYY-MM-DD') ?? '',
          endDate: data.dateTo?.endOf('day').toISOString() ?? '',
        });
        setDriverTips(res);
      } catch (error: any) {
        showError(error.message);
      }
    },
    [params.userId]
  );

  const showError = useCallback((errorMessage: string) => {
    toast(errorMessage, { type: 'error' });
  }, []);

  const validateNotFuture = (value: Dayjs | null) => {
    if (value && value.isAfter(dayjs(), 'day')) {
      return 'Please select a date on or before today.';
    }
    return true;
  };

  const dateFrom = watch('dateFrom');
  const dateTo = watch('dateTo');
  const isIncomplete = !dateFrom || !dateTo;

  const validateDateTo = (value: Dayjs | null) => {
    if (value && value.isAfter(dayjs(), 'day')) {
      return 'Please select a date on or before today.';
    }

    if (dateFrom && value && value.isBefore(dateFrom, 'day')) {
      return 'End date should be on or after the start date.';
    }
    return true;
  };

  return (
    <Box p={4}>
      <ToastContainer />

      {/* Header */}
      <Typography variant='h4' gutterBottom fontWeight='bold'>
        {StringUtil.convertToPascalCase(
          userDetails?.data.type === 'RIDER'
            ? 'driver'
            : userDetails?.data.type ?? 'User'
        )}{' '}
        Details
      </Typography>

      {/* Basic User Information */}
      <Paper
        elevation={6}
        sx={{
          mb: 4,
          borderRadius: 3,
          p: 4,
          bgcolor: 'white',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{ justifyContent: 'space-between' }}
          spacing={4}
        >
          <Box>
            <Typography
              variant='h6'
              fontWeight='bold'
              color='#333'
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <Home fontSize='small' sx={{ mr: 1, color: '#00796b' }} />
              User Name
            </Typography>
            <Typography variant='body1' color='#555' sx={{ ml: 3.5 }}>
              {userDetails?.data.firstName} {userDetails?.data.lastName}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant='h6'
              fontWeight='bold'
              color='#333'
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <Phone fontSize='small' sx={{ mr: 1, color: '#00796b' }} />
              Phone number
            </Typography>
            <Typography variant='body1' color='#555' sx={{ ml: 3.3 }}>
              {userDetails?.data.phone?.replace(
                /(\d{3})(\d{3})(\d{4})/,
                '($1) $2-$3'
              )}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant='h6'
              fontWeight='bold'
              color='#333'
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <Email fontSize='small' sx={{ mr: 1, color: '#00796b' }} />
              Email Address
            </Typography>
            <Typography variant='body1' color='#555' sx={{ ml: 3.3 }}>
              {userDetails?.data.email}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant='h6'
              fontWeight='bold'
              color='#333'
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <CheckCircle fontSize='small' sx={{ mr: 1, color: '#00796b' }} />
              User Status
            </Typography>
            <Chip
              label={userDetails?.data.status || 'ACTIVE'}
              sx={{
                fontWeight: 'bold',
                textTransform: 'none',
                bgcolor:
                  userDetails?.data.status === 'ACTIVE' ? '#e0f7fa' : '#ffebee',
                color:
                  userDetails?.data.status === 'ACTIVE' ? '#00796b' : '#c62828',
                ml: 3.5,
                px: 2,
                py: 0.5,
                borderRadius: 1,
                boxShadow: '0px 2px 5px rgba(0,0,0,0.2)',
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
                  🏢 Business Details
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Stack spacing={2}>
                  {userDetails?.data.settings?.businessCertificateNumber && (
                    <Box>
                      <Typography
                        variant='subtitle2'
                        fontWeight='bold'
                        color='#666'
                      >
                        Business Certificate
                      </Typography>
                      <Typography variant='body1'>
                        {userDetails.data.settings.businessCertificateNumber}
                      </Typography>
                    </Box>
                  )}

                  {userDetails?.data.settings?.vatNumber && (
                    <Box>
                      <Typography
                        variant='subtitle2'
                        fontWeight='bold'
                        color='#666'
                      >
                        VAT Number
                      </Typography>
                      <Typography variant='body1'>
                        {userDetails.data.settings.vatNumber}
                      </Typography>
                    </Box>
                  )}

                  <Box>
                    <Typography
                      variant='subtitle2'
                      fontWeight='bold'
                      color='#666'
                    >
                      Account Status
                    </Typography>
                    <Chip
                      label={userDetails?.data.status}
                      sx={{
                        backgroundColor:
                          userDetails?.data.status === 'ACTIVE'
                            ? '#e8f5e8'
                            : '#ffebee',
                        color:
                          userDetails?.data.status === 'ACTIVE'
                            ? '#2e7d32'
                            : '#c62828',
                        px: 2,
                        py: 0.5,
                        borderRadius: 1,
                      }}
                    />
                  </Box>

                  {userDetails?.data.settings?.isOnboardingCompleted && (
                    <Box>
                      <Typography
                        variant='subtitle2'
                        fontWeight='bold'
                        color='#666'
                      >
                        Onboarding
                      </Typography>
                      <Typography variant='body1' color='success.main'>
                        ✅ Completed
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          {/* Vendor Laundries Section */}
          <VendorLaundriesSection vendorId={userDetails.data.id} />

          {/* Document Management Section */}
          <DocumentUploadSection userId={userDetails?.data.id} />
        </>
      )}

      {/* Media Files Section */}
      <Typography variant='h5' gutterBottom fontWeight='bold' mt={4}>
        Media Files
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {userDetails?.data.medias?.length ? (
        <Grid2 container spacing={3} sx={{ mb: 4 }}>
          {userDetails.data.medias.map((file) => (
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

      {/* Driver Tips Section */}
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
                          helperText: error ? error.message : '',
                        },
                      }}
                    />
                  )}
                />

                <Controller
                  name='dateTo'
                  control={dateControl}
                  rules={{ validate: validateDateTo }}
                  render={({ field, fieldState: { error } }) => (
                    <DatePicker
                      {...field}
                      label='Date To'
                      onChange={(date) => field.onChange(date)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!error,
                          helperText: error ? error.message : '',
                        },
                      }}
                    />
                  )}
                />
              </Stack>
              <Box mt={2}>
                <Button
                  disabled={isIncomplete}
                  variant='contained'
                  type='submit'
                >
                  Search
                </Button>
              </Box>
            </form>
          </LocalizationProvider>

          {driverTips && (
            <Box mt={4}>
              <Box mb={2}>
                <Typography variant='h6' fontWeight='bold' color='#333'>
                  Total Tips:{' '}
                  {driverTips?.receivedTips.reduce(
                    (acc, tip) => acc + tip.amount,
                    0
                  )}{' '}
                  SAR
                </Typography>
              </Box>
              <Paper elevation={3}>
                <Table>
                  <TableHead>
                    <TableRow hover selected>
                      {['Amount', 'Order Id', 'Transaction Date'].map((col) => (
                        <TableCell style={{ fontWeight: 'bold' }} key={col}>
                          {col}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {driverTips?.receivedTips &&
                    driverTips?.receivedTips.length > 0 ? (
                      driverTips?.receivedTips.map((row, index) => (
                        <TableRow key={index} hover>
                          <TableCell>{row.amount ?? 'N/A'} SAR</TableCell>
                          <TableCell
                            style={{ cursor: 'pointer', color: '#1976d2' }}
                            onClick={() =>
                              navigate(`/order-details/${row.orderId}`)
                            }
                          >
                            {row.orderId ?? 'N/A'}
                          </TableCell>
                          <TableCell>
                            {new Date(row.createdAt).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} align='center'>
                          No tips received
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default UserDetails;
