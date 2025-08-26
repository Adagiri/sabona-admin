// File: src/pages/Driver.tsx

import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Pagination,
  CircularProgress,
  Alert,
  IconButton,
  Chip,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Visibility,
  Edit,
  CheckCircle,
  Warning,
  Error,
} from '@mui/icons-material';
import { useFetchAllUsers } from '../hooks/Admin/query';
import { USER_TYPES } from '../hooks/Admin/interface';
import { ToastContainer } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import RiderDocumentUpload from '../components/RiderDocumentUpload';

const Driver = () => {
  const { pageNumber } = useParams<{ pageNumber: string }>();
  const [page, setPage] = useState<number>(Number(pageNumber) || 1);
  const [limit] = useState(10);
  const [selectedRiderId, setSelectedRiderId] = useState<string | null>(null);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);

  const {
    data: drivers,
    isLoading,
    error: errorFetchingUsers,
    isError,
  } = useFetchAllUsers({
    type: USER_TYPES.RIDER,
    page,
    limit,
  });

  const totalPages = useMemo(
    () => Math.ceil((drivers?.count ?? 0) / limit),
    [drivers, limit]
  );
  const navigate = useNavigate();

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    console.log(typeof event)
    setPage(value);
    navigate(`/drivers/${value}`);
  };

  const handleViewDetails = (riderId: string) => {
    navigate(`/user-details/${riderId}`);
  };

  const handleManageDocuments = (riderId: string) => {
    setSelectedRiderId(riderId);
    setDocumentDialogOpen(true);
  };

  const getStatusChip = (status: string) => {
    const statusMap = {
      ACTIVE: {
        color: 'success' as const,
        icon: <CheckCircle />,
        label: 'Active',
      },
      INACTIVE: { color: 'error' as const, icon: <Error />, label: 'Inactive' },
      PENDING: {
        color: 'warning' as const,
        icon: <Warning />,
        label: 'Pending',
      },
    };

    const config =
      statusMap[status as keyof typeof statusMap] || statusMap.PENDING;

    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size='small'
      />
    );
  };

  const getDocumentStatus = (driver:any) => {
    // Check if rider has documents uploaded
    const hasDocuments = driver.settings?.isDocumentsUploaded || false;
    const hasDriverLicense =
      driver.medias?.some(
        (media) => media.meta?.docType === 'DRIVER_LICENSE_DOC'
      ) || false;

    if (hasDocuments && hasDriverLicense) {
      return { status: 'Complete', color: 'success' as const };
    } else if (hasDocuments || hasDriverLicense) {
      return { status: 'Partial', color: 'warning' as const };
    } else {
      return { status: 'Missing', color: 'error' as const };
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

  if (isError) {
    return (
      <Alert severity='error' sx={{ mb: 2 }}>
        Error loading drivers:{' '}
        {errorFetchingUsers?.message || 'Unknown error occurred'}
      </Alert>
    );
  }

  return (
    <Box p={3}>
      <Typography variant='h4' gutterBottom fontWeight='bold'>
        Driver Management
      </Typography>

      {drivers?.data?.length ? (
        <>
          <Paper sx={{ width: '100%', overflow: 'hidden', mb: 3 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Documents</TableCell>
                  <TableCell>Level</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {drivers.data.map((driver) => {
                  const docStatus = getDocumentStatus(driver);
                  return (
                    <TableRow key={driver.id} hover>
                      <TableCell>
                        <Typography variant='body2' fontFamily='monospace'>
                          {driver.id.slice(0, 8)}...
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' fontWeight='medium'>
                          {driver.firstName} {driver.lastName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2'>
                          {driver.email || 'Not provided'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2'>
                          {driver.phone || 'Not provided'}
                        </Typography>
                      </TableCell>
                      <TableCell>{getStatusChip(driver.status)}</TableCell>
                      <TableCell>
                        <Chip
                          label={docStatus.status}
                          color={docStatus.color}
                          size='small'
                          variant='outlined'
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={driver.level || 'BASIC'}
                          size='small'
                          variant='outlined'
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2'>
                          {new Date(driver.createdAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction='row' spacing={1}>
                          <IconButton
                            size='small'
                            color='primary'
                            onClick={() => handleViewDetails(driver.id)}
                            title='View Details'
                          >
                            <Visibility />
                          </IconButton>
                          <IconButton
                            size='small'
                            color='secondary'
                            onClick={() => handleManageDocuments(driver.id)}
                            title='Manage Documents'
                          >
                            <Edit />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>

          <Box display='flex' justifyContent='center' mt={3}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color='primary'
              size='large'
            />
          </Box>
        </>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant='h6' color='textSecondary'>
            No drivers found
          </Typography>
          <Typography variant='body2' color='textSecondary' mt={1}>
            No riders are currently registered in the system.
          </Typography>
        </Paper>
      )}

      {/* Document Management Dialog */}
      <Dialog
        open={documentDialogOpen}
        onClose={() => setDocumentDialogOpen(false)}
        maxWidth='md'
        fullWidth
        PaperProps={{
          sx: { minHeight: '500px' },
        }}
      >
        <DialogTitle>
          <Typography variant='h6'>Manage Rider Documents</Typography>
        </DialogTitle>
        <DialogContent>
          {selectedRiderId && <RiderDocumentUpload riderId={selectedRiderId} />}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDocumentDialogOpen(false)}
            variant='outlined'
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer />
    </Box>
  );
};

export default Driver;
