import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CloudUpload,
  Visibility,
  CheckCircle,
  Error,
  Pending,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useGetRiderDocuments } from '../hooks/Admin/query';
import {
  useUploadRiderDocument,
  useFinaliseRiderDocument,
  useUploadImage,
  useFinaliseUploadImage,
} from '../hooks/Admin/mutation';
import uploadAndFinalizeImage from '../utils/uploadAndFinalizeImage';

// Updated component with corrected hooks and API calls

interface RiderDocumentUploadProps {
  riderId: string;
}

const RiderDocumentUpload: React.FC<RiderDocumentUploadProps> = ({
  riderId,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewDialog, setPreviewDialog] = useState<{
    open: boolean;
    url: string | null;
    title: string;
  }>({ open: false, url: null, title: '' });

  // Query hooks
  const {
    data: documents,
    isLoading,
    error,
    refetch,
  } = useGetRiderDocuments(riderId);

  // Mutation hooks
  const { mutateAsync: uploadImage } = useUploadImage();
  const { mutateAsync: finaliseImage } = useFinaliseUploadImage();
  const { mutateAsync: uploadRiderDoc } = useUploadRiderDocument();
  const { mutateAsync: finaliseRiderDoc } = useFinaliseRiderDocument();

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/pdf',
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image (JPG, PNG) or PDF file');
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Upload and finalize the image
      const uploadResult = await uploadAndFinalizeImage(
        file,
        uploadImage,
        finaliseImage,
        riderId,
        false
      );

      if (uploadResult) {
        // Upload the rider document
        await uploadRiderDoc({
          userId: riderId,
          driverLicenseDocId: uploadResult,
        });

        // Finalize the rider document
        await finaliseRiderDoc({
          userId: riderId,
          documentType: 'DRIVER_LICENSE_DOC',
          uploadId: uploadResult,
        });

        toast.success('Driver license uploaded successfully!');
        refetch(); // Refresh the documents list
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload driver license. Please try again.');
    } finally {
      setIsUploading(false);
      // Clear the file input
      event.target.value = '';
    }
  };

  const handlePreview = (url: string | null, title: string) => {
    if (url) {
      setPreviewDialog({ open: true, url, title });
    } else {
      toast.error('Preview not available for this document');
    }
  };

  const getStatusChip = (status: string) => {
    const statusMap = {
      READY: {
        color: 'success' as const,
        icon: <CheckCircle />,
        label: 'Ready',
      },
      UPLOADING: {
        color: 'warning' as const,
        icon: <Pending />,
        label: 'Uploading',
      },
      STALE: { color: 'error' as const, icon: <Error />, label: 'Error' },
    };

    const config =
      statusMap[status as keyof typeof statusMap] || statusMap.STALE;

    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size='small'
      />
    );
  };

  if (isLoading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight={200}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity='error' sx={{ mb: 2 }}>
        Error loading rider documents. Please try again.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant='h6' gutterBottom>
        Driver License Document
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        {!documents?.driverLicense ? (
          // No document uploaded yet
          <Box textAlign='center' py={4}>
            <CloudUpload sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
            <Typography variant='body1' color='textSecondary' mb={2}>
              No driver license document uploaded
            </Typography>

            <input
              type='file'
              id='driver-license-upload'
              hidden
              accept='.jpg,.jpeg,.png,.pdf'
              onChange={handleFileUpload}
              disabled={isUploading}
            />

            <label htmlFor='driver-license-upload'>
              <Button
                variant='contained'
                component='span'
                startIcon={
                  isUploading ? <CircularProgress size={20} /> : <CloudUpload />
                }
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload Driver License'}
              </Button>
            </label>

            <Typography
              variant='caption'
              display='block'
              mt={1}
              color='textSecondary'
            >
              Supported formats: JPG, PNG, PDF (Max 5MB)
            </Typography>
          </Box>
        ) : (
          // Document exists
          <Box>
            <Stack direction='row' alignItems='center' spacing={2} mb={2}>
              <Typography variant='subtitle1' fontWeight='bold'>
                Driver License Document
              </Typography>
              {getStatusChip(documents.driverLicense.status)}
            </Stack>

            <Stack direction='row' alignItems='center' spacing={2}>
              <Box flex={1}>
                <Typography variant='body2' color='textSecondary'>
                  File: {documents.driverLicense.name}
                </Typography>
                <Typography variant='body2' color='textSecondary'>
                  Uploaded:{' '}
                  {new Date(
                    documents.driverLicense.uploadedAt
                  ).toLocaleDateString()}
                </Typography>
              </Box>

              <Stack direction='row' spacing={1}>
                {documents.driverLicense.viewUrl && (
                  <IconButton
                    color='primary'
                    onClick={() =>
                      handlePreview(
                        documents.driverLicense!.viewUrl,
                        'Driver License'
                      )
                    }
                    title='Preview Document'
                  >
                    <Visibility />
                  </IconButton>
                )}

                <input
                  type='file'
                  id='driver-license-replace'
                  hidden
                  accept='.jpg,.jpeg,.png,.pdf'
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />

                <label htmlFor='driver-license-replace'>
                  <Button
                    variant='outlined'
                    component='span'
                    size='small'
                    startIcon={
                      isUploading ? (
                        <CircularProgress size={16} />
                      ) : (
                        <CloudUpload />
                      )
                    }
                    disabled={isUploading}
                  >
                    {isUploading ? 'Uploading...' : 'Replace'}
                  </Button>
                </label>
              </Stack>
            </Stack>
          </Box>
        )}
      </Paper>

      {/* Document Summary */}
      <Paper
        sx={{
          p: 2,
          backgroundColor: documents?.hasAllDocuments ? '#e8f5e8' : '#fff3e0',
        }}
      >
        <Stack direction='row' alignItems='center' spacing={2}>
          {documents?.hasAllDocuments ? (
            <CheckCircle color='success' />
          ) : (
            <Error color='warning' />
          )}
          <Typography variant='body2' fontWeight='medium'>
            {documents?.hasAllDocuments
              ? 'All required documents uploaded'
              : 'Driver license document required'}
          </Typography>
        </Stack>
      </Paper>

      {/* Preview Dialog */}
      <Dialog
        open={previewDialog.open}
        onClose={() => setPreviewDialog({ open: false, url: null, title: '' })}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>{previewDialog.title}</DialogTitle>
        <DialogContent>
          {previewDialog.url && (
            <Box textAlign='center'>
              {previewDialog.url.endsWith('.pdf') ? (
                <iframe
                  src={previewDialog.url}
                  style={{ width: '100%', height: '500px', border: 'none' }}
                  title='Document Preview'
                />
              ) : (
                <img
                  src={previewDialog.url}
                  alt='Document Preview'
                  style={{
                    maxWidth: '100%',
                    maxHeight: '500px',
                    objectFit: 'contain',
                  }}
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setPreviewDialog({ open: false, url: null, title: '' })
            }
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RiderDocumentUpload;
