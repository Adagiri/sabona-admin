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
} from '@mui/material';
import { CloudUpload, Visibility, Description } from '@mui/icons-material';
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
const isPublic = false
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
          mediaId.toString(),
      }));

      toast.success(`${type.toUpperCase()} document uploaded successfully`);
    } catch (error) {
      toast.error(`Failed to upload ${type} document`);
    } finally {
      setUploading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleSubmitDocuments = async () => {
    if (!documents.vatNumberDocId || !documents.businessCertDocId) {
      toast.error('Please upload both VAT and business documents first');
      return;
    }

    try {
      await uploadApplicationDocuments({
        userId,
        vatNumberDocId: documents.vatNumberDocId,
        businessCertDocId: documents.businessCertDocId,
      });

      await refetchDocs();
      toast.success('Documents submitted successfully');
      setDocuments({});
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || 'Failed to submit documents'
      );
    }
  };

  const handleFileSelect =
    (type: 'vat' | 'business') => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileUpload(file, type);
      }
    };

  const viewDocument = (doc: any) => {
    console.log(doc)
    const viewUrl = doc.url;
    window.open(viewUrl, '_blank');
  };

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
                  startIcon={<CloudUpload />}
                  onClick={() => vatFileRef.current?.click()}
                  disabled={uploading.vat}
                  size='small'
                  fullWidth
                >
                  {uploading.vat ? 'Uploading...' : 'Upload VAT'}
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
                  VAT document ready for submission
                </Alert>
              )}

              {applicationDocuments?.vatNumberDoc && (
                <Typography
                  variant='caption'
                  display='block'
                  color='text.secondary'
                >
                  Last uploaded:{' '}
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
                  startIcon={<CloudUpload />}
                  onClick={() => businessFileRef.current?.click()}
                  disabled={uploading.business}
                  size='small'
                  fullWidth
                >
                  {uploading.business ? 'Uploading...' : 'Upload Business'}
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
                  Business document ready for submission
                </Alert>
              )}

              {applicationDocuments?.businessCertDoc && (
                <Typography
                  variant='caption'
                  display='block'
                  color='text.secondary'
                >
                  Last uploaded:{' '}
                  {new Date(
                    applicationDocuments.businessCertDoc.updatedAt
                  ).toLocaleDateString()}
                </Typography>
              )}
            </Card>
          </Grid>

          {/* Submit Button */}
          {documents.vatNumberDocId && documents.businessCertDocId && (
            <Grid item xs={12}>
              <Box display='flex' justifyContent='center' mt={2}>
                <Button
                  variant='contained'
                  color='primary'
                  onClick={handleSubmitDocuments}
                  size='large'
                  startIcon={<CloudUpload />}
                >
                  Submit Documents
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default DocumentUploadSection;
