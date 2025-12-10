import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
  Alert,
  Tabs,
  Tab,
  CircularProgress,
  FormGroup,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Dayjs } from 'dayjs';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useBroadcastNotification } from '../hooks/Admin/mutation';
import {
  BroadcastNotificationRequest,
  NOTIFICATION_ACTION_TYPE,
} from '../hooks/Admin/interface';
import { NotificationsActive, Send } from '@mui/icons-material';

interface FormData {
  titleEn: string;
  bodyEn: string;
  titleAr: string;
  bodyAr: string;
  actionType: NOTIFICATION_ACTION_TYPE | '';
  route: string;
  sendToAll: boolean;
  userTypes: {
    USER: boolean;
    VENDOR: boolean;
    RIDER: boolean;
  };
  registrationStartDate: Dayjs | null;
  registrationEndDate: Dayjs | null;
  minOrderCount: number | null;
  maxOrderCount: number | null;
}

const schema = yup.object({
  titleEn: yup
    .string()
    .required('English title is required')
    .max(50, 'Title must be 50 characters or less'),
  bodyEn: yup
    .string()
    .required('English message is required')
    .max(200, 'Message must be 200 characters or less'),
  titleAr: yup
    .string()
    .required('Arabic title is required')
    .max(50, 'Title must be 50 characters or less'),
  bodyAr: yup
    .string()
    .required('Arabic message is required')
    .max(200, 'Message must be 200 characters or less'),
  actionType: yup.string(),
  route: yup.string(),
  sendToAll: yup.boolean(),
  registrationStartDate: yup
    .mixed<Dayjs>()
    .nullable()
    .test(
      'is-before-end',
      'Start date must be before end date',
      function (value) {
        const { registrationEndDate } = this.parent;
        if (!value || !registrationEndDate) return true;
        return value.isBefore(registrationEndDate);
      }
    ),
  registrationEndDate: yup.mixed<Dayjs>().nullable(),
  minOrderCount: yup
    .number()
    .nullable()
    .transform((value, originalValue) =>
      originalValue === '' || originalValue === null ? null : value
    )
    .min(0, 'Min orders must be non-negative'),
  maxOrderCount: yup
    .number()
    .nullable()
    .transform((value, originalValue) =>
      originalValue === '' || originalValue === null ? null : value
    )
    .min(0, 'Max orders must be non-negative')
    .test(
      'is-greater-than-min',
      'Max orders must be greater than min orders',
      function (value) {
        const { minOrderCount } = this.parent;
        if (value === null || value === undefined || minOrderCount === null) return true;
        return value >= minOrderCount;
      }
    ),
});

const defaultFormValues: FormData = {
  titleEn: '',
  bodyEn: '',
  titleAr: '',
  bodyAr: '',
  actionType: '',
  route: '',
  sendToAll: true,
  userTypes: {
    USER: false,
    VENDOR: false,
    RIDER: false,
  },
  registrationStartDate: null,
  registrationEndDate: null,
  minOrderCount: null,
  maxOrderCount: null,
};

const BroadcastNotification: React.FC = () => {
  const [previewLang, setPreviewLang] = useState<'en' | 'ar'>('en');
  const [result, setResult] = useState<{
    message: string;
    totalRecipients: number;
    notificationsSent: number;
  } | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: defaultFormValues,
  });

  const broadcastMutation = useBroadcastNotification();

  const formValues = watch();

  const onSubmit = async (data: FormData) => {
    try {
      const selectedUserTypes: ('USER' | 'VENDOR' | 'RIDER')[] = [];
      if (data.userTypes.USER) selectedUserTypes.push('USER');
      if (data.userTypes.VENDOR) selectedUserTypes.push('VENDOR');
      if (data.userTypes.RIDER) selectedUserTypes.push('RIDER');

      const payload: BroadcastNotificationRequest = {
        titleEn: data.titleEn,
        bodyEn: data.bodyEn,
        titleAr: data.titleAr,
        bodyAr: data.bodyAr,
      };

      if (data.actionType) {
        payload.actionType = data.actionType as NOTIFICATION_ACTION_TYPE;
      }

      if (data.route) {
        payload.route = data.route;
      }

      if (!data.sendToAll) {
        if (selectedUserTypes.length > 0) {
          payload.userTypes = selectedUserTypes;
        }
        if (data.registrationStartDate) {
          payload.registrationStartDate =
            data.registrationStartDate.toISOString();
        }
        if (data.registrationEndDate) {
          payload.registrationEndDate = data.registrationEndDate.toISOString();
        }
        if (data.minOrderCount !== null) {
          payload.minOrderCount = data.minOrderCount;
        }
        if (data.maxOrderCount !== null) {
          payload.maxOrderCount = data.maxOrderCount;
        }
      }

      const response = await broadcastMutation.mutateAsync(payload);
      setResult(response);
      toast.success('Notification sent successfully!');

      // Reset form after successful send
      reset(defaultFormValues);
    } catch (error: any) {
      console.error('Broadcast error:', error);
    }
  };

  const handleCancel = () => {
    reset(defaultFormValues);
    setResult(null);
  };

  const getRouteForActionType = (actionType: string): string => {
    const routes: Record<string, string> = {
      ORDERS: 'orders',
      PROFILE: 'profile',
      HOME: 'home',
      PROMOTIONS: 'promotions',
    };
    return routes[actionType] || '';
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
        <ToastContainer />

        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <NotificationsActive sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" component="h1">
              Broadcast Notifications
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Send push notifications to your users with advanced filtering options
          </Typography>
        </Paper>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Notification Content Section */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notification Content
              </Typography>

              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                English Version
              </Typography>

              <Controller
                name="titleEn"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Title (English)"
                    required
                    fullWidth
                    margin="normal"
                    error={!!errors.titleEn}
                    helperText={errors.titleEn?.message}
                    inputProps={{ maxLength: 50 }}
                  />
                )}
              />

              <Controller
                name="bodyEn"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Message (English)"
                    required
                    fullWidth
                    multiline
                    rows={4}
                    margin="normal"
                    error={!!errors.bodyEn}
                    helperText={errors.bodyEn?.message}
                    inputProps={{ maxLength: 200 }}
                  />
                )}
              />

              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 3, mb: 2 }}>
                Arabic Version
              </Typography>

              <Controller
                name="titleAr"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Title (Arabic)"
                    required
                    fullWidth
                    margin="normal"
                    error={!!errors.titleAr}
                    helperText={errors.titleAr?.message}
                    inputProps={{ maxLength: 50, dir: 'rtl' }}
                  />
                )}
              />

              <Controller
                name="bodyAr"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Message (Arabic)"
                    required
                    fullWidth
                    multiline
                    rows={4}
                    margin="normal"
                    error={!!errors.bodyAr}
                    helperText={errors.bodyAr?.message}
                    inputProps={{ maxLength: 200, dir: 'rtl' }}
                  />
                )}
              />
            </CardContent>
          </Card>

          {/* Action Configuration Section */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Action Configuration (Optional)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                When user taps notification, take them to:
              </Typography>

              <Controller
                name="actionType"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Action Type"
                    fullWidth
                    margin="normal"
                    onChange={(e) => {
                      field.onChange(e);
                      const route = getRouteForActionType(e.target.value);
                      setValue('route', route);
                    }}
                  >
                    <MenuItem value="">None (default - opens home screen)</MenuItem>
                    <MenuItem value={NOTIFICATION_ACTION_TYPE.ORDERS}>
                      Orders
                    </MenuItem>
                    <MenuItem value={NOTIFICATION_ACTION_TYPE.PROFILE}>
                      Profile
                    </MenuItem>
                    <MenuItem value={NOTIFICATION_ACTION_TYPE.PROMOTIONS}>
                      Promotions
                    </MenuItem>
                    <MenuItem value={NOTIFICATION_ACTION_TYPE.HOME}>
                      Home
                    </MenuItem>
                  </TextField>
                )}
              />

              <Controller
                name="route"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Screen Route"
                    fullWidth
                    margin="normal"
                    helperText="Auto-filled based on Action Type, can be customized"
                  />
                )}
              />
            </CardContent>
          </Card>

          {/* Target Audience Section */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Target Audience
              </Typography>

              <Controller
                name="sendToAll"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...field}
                        checked={field.value}
                        color="primary"
                      />
                    }
                    label="Send to all active users"
                  />
                )}
              />

              {!formValues.sendToAll && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    User Types:
                  </Typography>
                  <FormGroup>
                    <Controller
                      name="userTypes.USER"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              {...field}
                              checked={field.value}
                              color="primary"
                            />
                          }
                          label="Customers"
                        />
                      )}
                    />
                    <Controller
                      name="userTypes.VENDOR"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              {...field}
                              checked={field.value}
                              color="primary"
                            />
                          }
                          label="Vendors"
                        />
                      )}
                    />
                    <Controller
                      name="userTypes.RIDER"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              {...field}
                              checked={field.value}
                              color="primary"
                            />
                          }
                          label="Riders"
                        />
                      )}
                    />
                  </FormGroup>

                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Registration Date:
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="registrationStartDate"
                        control={control}
                        render={({ field }) => (
                          <DatePicker
                            {...field}
                            label="Start Date"
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                error: !!errors.registrationStartDate,
                                helperText: errors.registrationStartDate?.message,
                              },
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="registrationEndDate"
                        control={control}
                        render={({ field }) => (
                          <DatePicker
                            {...field}
                            label="End Date"
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                error: !!errors.registrationEndDate,
                                helperText: errors.registrationEndDate?.message,
                              },
                            }}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>

                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Order Count:
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="minOrderCount"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            type="number"
                            label="Min Orders"
                            fullWidth
                            error={!!errors.minOrderCount}
                            helperText={errors.minOrderCount?.message}
                            inputProps={{ min: 0 }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="maxOrderCount"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            type="number"
                            label="Max Orders"
                            fullWidth
                            error={!!errors.maxOrderCount}
                            helperText={errors.maxOrderCount?.message}
                            inputProps={{ min: 0 }}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Preview Section */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Preview
              </Typography>

              <Tabs
                value={previewLang}
                onChange={(_, newValue) => setPreviewLang(newValue)}
                sx={{ mb: 2 }}
              >
                <Tab label="English Preview" value="en" />
                <Tab label="Arabic Preview" value="ar" />
              </Tabs>

              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  backgroundColor: '#f5f5f5',
                  minHeight: 120,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Box
                  sx={{
                    backgroundColor: 'white',
                    p: 2,
                    borderRadius: 2,
                    width: '100%',
                    boxShadow: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <NotificationsActive sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ dir: previewLang === 'ar' ? 'rtl' : 'ltr' }}>
                      {previewLang === 'en'
                        ? formValues.titleEn || 'Notification Title'
                        : formValues.titleAr || 'عنوان الإشعار'}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ dir: previewLang === 'ar' ? 'rtl' : 'ltr' }}
                  >
                    {previewLang === 'en'
                      ? formValues.bodyEn || 'Notification message will appear here'
                      : formValues.bodyAr || 'ستظهر رسالة الإشعار هنا'}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 1 }}
                  >
                    Just now
                  </Typography>
                </Box>
              </Paper>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                <Button variant="outlined" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={
                    broadcastMutation.isPending ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <Send />
                    )
                  }
                  disabled={broadcastMutation.isPending}
                >
                  {broadcastMutation.isPending ? 'Sending...' : 'Send Notification'}
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Result Display */}
          {result && (
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Notification sent successfully!
              </Typography>
              <Typography variant="body2">
                Total Recipients: {result.totalRecipients} users
              </Typography>
              <Typography variant="body2">
                Notifications Sent: {result.notificationsSent}
              </Typography>
            </Alert>
          )}

          {result && result.totalRecipients === 0 && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body2">
                No users found matching the specified filters
              </Typography>
            </Alert>
          )}
        </form>
      </Box>
    </LocalizationProvider>
  );
};

export default BroadcastNotification;
