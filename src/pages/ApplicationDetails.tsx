import { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Modal,
  Grid,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { useGetUserDetails } from '../hooks/Admin/query';
import {
  useApproveApplication,
  useRejectApplication,
} from '../hooks/Admin/mutation';
import VendorLocationMap from '../components/VendorLocationMap';
import DocumentUploadSection from '../components/DocumentUploadSection';
import MainVendorSearch from '../components/MainVendorSearch';

interface ApprovalFormData {
  mainVendorId: string;
  address: string;
  contactPhone: string;
}

interface ApprovalFormErrors {
  mainVendorId?: string;
  address?: string;
  contactPhone?: string;
}

const ApplicationDetails = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMainVendor, setSelectedMainVendor] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  // Form data for approval
  const [formData, setFormData] = useState<ApprovalFormData>({
    mainVendorId: '',
    address: '',
    contactPhone: '',
  });

  const [formErrors, setFormErrors] = useState<ApprovalFormErrors>({});

  const { data: userDetails, isLoading, error } = useGetUserDetails(userId!);
  const { mutateAsync: approveApplication } = useApproveApplication();
  const { mutateAsync: rejectApplication } = useRejectApplication();

  const user = userDetails?.data;

  const validateForm = (): boolean => {
    const errors: ApprovalFormErrors = {};

    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    }

    if (!formData.contactPhone.trim()) {
      errors.contactPhone = 'Contact phone is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleApprove = useCallback(async () => {
    if (!userId || !validateForm()) return;

    setIsApproving(true);
    try {
      const payload:any = {
        userId,
        address: formData.address,
        contactPhone: formData.contactPhone,
      };

      if (selectedMainVendor?.id) {
        payload.mainVendorId = selectedMainVendor?.id;
      }
      await approveApplication(payload);
      toast.success('Application approved successfully');
      navigate('/application/1');
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || 'Failed to approve application'
      );
    } finally {
      setIsApproving(false);
      setModalOpen(false);
    }
  }, [userId, selectedMainVendor, formData, approveApplication, navigate]);

  const handleReject = useCallback(async () => {
    if (!userId || !rejectReason.trim()) return;

    setIsRejecting(true);
    try {
      await rejectApplication({
        userId,
        rejectionReason: rejectReason, // Backend expects 'rejectionReason'
      });
      toast.success('Application rejected');
      navigate('/application/1');
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || 'Failed to reject application'
      );
    } finally {
      setIsRejecting(false);
    }
  }, [userId, rejectReason, rejectApplication, navigate]);

  const handleOpenApprovalModal = () => {
    setFormData({
      mainVendorId: '',
      address: '',
      contactPhone: '',
    });
    setSelectedMainVendor(null);
    setFormErrors({});
    setModalOpen(true);
  };

  if (isLoading) return <CircularProgress />;
  if (error || !user)
    return <Alert severity='error'>Failed to load application details</Alert>;

  return (
    <Box p={3}>
      <ToastContainer />

      {/* Header */}
      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        mb={3}
      >
        <Typography variant='h4'>{user.type} Application Details</Typography>
        <Button variant='outlined' onClick={() => navigate('/application/1')}>
          Back to Applications
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* User Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Typography>
                <strong>Name:</strong> {user.firstName} {user.lastName}
              </Typography>
              <Typography>
                <strong>Email:</strong> {user.email}
              </Typography>
              <Typography>
                <strong>Phone:</strong> {user.phone}
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

              {user.type === 'VENDOR' && user.settings?.laundryName && (
                <Typography>
                  <strong>Laundry Name:</strong> {user.settings.laundryName}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Location Map for Vendors */}
        {user.type === 'VENDOR' &&
          user.settings?.lat &&
          user.settings?.long && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant='h6' gutterBottom>
                    Pinned Location
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

        {/* Document Management (Independent of Approval) */}
        <Grid item xs={12}>
          <DocumentUploadSection userId={userId!} />
        </Grid>

        {/* Approval Actions */}
        {user.status === 'INACTIVE' && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Approval Actions
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box display='flex' gap={2} alignItems='center'>
                  <Button
                    variant='contained'
                    color='primary'
                    onClick={handleOpenApprovalModal}
                  >
                    Approve Application
                  </Button>

                  <TextField
                    placeholder='Rejection reason (required)'
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    size='small'
                    sx={{ minWidth: 250 }}
                    multiline
                    rows={2}
                  />
                  <Button
                    variant='contained'
                    color='error'
                    onClick={handleReject}
                    disabled={!rejectReason.trim() || isRejecting}
                  >
                    {isRejecting ? (
                      <CircularProgress size={20} color='inherit' />
                    ) : (
                      'Reject'
                    )}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Approval Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 700,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            maxHeight: '90vh',
            overflow: 'auto',
          }}
        >
          <Typography variant='h6' gutterBottom>
            Approve Application
          </Typography>

          {user.type === 'VENDOR' && (
            <MainVendorSearch
              onVendorSelect={(vendor) => {
                setSelectedMainVendor(vendor);
                setFormData((prev) => ({
                  ...prev,
                  mainVendorId: vendor?.id || '',
                }));
              }}
              selectedVendor={selectedMainVendor}
              error={formErrors.mainVendorId}
              required={false}
            />
          )}

          <TextField
            fullWidth
            label='Address *'
            value={formData.address}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, address: e.target.value }))
            }
            margin='normal'
            placeholder='Enter complete address'
            required
            error={!!formErrors.address}
            helperText={
              formErrors.address || 'Full address where the business operates'
            }
            multiline
            rows={3}
          />

          <TextField
            fullWidth
            label='Contact Phone *'
            value={formData.contactPhone}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, contactPhone: e.target.value }))
            }
            margin='normal'
            placeholder='+92xxxxxxxxxx'
            required
            error={!!formErrors.contactPhone}
            helperText={formErrors.contactPhone || 'Customer care phone number'}
          />

          <Box display='flex' justifyContent='end' gap={2} mt={3}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button
              variant='contained'
              onClick={handleApprove}
              disabled={isApproving}
            >
              {isApproving ? (
                <CircularProgress size={20} />
              ) : (
                'Approve Application'
              )}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default ApplicationDetails;
