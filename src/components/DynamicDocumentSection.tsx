import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import DocumentUploadSection from './DocumentUploadSection';
import RiderDocumentUpload from './RiderDocumentUpload';

interface DynamicDocumentSectionProps {
  userId: string;
  userType: 'VENDOR' | 'RIDER' | 'USER' | 'ADMIN';
}

const DynamicDocumentSection: React.FC<DynamicDocumentSectionProps> = ({
  userId,
  userType,
}) => {
  // Render appropriate document component based on user type
  const renderDocumentComponent = () => {
    switch (userType) {
      case 'VENDOR':
        return (
          <Box>
            <Typography variant='h6' gutterBottom fontWeight='bold'>
              📄 Vendor Document Management
            </Typography>
            <Typography
              variant='body2'
              color='text.secondary'
              gutterBottom
              mb={2}
            >
              Upload and manage VAT and business certificate documents for
              vendor approval
            </Typography>
            <DocumentUploadSection userId={userId} />
          </Box>
        );

      case 'RIDER':
        return (
          <Box>
            <Typography variant='h6' gutterBottom fontWeight='bold'>
              🚗 Rider Document Management
            </Typography>
            <Typography
              variant='body2'
              color='text.secondary'
              gutterBottom
              mb={2}
            >
              Upload and manage driver's license document for rider approval
            </Typography>
            <RiderDocumentUpload riderId={userId} />
          </Box>
        );

      case 'USER':
        return (
          <Alert severity='info' sx={{ mt: 2 }}>
            No document requirements for regular users.
          </Alert>
        );

      case 'ADMIN':
        return (
          <Alert severity='info' sx={{ mt: 2 }}>
            No document requirements for admin users.
          </Alert>
        );

      default:
        return (
          <Alert severity='warning' sx={{ mt: 2 }}>
            Unknown user type. Unable to determine document requirements.
          </Alert>
        );
    }
  };

  return <Box>{renderDocumentComponent()}</Box>;
};

export default DynamicDocumentSection;
