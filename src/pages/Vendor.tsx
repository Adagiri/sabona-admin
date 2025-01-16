import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, Pagination, CircularProgress, Alert } from "@mui/material";
import { useFetchAllUsers } from "../hooks/Admin/query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { USER_TYPES } from "../hooks/Admin/interface";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import ImageUpload from "../components/upload/ImageUpload";
import { useFinaliseUploadImage, useUploadImage } from "../hooks/Admin/mutation";
import uploadAndFinalizeImage from "../utils/uploadAndFinalizeImage";

const Vendor = () => {
  const { pageNumber } = useParams<{ pageNumber: string }>();
  const [page, setPage] = useState<number>(Number(pageNumber) || 1);
  const [limit] = useState(10);

  const { mutateAsync: uploadVendorDoc, isPending: isUploadPending } = useUploadImage();
  const { mutateAsync: finaliseVendorDoc, isPending: isFinalisePending } = useFinaliseUploadImage();
  const [uploadId, setUploadId] = useState<string | null>(null);

  const isUploading = isUploadPending || isFinalisePending;
  const fileInputRefs = useRef<Record<string | number, HTMLInputElement>>({});
  const { data: vendors, isLoading, error, isError } = useFetchAllUsers({
    type: USER_TYPES.VENDOR,
    page,
    limit,
  });

  const showError = useCallback((errorMessage: string) => {
    toast(errorMessage, { type: "error" });
  }, []);

  useEffect(() => {
    if (error) {
      showError((error?.response?.data as { message: string })?.message || 'Unknown error');
    }
  }, [error, showError]);


  const totalPages = useMemo(() => Math.ceil((vendors?.count ?? 0) / limit), [vendors, limit]);

  const navigate = useNavigate();
  useEffect(() => {
    if (!pageNumber) {
      navigate(`/vendor/1`, { replace: true });
    } else {
      setPage(Number(pageNumber));
    }
  }, [pageNumber, navigate]);

  const handleImageClick = useCallback((vendorId: string) => () => {
    if (vendorId) {
      fileInputRefs.current[vendorId]?.click();
      setUploadId(vendorId);
    }
  }, []);

  const handleImageChange = useCallback(
    (vendorId: string) => async (e: React.ChangeEvent<HTMLInputElement>) => {
      console.log("ASDASDASD", vendorId);
      const file = e.target.files?.[0];
      let media = null;
      if (file) {
        const mediaId = await uploadAndFinalizeImage(
          file,
          uploadVendorDoc,
          finaliseVendorDoc,
          vendorId
        );
        media = mediaId;
        console.log("MEDIA", media);
      }
    },
    [finaliseVendorDoc, uploadVendorDoc]
  );

  const handlePageChange = useCallback(
    (_: any, value: number) => {
      setPage(value);
      navigate(`/vendor/${value}`);
    },
    [navigate]
  );
  const currentStart = useMemo(() => (page - 1) * limit + 1, [page, limit]);
  const currentEnd = useMemo(() => Math.min(page * limit, vendors?.count || 0), [page, limit, vendors?.count]);
  return (
    <Box pr={5}>
      <ToastContainer />
      <Typography variant="h4" gutterBottom mb={5}>
        Vendor
      </Typography>
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="200px">
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="200px">
          <Alert severity="error">Failed to load vendors. Please try again later.</Alert>
        </Box>
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow hover selected>
                {["First Name", "Last Name", "Type", "Phone", "Email", "Status", "Created At", "Document"].map((col) => (
                  <TableCell style={{ fontWeight: 'bold' }} key={col}>{col}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {vendors?.data && vendors?.data?.length > 0 ? (
                vendors.data.map((row, index) => (
                  <TableRow key={index} onClick={() => navigate(`/user-details/${row?.id}`)} sx={{ cursor: 'pointer' }}>
                    <TableCell>{row.firstName ?? 'N/A'}</TableCell>
                    <TableCell>{row.lastName ?? 'N/A'}</TableCell>
                    <TableCell>{row.type}</TableCell>
                    <TableCell>{row.phone}</TableCell>
                    <TableCell>{row.email ?? 'N/A'}</TableCell>
                    <TableCell style={row.status === 'INACTIVE' ? { color: 'red' } : { color: 'green' }}>
                      {row.status}
                    </TableCell>
                    <TableCell>{row.createdAt}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <ImageUpload
                        isLoading={isUploading && row.id === uploadId ? true : false}
                        variant="base"
                        selectedImage={row?.medias.length > 0 ? true : false}
                        handleImageClick={handleImageClick(row.id)}
                        fileInputRef={(el: HTMLInputElement | null) => {
                          if (el) {
                            fileInputRefs.current[row.id] = el;
                          }
                        }}
                        handleImageChange={handleImageChange(row.id)}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">No vendors available</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} py={2} px={2}>
            <Box flex="1" display="flex" justifyContent="center" marginLeft={20}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
            {vendors && (
              <Typography variant="body2" sx={{ ml: 3 }}>
                Showing {vendors?.data?.length > 0 ? `${currentStart}-${currentEnd}` : 0} of {vendors?.count || 0} items
              </Typography>
            )}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default Vendor;