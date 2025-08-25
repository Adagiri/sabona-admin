import React, { useState, useRef } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  LinearProgress,
  Alert,
  Divider,
  Grid,
  CircularProgress,
} from '@mui/material';
import {
  CloudUpload,
  Visibility,
  Description,
  CheckCircle,
  Refresh,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import {
  useUploadApplicationDocument,
  useUploadImage,
  useFinaliseUploadImage,
} from '../hooks/Admin/mutation';
import uploadAndFinalizeImage from '../utils/uploadAndFinalizeImage';
import { useGetApplicationDocuments } from '../hooks/Admin/query';

interface DocumentUploadSectionProps {
  userId: string;
}

const DocumentUploadSection: React.FC<DocumentUploadSectionProps> = ({
  userId,
}) => {
  const [uploading, setUploading] = useState<{
    vat: boolean;
    business: boolean;
  }>({
    vat: false,
    business: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [documents, setDocuments] = useState<{
    vatNumberDocId?: string;
    businessCertDocId?: string;
  }>({});

  const vatFileRef = useRef<HTMLInputElement>(null);
  const businessFileRef = useRef<HTMLInputElement>(null);

  const { mutateAsync: uploadImage } = useUploadImage();
  const { mutateAsync: finaliseUpload } = useFinaliseUploadImage();
  const { mutateAsync: uploadApplicationDocuments } =
    useUploadApplicationDocument();
  const { data: applicationDocuments, refetch: refetchDocs } =
    useGetApplicationDocuments(userId);

  const handleFileUpload = async (file: File, type: 'vat' | 'business') => {
    setUploading((prev) => ({ ...prev, [type]: true }));
    const isPublic = false;

    try {
      const mediaId = await uploadAndFinalizeImage(
        file,
        uploadImage,
        finaliseUpload,
        userId,
        isPublic
      );

      setDocuments((prev) => ({
        ...prev,
        [type === 'vat' ? 'vatNumberDocId' : 'businessCertDocId']:
          mediaId,
      }));

      toast.success(`${type.toUpperCase()} document uploaded successfully`);
    } catch (error: any) {
      console.error(`Upload error for ${type}:`, error);
      toast.error(
        `Failed to upload ${type} document: ${
          error?.message || 'Unknown error'
        }`
      );
    } finally {
      setUploading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleSubmitDocuments = async () => {
    // IMPROVED LOGIC: Use new document IDs where available, fall back to existing ones
    const finalVatId =
      documents.vatNumberDocId ||
      applicationDocuments?.vatNumberDoc?.id?.toString();
    const finalBusinessId =
      documents.businessCertDocId ||
      applicationDocuments?.businessCertDoc?.id?.toString();

    if (!finalVatId || !finalBusinessId) {
      toast.error(
        'Please ensure both VAT and business documents are available'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await uploadApplicationDocuments({
        userId,
        vatNumberDocId: finalVatId,
        businessCertDocId: finalBusinessId,
      });

      await refetchDocs();

      // Determine what was updated
      const updatedVat = documents.vatNumberDocId;
      const updatedBusiness = documents.businessCertDocId;
      const hasExisting =
        applicationDocuments?.vatNumberDoc &&
        applicationDocuments?.businessCertDoc;

      let message = '';
      if (hasExisting) {
        if (updatedVat && updatedBusiness) {
          message = 'Both documents updated successfully!';
        } else if (updatedVat) {
          message = 'VAT document updated successfully!';
        } else if (updatedBusiness) {
          message = 'Business document updated successfully!';
        } else {
          message = 'Documents resubmitted successfully!';
        }
      } else {
        message = 'Documents submitted successfully!';
      }

      toast.success(`${message} They are now available for review.`);
      setDocuments({}); // Clear local state
    } catch (error: any) {
      console.error('Submit documents error:', error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to submit documents';
      toast.error(`Submission failed: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect =
    (type: 'vat' | 'business') => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // Validate file type
        const allowedTypes = [
          'application/pdf',
          'image/jpeg',
          'image/jpg',
          'image/png',
        ];
        if (!allowedTypes.includes(file.type)) {
          toast.error('Please upload a valid PDF, JPG, or PNG file');
          return;
        }

        // Validate file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          toast.error('File size must be less than 10MB');
          return;
        }

        handleFileUpload(file, type);
      }
      // Clear the input value to allow re-uploading the same file
      e.target.value = '';
    };

  const viewDocument = (doc: any) => {
    console.log('Viewing document:', doc);
    if (doc?.url) {
      window.open(doc.url, '_blank');
    } else {
      toast.error('Document preview is not available');
    }
  };

  // Check what documents are available
  const hasSubmittedDocuments =
    applicationDocuments?.vatNumberDoc && applicationDocuments?.businessCertDoc;
  const hasNewDocuments =
    documents.vatNumberDocId || documents.businessCertDocId;

  // IMPROVED LOGIC: Show submit button if:
  // 1. Both documents are newly uploaded (first time)
  // 2. OR at least one document is newly uploaded AND existing documents can fill the gaps
  const canSubmitFirstTime =
    documents.vatNumberDocId && documents.businessCertDocId;
  const canSubmitReplacement = hasNewDocuments && hasSubmittedDocuments;
  const canSubmit = canSubmitFirstTime || canSubmitReplacement;

  // Determine if this would be a replacement or new submission
  const isReplacement = hasSubmittedDocuments && hasNewDocuments;

  return (
    <Card
      elevation={6}
      sx={{
        borderRadius: 3,
        bgcolor: 'white',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
        mb: 4,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography variant='h6' gutterBottom fontWeight='bold' color='#333'>
          📄 Document Management
        </Typography>
        <Typography variant='body2' color='text.secondary' gutterBottom>
          Upload and manage VAT and business certificate documents
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {/* Success Alert for Submitted Documents */}
        {hasSubmittedDocuments && !hasNewDocuments && (
          <Alert severity='success' sx={{ mb: 3 }} icon={<CheckCircle />}>
            All required documents have been submitted and are available for
            review. You can upload new documents to replace individual files if
            needed.
          </Alert>
        )}

        {/* Alert for pending replacements */}
        {isReplacement && (
          <Alert severity='info' sx={{ mb: 3 }} icon={<Refresh />}>
            {documents.vatNumberDocId && documents.businessCertDocId
              ? 'Both documents have been updated and are ready to replace existing ones.'
              : documents.vatNumberDocId
              ? 'New VAT document uploaded and ready to replace existing one.'
              : 'New business document uploaded and ready to replace existing one.'}{' '}
            Click "Update Documents" to submit the changes.
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* VAT Document */}
          <Grid item xs={12} md={6}>
            <Card variant='outlined' sx={{ p: 2, height: '100%' }}>
              <Box display='flex' alignItems='center' mb={2}>
                <Description color='primary' sx={{ mr: 1 }} />
                <Typography variant='subtitle1' fontWeight='bold'>
                  VAT Certificate
                </Typography>
              </Box>

              <input
                type='file'
                ref={vatFileRef}
                style={{ display: 'none' }}
                accept='.pdf,.jpg,.jpeg,.png'
                onChange={handleFileSelect('vat')}
              />

              <Box display='flex' gap={1} mb={2}>
                <Button
                  variant='outlined'
                  startIcon={
                    uploading.vat ? (
                      <CircularProgress size={16} />
                    ) : (
                      <CloudUpload />
                    )
                  }
                  onClick={() => vatFileRef.current?.click()}
                  disabled={uploading.vat || isSubmitting}
                  size='small'
                  fullWidth
                >
                  {uploading.vat
                    ? 'Uploading...'
                    : applicationDocuments?.vatNumberDoc
                    ? 'Replace VAT'
                    : 'Upload VAT'}
                </Button>

                {applicationDocuments?.vatNumberDoc && (
                  <Button
                    variant='contained'
                    startIcon={<Visibility />}
                    size='small'
                    onClick={() =>
                      viewDocument(applicationDocuments.vatNumberDoc)
                    }
                    color='success'
                  >
                    View
                  </Button>
                )}
              </Box>

              {uploading.vat && <LinearProgress sx={{ mb: 1 }} />}

              {documents.vatNumberDocId && (
                <Alert severity='success' sx={{ mb: 1 }}>
                  {applicationDocuments?.vatNumberDoc
                    ? 'New VAT document ready to replace existing'
                    : 'VAT document ready for submission'}
                </Alert>
              )}

              {applicationDocuments?.vatNumberDoc &&
                !documents.vatNumberDocId && (
                  <Alert severity='info' sx={{ mb: 1 }}>
                    Current VAT document will be used
                  </Alert>
                )}

              {applicationDocuments?.vatNumberDoc && (
                <Typography
                  variant='caption'
                  display='block'
                  color='text.secondary'
                >
                  Current document uploaded:{' '}
                  {new Date(
                    applicationDocuments.vatNumberDoc.updatedAt
                  ).toLocaleDateString()}
                </Typography>
              )}
            </Card>
          </Grid>

          {/* Business Document */}
          <Grid item xs={12} md={6}>
            <Card variant='outlined' sx={{ p: 2, height: '100%' }}>
              <Box display='flex' alignItems='center' mb={2}>
                <Description color='primary' sx={{ mr: 1 }} />
                <Typography variant='subtitle1' fontWeight='bold'>
                  Business Certificate
                </Typography>
              </Box>

              <input
                type='file'
                ref={businessFileRef}
                style={{ display: 'none' }}
                accept='.pdf,.jpg,.jpeg,.png'
                onChange={handleFileSelect('business')}
              />

              <Box display='flex' gap={1} mb={2}>
                <Button
                  variant='outlined'
                  startIcon={
                    uploading.business ? (
                      <CircularProgress size={16} />
                    ) : (
                      <CloudUpload />
                    )
                  }
                  onClick={() => businessFileRef.current?.click()}
                  disabled={uploading.business || isSubmitting}
                  size='small'
                  fullWidth
                >
                  {uploading.business
                    ? 'Uploading...'
                    : applicationDocuments?.businessCertDoc
                    ? 'Replace Business'
                    : 'Upload Business'}
                </Button>

                {applicationDocuments?.businessCertDoc && (
                  <Button
                    variant='contained'
                    startIcon={<Visibility />}
                    size='small'
                    onClick={() =>
                      viewDocument(applicationDocuments.businessCertDoc)
                    }
                    color='success'
                  >
                    View
                  </Button>
                )}
              </Box>

              {uploading.business && <LinearProgress sx={{ mb: 1 }} />}

              {documents.businessCertDocId && (
                <Alert severity='success' sx={{ mb: 1 }}>
                  {applicationDocuments?.businessCertDoc
                    ? 'New business document ready to replace existing'
                    : 'Business document ready for submission'}
                </Alert>
              )}

              {applicationDocuments?.businessCertDoc &&
                !documents.businessCertDocId && (
                  <Alert severity='info' sx={{ mb: 1 }}>
                    Current business document will be used
                  </Alert>
                )}

              {applicationDocuments?.businessCertDoc && (
                <Typography
                  variant='caption'
                  display='block'
                  color='text.secondary'
                >
                  Current document uploaded:{' '}
                  {new Date(
                    applicationDocuments.businessCertDoc.updatedAt
                  ).toLocaleDateString()}
                </Typography>
              )}
            </Card>
          </Grid>

          {/* Submit Button - Now shows for single document updates too */}
          {canSubmit && (
            <Grid item xs={12}>
              <Box display='flex' justifyContent='center' mt={2}>
                <Button
                  variant='contained'
                  color={isReplacement ? 'warning' : 'primary'}
                  onClick={handleSubmitDocuments}
                  size='large'
                  disabled={isSubmitting}
                  startIcon={
                    isSubmitting ? (
                      <CircularProgress size={20} color='inherit' />
                    ) : isReplacement ? (
                      <Refresh />
                    ) : (
                      <CloudUpload />
                    )
                  }
                >
                  {isSubmitting
                    ? isReplacement
                      ? 'Updating Documents...'
                      : 'Submitting Documents...'
                    : isReplacement
                    ? 'Update Documents'
                    : 'Submit Documents'}
                </Button>
              </Box>
            </Grid>
          )}

          {/* Submission Progress */}
          {isSubmitting && (
            <Grid item xs={12}>
              <Box mt={2}>
                <LinearProgress />
                <Typography
                  variant='caption'
                  display='block'
                  textAlign='center'
                  mt={1}
                >
                  {isReplacement
                    ? 'Processing document updates...'
                    : 'Processing document submission...'}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>

        {/* Help Text */}
        <Box mt={3}>
          <Typography variant='caption' color='text.secondary'>
            Supported formats: PDF, JPG, PNG • Maximum file size: 10MB each
            {hasSubmittedDocuments &&
              ' • Upload individual files to replace them, or both to update all documents'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DocumentUploadSection;
