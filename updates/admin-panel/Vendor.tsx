import {
  Box,
  Typography,
  Pagination,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  Avatar,
} from '@mui/material';
import { Visibility, Edit, PhotoCamera, Business, LocalLaundryService } from '@mui/icons-material';
import { useFetchAllUsers, useFetchAllLaundries } from '../hooks/Admin/query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { USER_TYPES } from '../hooks/Admin/interface';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useFinaliseUploadImage,
  useUploadImage,
} from '../hooks/Admin/mutation';
import uploadAndFinalizeImage from '../utils/uploadAndFinalizeImage';
import DataTable, { DataTableColumn, DataTableAction } from '../components/DataTable';
import EditUserDialog from '../components/EditUserDialog';

const Vendor = () => {
  const { pageNumber } = useParams<{ pageNumber: string }>();
  const [page, setPage] = useState<number>(Number(pageNumber) || 1);
  const [limit] = useState(10);

  const { mutateAsync: uploadVendorDoc } = useUploadImage();
  const { mutateAsync: finaliseVendorDoc } = useFinaliseUploadImage();
  const [uploadId, setUploadId] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRefs = useRef<Record<string | number, HTMLInputElement>>({});

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const {
    data: vendors,
    isLoading,
    error,
    isError,
    refetch: refetchVendor,
  } = useFetchAllUsers({
    type: USER_TYPES.VENDOR,
    page,
    limit,
  });

  const { data: allLaundries } = useFetchAllLaundries();

  const showError = useCallback((errorMessage: string) => {
    toast(errorMessage, { type: 'error' });
  }, []);

  const showSuccess = useCallback((successMessage: string) => {
    toast(successMessage, { type: 'success' });
  }, []);

  useEffect(() => {
    if (error) {
      showError(
        (error?.response?.data as { message: string })?.message ||
          'Unknown error'
      );
    }
  }, [error, showError]);

  const totalPages = useMemo(
    () => Math.ceil((vendors?.count ?? 0) / limit),
    [vendors, limit]
  );

  const navigate = useNavigate();
  useEffect(() => {
    if (!pageNumber) {
      navigate(`/vendor/1`, { replace: true });
    } else {
      setPage(Number(pageNumber));
    }
  }, [pageNumber, navigate]);

  const handleImageClick = useCallback(
    (vendorId: string) => () => {
      if (vendorId) {
        fileInputRefs.current[vendorId]?.click();
        setUploadId(vendorId);
      }
    },
    []
  );

  const handleImageChange = useCallback(
    (vendorId: string) => async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && vendorId) {
        setIsUploading(true);
        try {
          await uploadAndFinalizeImage(
            file,
            uploadVendorDoc,
            finaliseVendorDoc,
            vendorId,
            false
          );
          await refetchVendor();
          showSuccess('Vendor image uploaded successfully');
        } catch (err) {
          console.error('Upload failed:', err);
          showError('Failed to upload vendor image');
        } finally {
          setIsUploading(false);
        }
      }
    },
    [uploadVendorDoc, finaliseVendorDoc, refetchVendor, showSuccess, showError]
  );

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    navigate(`/vendor/${value}`);
  };

  const handleRowClick = useCallback(
    (row: any) => {
      if (row?.id) navigate(`/user-details/${row.id}`);
    },
    [navigate]
  );

  const handleEditClick = useCallback((row: any) => {
    setSelectedUser(row);
    setEditDialogOpen(true);
  }, []);

  const handleViewClick = useCallback(
    (row: any) => {
      if (row?.id) navigate(`/user-details/${row.id}`);
    },
    [navigate]
  );

  const handleUploadImageClick = useCallback(
    (row: any) => {
      handleImageClick(row.id)();
    },
    [handleImageClick]
  );

  // Calculate laundry stats
  const totalLaundries = allLaundries?.data?.length || 0;
  const vendorsWithLaundries =
    vendors?.data?.filter((vendor: any) =>
      allLaundries?.data?.some((laundry: any) => laundry.vendorId === vendor.id)
    ).length || 0;

  // Get laundry count for a specific vendor
  const getLaundryCount = useCallback(
    (vendorId: string) => {
      return (
        allLaundries?.data?.filter((laundry: any) => laundry.vendorId === vendorId)
          .length || 0
      );
    },
    [allLaundries]
  );

  const currentStart = useMemo(() => (page - 1) * limit + 1, [page, limit]);
  const currentEnd = useMemo(
    () => Math.min(page * limit, vendors?.count || 0),
    [page, limit, vendors?.count]
  );

  // Define table columns
  const columns: DataTableColumn[] = [
    {
      id: 'vendor',
      label: 'Vendor',
      minWidth: 200,
      render: (row: any) => (
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            src={row?.profileImage?.url}
            onClick={handleImageClick(row.id)}
            sx={{ cursor: 'pointer', width: 40, height: 40 }}
          >
            {row?.firstName?.charAt(0) || row?.phone?.charAt(row.phone.length - 1)}
          </Avatar>
          <Box>
            <Typography variant="body1" fontWeight="bold">
              {row?.name || `${row?.firstName || ''} ${row?.lastName || ''}`.trim()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {row?.email || 'No email'}
            </Typography>
          </Box>
          <input
            type="file"
            accept="image/*"
            ref={(el) => {
              if (el) fileInputRefs.current[row.id] = el;
            }}
            style={{ display: 'none' }}
            onChange={handleImageChange(row.id)}
          />
        </Stack>
      ),
      hideable: false,
    },
    {
      id: 'phone',
      label: 'Phone',
      minWidth: 140,
      accessor: 'phone',
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 100,
      render: (row: any) => (
        <Chip
          label={row?.status || 'N/A'}
          color={
            row?.status === 'ACTIVE'
              ? 'success'
              : row?.status === 'INACTIVE'
              ? 'error'
              : row?.status === 'REJECTED'
              ? 'warning'
              : 'default'
          }
          size="small"
        />
      ),
    },
    {
      id: 'laundries',
      label: 'Laundries',
      minWidth: 120,
      render: (row: any) => {
        const count = getLaundryCount(row.id);
        return (
          <Stack direction="row" alignItems="center" spacing={1}>
            <LocalLaundryService fontSize="small" color="primary" />
            <Chip
              label={`${count} laundries`}
              color={count > 0 ? 'primary' : 'default'}
              size="small"
            />
          </Stack>
        );
      },
    },
    {
      id: 'createdAt',
      label: 'Created At',
      minWidth: 120,
      accessor: (row: any) =>
        row?.createdAt
          ? new Date(row.createdAt).toLocaleDateString()
          : 'N/A',
    },
  ];

  // Define table actions
  const actions: DataTableAction[] = [
    {
      label: 'View Details',
      icon: <Visibility fontSize="small" />,
      onClick: handleViewClick,
      color: 'primary',
    },
    {
      label: 'Edit Vendor',
      icon: <Edit fontSize="small" />,
      onClick: handleEditClick,
      color: 'secondary',
    },
    {
      label: 'Upload Image',
      icon: <PhotoCamera fontSize="small" />,
      onClick: handleUploadImageClick,
      color: 'default',
    },
  ];

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load vendors. Please try again later.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <ToastContainer />

      {/* Header */}
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Vendor Management
      </Typography>

      {/* Stats */}
      <Stack direction="row" spacing={2} mb={3}>
        <Chip
          icon={<Business />}
          label={`Total Vendors: ${vendors?.count || 0}`}
          color="primary"
          variant="outlined"
        />
        <Chip
          icon={<LocalLaundryService />}
          label={`Total Laundries: ${totalLaundries}`}
          color="secondary"
          variant="outlined"
        />
        <Chip
          icon={<Business />}
          label={`Vendors with Laundries: ${vendorsWithLaundries}`}
          color="success"
          variant="outlined"
        />
      </Stack>

      {/* Vendors Table */}
      <DataTable
        columns={columns}
        data={vendors?.data || []}
        actions={actions}
        onRowClick={handleRowClick}
        loading={isLoading}
        emptyMessage="No vendors available"
        rowKey="id"
        maxHeight="65vh"
      />

      {/* Pagination */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mt={2}
        py={2}
        px={2}
      >
        <Box flex="1" display="flex" justifyContent="center" ml={20}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
        {vendors && (
          <Typography variant="body2" sx={{ ml: 3 }}>
            Showing{' '}
            {vendors?.data?.length > 0
              ? `${currentStart}-${currentEnd}`
              : 0}{' '}
            of {vendors?.count || 0} items
          </Typography>
        )}
      </Box>

      {/* Edit User Dialog */}
      <EditUserDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />

      {/* Upload Loading Overlay */}
      {isUploading && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgcolor="rgba(0,0,0,0.5)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={9999}
        >
          <CircularProgress />
          <Typography ml={2} color="white">
            Uploading image...
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Vendor;
