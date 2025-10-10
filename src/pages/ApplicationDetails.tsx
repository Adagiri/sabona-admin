import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Divider,
  TextField,
  Alert,
  Chip,
  Stack,
  Paper,
  CircularProgress,
  Autocomplete,
} from '@mui/material';
import {
  ArrowBack,
  Person,
  Business,
  LocationOn,
  CheckCircle,
  Cancel,
  Search,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useGetUserDetails, useSearchMainVendors } from '../hooks/Admin/query';
import {
  useApproveApplication,
  useRejectApplication,
} from '../hooks/Admin/mutation';
import VendorLocationMap from '../components/VendorLocationMap';
import DynamicDocumentSection from '../components/DynamicDocumentSection';
import VendorLaundriesSection from '../components/VendorLaundriesSection';
import TranslationFields from '../components/TranslationFields';
import { useForm } from 'react-hook-form';

const ApplicationDetails = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [vendorDetails, setVendorDetails] = useState({
    addressLocale: { en: '', ar: '' },

    contactPhone: '',
  });
  const [rejectReason, setRejectReason] = useState('');
  const [selectedMainVendor, setSelectedMainVendor] = useState<any>(null);

  const [mainVendorSearchTerm, setMainVendorSearchTerm] = useState('');

  // Query hooks
  const {
    data: userDetails,
    isLoading,
    error,
    refetch,
  } = useGetUserDetails(userId!);

  // Search for main vendors - always enabled for vendor applications
  const { data: searchResults, isLoading: isSearching } = useSearchMainVendors({
    query: mainVendorSearchTerm,
    limit: 20,
    enabled:
      userDetails?.data?.type === 'VENDOR' && mainVendorSearchTerm.length >= 2,
  });

  // Add form control
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      addressLocale: { en: '', ar: '' },

      contactPhone: '',
    },
  });

  // Mutation hooks
  const { mutateAsync: approveApplication, isPending: isApproving } =
    useApproveApplication();
  const { mutateAsync: rejectApplication, isPending: isRejecting } =
    useRejectApplication();

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (userDetails?.data && !hasInitialized.current) {
      reset({
        addressLocale: { en: '', ar: '' },

        contactPhone: userDetails.data.phone || '',
      });

      setVendorDetails({
        addressLocale: { en: '', ar: '' },

        contactPhone: userDetails.data.phone || '',
      });

      hasInitialized.current = true; // ✅ Prevent future resets
    }
  }, [userDetails, reset]);

  const handleBack = () => {
    navigate('/applications');
  };

  const handleApprove = handleSubmit(async (formData) => {
    if (!userId) return;

    try {
      if (userDetails?.data?.type === 'VENDOR') {
        if (
          !formData.addressLocale.en ||
          !formData.addressLocale.ar ||
          !formData.contactPhone
        ) {
          toast.error(
            'Please provide all required vendor details in both languages'
          );
          return;
        }

        await approveApplication({
          userId,
          mainVendorId: selectedMainVendor?.id || '',
          addressLocale: formData.addressLocale,
          contactPhone: formData.contactPhone,
        });
      } else {
        // For riders
        await approveApplication({
          userId,
          mainVendorId: '',
          addressLocale: { en: '', ar: '' },

          contactPhone: userDetails?.data?.phone || '',
        });
      }

      toast.success(
        `${userDetails?.data?.type?.toLowerCase()} application approved successfully`
      );
      refetch();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || 'Failed to approve application'
      );
    }
  });

  const handleReject = async () => {
    if (!userId || !rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      await rejectApplication({
        userId,
        rejectionReason: rejectReason,
      });

      toast.success(
        `${userDetails?.data?.type?.toLowerCase()} application rejected`
      );
      refetch();
      setRejectReason('');
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || 'Failed to reject application'
      );
    }
  };

  const getStatusChip = (status: string) => {
    const statusMap = {
      ACTIVE: {
        color: 'success' as const,
        icon: <CheckCircle />,
        label: 'Approved',
      },
      INACTIVE: {
        color: 'warning' as const,
        icon: <Cancel />,
        label: 'Pending',
      },
      REJECTED: {
        color: 'error' as const,
        icon: <Cancel />,
        label: 'Rejected',
      },
    };

    const config =
      statusMap[status as keyof typeof statusMap] || statusMap.INACTIVE;
    return (
      <Chip icon={config.icon} label={config.label} color={config.color} />
    );
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
        Error loading application details. Please try again.
      </Alert>
    );
  }

  const user = userDetails.data;

  return (
    <Box p={3}>
      {/* Header */}
      <Box display='flex' alignItems='center' mb={3}>
        <Button startIcon={<ArrowBack />} onClick={handleBack} sx={{ mr: 2 }}>
          Back to Applications
        </Button>
        <Typography variant='h4' fontWeight='bold'>
          {user.type} Application Details
        </Typography>
        <Box ml='auto'>{getStatusChip(user.status)}</Box>
      </Box>

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                Basic Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={1}>
                <Typography>
                  <strong>Name:</strong> {user.firstName} {user.lastName}
                </Typography>
                <Typography>
                  <strong>Email:</strong> {user.email || 'Not provided'}
                </Typography>
                <Typography>
                  <strong>Phone:</strong> {user.phone || 'Not provided'}
                </Typography>
                <Typography>
                  <strong>Type:</strong> {user.type}
                </Typography>
                <Typography>
                  <strong>Status:</strong> {user.status}
                </Typography>
                <Typography>
                  <strong>Applied:</strong>{' '}
                  {new Date(user.createdAt).toLocaleDateString()}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Type-Specific Information */}
        {user.type === 'VENDOR' && user.settings?.laundryName && (
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  <Business sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Vendor Information
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Stack spacing={1}>
                  <Typography>
                    <strong>Laundry Name:</strong> {user.settings.laundryName}
                  </Typography>

                  {user.settings.lat && user.settings.long && (
                    <Typography>
                      <strong>Location:</strong> Provided
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}

        {user.type === 'RIDER' && (
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  🚗 Rider Information
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Stack spacing={1}>
                  <Typography>
                    <strong>Level:</strong> {user.level || 'BASIC'}
                  </Typography>
                  <Typography>
                    <strong>Documents Uploaded:</strong>{' '}
                    {user.settings?.isDocumentsUploaded ? '✅ Yes' : '❌ No'}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Location Map for Vendors */}
        {user.type === 'VENDOR' &&
          user.settings?.lat &&
          user.settings?.long && (
            <Grid item xs={12}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant='h6' gutterBottom>
                    <LocationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Business Location
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <VendorLocationMap
                    lat={user.settings.lat}
                    lng={user.settings.long}
                    laundryName={user.settings.laundryName || 'Vendor Location'}
                  />
                </CardContent>
              </Card>
            </Grid>
          )}

        {/* Vendor Laundries Section (Vendors only) */}
        {user.type === 'VENDOR' && user.status === 'ACTIVE' && (
          <Grid item xs={12}>
            <VendorLaundriesSection vendorId={user.id} />
          </Grid>
        )}

        {/* Dynamic Document Management */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <DynamicDocumentSection
              userId={user.id}
              userType={user.type as 'VENDOR' | 'RIDER' | 'USER' | 'ADMIN'}
            />
          </Paper>
        </Grid>

        {/* Approval Actions */}
        {user.status === 'INACTIVE' && (
          <Grid item xs={12}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Approval Actions
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {/* Vendor-specific approval fields */}
                {user.type === 'VENDOR' && (
                  <Box mb={3}>
                    <Typography variant='subtitle2' gutterBottom>
                      Vendor Details (Required for Approval)
                    </Typography>
                    <Grid container spacing={2} mb={3}>
                      <Grid item xs={12}>
                        <TranslationFields
                          control={control}
                          fieldName='addressLocale'
                          label='Business Address'
                          errors={errors}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label='Contact Phone'
                          value={vendorDetails.contactPhone}
                          onChange={(e) =>
                            setVendorDetails((prev) => ({
                              ...prev,
                              contactPhone: e.target.value,
                            }))
                          }
                          size='small'
                          required
                        />
                      </Grid>
                    </Grid>

                    {/* Main Vendor Search Section */}
                    <Box mb={3}>
                      <Typography variant='subtitle2' gutterBottom>
                        <Search sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Link to Main Vendor (Optional)
                      </Typography>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        display='block'
                        mb={2}
                      >
                        Search and select an existing main vendor to link this
                        application as a branch
                      </Typography>

                      <Autocomplete
                        options={searchResults || []}
                        getOptionLabel={(option) =>
                          `${option.laundryName} - ${option.phone} (${
                            option.branchCount || 0
                          } branches)`
                        }
                        value={selectedMainVendor}
                        onChange={(_, newValue) =>
                          setSelectedMainVendor(newValue)
                        }
                        onInputChange={(_, newInputValue) =>
                          setMainVendorSearchTerm(newInputValue)
                        }
                        loading={isSearching}
                        loadingText='Searching vendors...'
                        noOptionsText={
                          mainVendorSearchTerm.length < 2
                            ? 'Type at least 2 characters to search'
                            : 'No vendors found'
                        }
                        filterOptions={(x) => x} // Disable client-side filtering
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label='Search Main Vendors'
                            placeholder='Type laundry name to search...'
                            size='small'
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {isSearching ? (
                                    <CircularProgress
                                      color='inherit'
                                      size={20}
                                    />
                                  ) : null}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                        renderOption={(props, option) => (
                          <Box component='li' {...props}>
                            <Box>
                              <Typography variant='body2' fontWeight='bold'>
                                {option.laundryName}
                              </Typography>
                              <Typography
                                variant='caption'
                                color='text.secondary'
                              >
                                {option.phone} • {option.branchCount || 0}{' '}
                                branches
                              </Typography>
                            </Box>
                          </Box>
                        )}
                        sx={{ mb: 2 }}
                      />

                      {selectedMainVendor && (
                        <Alert severity='info' sx={{ mt: 2 }}>
                          Selected:{' '}
                          <strong>{selectedMainVendor.laundryName}</strong> as
                          main vendor. This vendor will be linked as a branch.
                        </Alert>
                      )}

                      {searchResults && searchResults.length >= 20 && (
                        <Alert severity='warning' sx={{ mt: 1 }}>
                          Showing first 20 results. Be more specific to narrow
                          down results.
                        </Alert>
                      )}
                    </Box>
                  </Box>
                )}

                <Stack
                  direction='row'
                  spacing={2}
                  alignItems='center'
                  flexWrap='wrap'
                >
                  <Button
                    variant='contained'
                    color='primary'
                    onClick={handleApprove}
                    disabled={isApproving}
                    startIcon={
                      isApproving ? (
                        <CircularProgress size={20} />
                      ) : (
                        <CheckCircle />
                      )
                    }
                  >
                    {isApproving ? 'Approving...' : `Approve ${user.type}`}
                  </Button>

                  <TextField
                    placeholder='Rejection reason (required)'
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    size='small'
                    sx={{ minWidth: 300 }}
                    multiline
                    rows={2}
                  />

                  <Button
                    variant='contained'
                    color='error'
                    onClick={handleReject}
                    disabled={!rejectReason.trim() || isRejecting}
                    startIcon={
                      isRejecting ? <CircularProgress size={20} /> : <Cancel />
                    }
                  >
                    {isRejecting ? 'Rejecting...' : 'Reject'}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Status Message */}
        {user.status === 'ACTIVE' && (
          <Grid item xs={12}>
            <Alert severity='success'>
              This {user.type.toLowerCase()} application has been approved and
              is active.
            </Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ApplicationDetails;
