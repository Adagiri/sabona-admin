// File: src/pages/Driver.tsx

import React, { useMemo, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Pagination,
  CircularProgress,
  Alert,
  Chip,
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
  Description,
} from '@mui/icons-material';
import { useFetchAllUsers } from '../hooks/Admin/query';
import { USER_TYPES } from '../hooks/Admin/interface';
import { ToastContainer } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import RiderDocumentUpload from '../components/RiderDocumentUpload';
import DataTable, {
  DataTableColumn,
  DataTableAction,
} from '../components/DataTable';
import EditUserDialog from '../components/EditUserDialog';

const Driver = () => {
  const { pageNumber } = useParams<{ pageNumber: string }>();
  const [page, setPage] = useState<number>(Number(pageNumber) || 1);
  const [limit] = useState(10);
  const [selectedRiderId, setSelectedRiderId] = useState<string | null>(null);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

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
    console.log(typeof event);
    setPage(value);
    navigate(`/drivers/${value}`);
  };

  const handleViewDetails = useCallback(
    (row: any) => {
      navigate(`/user-details/${row.id}`);
    },
    [navigate]
  );

  const handleManageDocuments = useCallback((row: any) => {
    setSelectedRiderId(row.id);
    setDocumentDialogOpen(true);
  }, []);

  const handleEditClick = useCallback((row: any) => {
    setSelectedUser(row);
    setEditDialogOpen(true);
  }, []);

  const getStatusChip = (status: string) => {
    const statusMap = {
      ACTIVE: {
        color: 'success' as const,
        icon: <CheckCircle fontSize='small' />,
        label: 'Active',
      },
      INACTIVE: {
        color: 'error' as const,
        icon: <Error fontSize='small' />,
        label: 'Inactive',
      },
      REJECTED: {
        color: 'error' as const,
        icon: <Error fontSize='small' />,
        label: 'Rejected',
      },
      PENDING: {
        color: 'warning' as const,
        icon: <Warning fontSize='small' />,
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

  const getDocumentStatus = (driver: any) => {
    // Check if rider has documents uploaded
    const hasDocuments = driver.settings?.isDocumentsUploaded || false;
    const hasDriverLicense =
      driver.medias?.some(
        (media: any) => media.meta?.docType === 'DRIVER_LICENSE_DOC'
      ) || false;

    if (hasDocuments && hasDriverLicense) {
      return { status: 'Complete', color: 'success' as const };
    } else if (hasDocuments || hasDriverLicense) {
      return { status: 'Partial', color: 'warning' as const };
    } else {
      return { status: 'Missing', color: 'error' as const };
    }
  };

  const currentStart = useMemo(() => (page - 1) * limit + 1, [page, limit]);
  const currentEnd = useMemo(
    () => Math.min(page * limit, drivers?.count || 0),
    [page, limit, drivers?.count]
  );

  // Define table columns
  const columns: DataTableColumn[] = [
    {
      id: 'name',
      label: 'Name',
      minWidth: 150,
      accessor: (row: any) =>
        row?.name || `${row?.firstName || ''} ${row?.lastName || ''}`.trim(),
    },
    {
      id: 'phone',
      label: 'Phone',
      minWidth: 140,
      accessor: 'phone',
    },
    {
      id: 'email',
      label: 'Email',
      minWidth: 200,
      accessor: (row: any) => row?.email || 'Not provided',
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      render: (row: any) => getStatusChip(row?.status),
    },
    {
      id: 'documents',
      label: 'Documents',
      minWidth: 120,
      render: (row: any) => {
        const docStatus = getDocumentStatus(row);
        return (
          <Chip
            label={docStatus.status}
            color={docStatus.color}
            size='small'
            variant='outlined'
          />
        );
      },
    },
    {
      id: 'createdAt',
      label: 'Created',
      minWidth: 120,
      accessor: (row: any) =>
        row?.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A',
    },
  ];

  // Define table actions
  const actions: DataTableAction[] = [
    {
      label: 'View Details',
      icon: <Visibility fontSize='small' />,
      onClick: handleViewDetails,
      color: 'primary',
    },
    {
      label: 'Edit Rider',
      icon: <Edit fontSize='small' />,
      onClick: handleEditClick,
      color: 'secondary',
    },
    {
      label: 'Manage Documents',
      icon: <Description fontSize='small' />,
      onClick: handleManageDocuments,
      color: 'info',
    },
  ];

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
      <ToastContainer />
      <Typography variant='h4' gutterBottom fontWeight='bold'>
        Driver Management
      </Typography>

      {drivers?.data?.length ? (
        <>
          <DataTable
            columns={columns}
            data={drivers.data}
            actions={actions}
            onRowClick={handleViewDetails}
            loading={isLoading}
            emptyMessage='No drivers found'
            rowKey='id'
            maxHeight='65vh'
          />

          {/* Pagination */}
          <Box
            display='flex'
            justifyContent='space-between'
            alignItems='center'
            mt={2}
            py={2}
            px={2}
          >
            <Box flex='1' display='flex' justifyContent='center' ml={20}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color='primary'
                size='large'
              />
            </Box>
            {drivers && (
              <Typography variant='body2' sx={{ ml: 3 }}>
                Showing{' '}
                {drivers?.data?.length > 0
                  ? `${currentStart}-${currentEnd}`
                  : 0}{' '}
                of {drivers?.count || 0} items
              </Typography>
            )}
          </Box>
        </>
      ) : (
        <Alert severity='info'>
          No drivers found. No riders are currently registered in the system.
        </Alert>
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

      {/* Edit User Dialog */}
      <EditUserDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />
    </Box>
  );
};

export default Driver;
