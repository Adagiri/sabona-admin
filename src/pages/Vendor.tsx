// File: src/pages/Vendor.tsx

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
  Stack,
  Chip,
} from '@mui/material';
import { Business, LocalLaundryService } from '@mui/icons-material';
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
import EnhancedVendorTableRow from '../components/EnhancedVendorTableRow';

const Vendor = () => {
  const { pageNumber } = useParams<{ pageNumber: string }>();
  const [page, setPage] = useState<number>(Number(pageNumber) || 1);
  const [limit] = useState(10);

  const { mutateAsync: uploadVendorDoc } = useUploadImage();
  const { mutateAsync: finaliseVendorDoc } = useFinaliseUploadImage();
  const [uploadId, setUploadId] = useState<string | null>(null); // Fixed: Added both state and setter

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRefs = useRef<Record<string | number, HTMLInputElement>>({});
  console.log(uploadId);
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

  const showSuccess = useCallback((errorMessage: string) => {
    toast(errorMessage, { type: 'success' });
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
        } catch (err) {
          console.error('Upload failed:', err);
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

  // Calculate laundry stats
  const totalLaundries = allLaundries?.data?.length || 0;
  const vendorsWithLaundries =
    vendors?.data?.filter((vendor: any) =>
      allLaundries?.data?.some((laundry: any) => laundry.vendorId === vendor.id)
    ).length || 0;

  if (isLoading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='60vh'
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box p={3}>
        <Alert severity='error'>
          Failed to load vendors. Please try again later.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <ToastContainer />

      {/* Header */}
      <Typography variant='h4' fontWeight='bold' gutterBottom>
        Vendor Management
      </Typography>

      {/* Stats */}
      <Stack direction='row' spacing={2} mb={3}>
        <Chip
          icon={<Business />}
          label={`Total Vendors: ${vendors?.count || 0}`}
          color='primary'
          variant='outlined'
        />
        <Chip
          icon={<LocalLaundryService />}
          label={`Total Laundries: ${totalLaundries}`}
          color='secondary'
          variant='outlined'
        />
        <Chip
          icon={<Business />}
          label={`Vendors with Laundries: ${vendorsWithLaundries}`}
          color='success'
          variant='outlined'
        />
      </Stack>

      {/* Vendors Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell width={50}></TableCell>
              <TableCell>
                <strong>Vendor Details</strong>
              </TableCell>
              <TableCell>
                <strong>Phone</strong>
              </TableCell>
              <TableCell>
                <strong>Status</strong>
              </TableCell>
              <TableCell>
                <strong>Laundries</strong>
              </TableCell>
              <TableCell>
                <strong>Created</strong>
              </TableCell>
              <TableCell>
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vendors?.data?.length && vendors.data.length > 0 ? (
              vendors.data.map((vendor: any) => (
                <EnhancedVendorTableRow
                  key={vendor.id}
                  vendor={vendor}
                  handleImageClick={handleImageClick}
                  handleImageChange={handleImageChange}
                  fileInputRefs={fileInputRefs}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align='center'>
                  <Typography variant='body1' color='text.secondary' py={4}>
                    No vendors found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display='flex' justifyContent='center' mt={3}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color='primary'
          />
        </Box>
      )}

      {isUploading && (
        <Box
          position='fixed'
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgcolor='rgba(0,0,0,0.5)'
          display='flex'
          alignItems='center'
          justifyContent='center'
          zIndex={9999}
        >
          <CircularProgress />
          <Typography ml={2} color='white'>
            Uploading image...
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Vendor;
