import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, Pagination, CircularProgress, Alert } from "@mui/material";
import { useFetchAllUsers } from "../hooks/Admin/query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { USER_TYPES } from "../hooks/Admin/interface";
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate, useParams } from "react-router-dom";
import ImageUpload from "../components/upload/ImageUpload";
import { useFinaliseUploadImage, useUploadImage } from "../hooks/Admin/mutation";
import uploadAndFinalizeImage from "../utils/uploadAndFinalizeImage";

const Driver = () => {
    const { pageNumber } = useParams<{ pageNumber: string }>();
    const [page, setPage] = useState<number>(Number(pageNumber) || 1);
    const [limit] = useState(10);
    const fileInputRefs = useRef<Record<string | number, HTMLInputElement>>({});
    const [uploadId, setUploadId] = useState<string | null>(null);

    const { mutateAsync: uploadVendorDoc } = useUploadImage();
    const { mutateAsync: finaliseVendorDoc } = useFinaliseUploadImage();
    const [isUploading, setIsUploading] = useState<boolean>(false);

    const { data: drivers, isLoading, error: errorFetchingUsers, isError , refetch : refetchDrivers } = useFetchAllUsers({
        type: USER_TYPES.RIDER,
        page,
        limit,
    });
    const totalPages = useMemo(() => Math.ceil((drivers?.count ?? 0) / limit), [drivers, limit]);

    const navigate = useNavigate();

    const handleImageClick = useCallback((vendorId: string) => () => {
        if (vendorId) {
            fileInputRefs.current[vendorId]?.click();
            setUploadId(vendorId);
        }
    }, []);

    const handleImageChange = useCallback(
        (vendorId: string) => async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            let media = null;
            const isPublic = false
            if (file) {
                setIsUploading(true);
                try {
                    const mediaId = await uploadAndFinalizeImage(
                        file,
                        uploadVendorDoc,
                        finaliseVendorDoc,
                        vendorId,
                        isPublic
                    );
                    media = mediaId;
                    if(media) {
                        showSuccess('Document uploaded successfully');
                    }

                }
                catch (error: any) {
                    showError(error.message);
                }
                finally {
                    setIsUploading(false);
                    refetchDrivers();
                }
            }
        },
        [finaliseVendorDoc, uploadVendorDoc]
    );

    const showError = useCallback((errorMessage: string) => {
        toast(errorMessage, { type: "error" });
    }, []);

    const showSuccess = useCallback((errorMessage: string) => {
        toast(errorMessage, { type: "success" });
    }, []);

    useEffect(() => {
        if (errorFetchingUsers) {
            showError((errorFetchingUsers?.response?.data as { message: string })?.message || 'Unknown error');
        }
    }, [errorFetchingUsers, showError])

    useEffect(() => {
        if (!pageNumber) {
            navigate(`/driver/1`, { replace: true });
        } else {
            setPage(Number(pageNumber));
        }
    }, [pageNumber, navigate]);

    const handlePageChange = useCallback(
        (_: any, value: number) => {
            setPage(value);
            navigate(`/driver/${value}`);
        },
        [navigate]
    );


    const currentStart = useMemo(() => (page - 1) * limit + 1, [page, limit]);
    const currentEnd = useMemo(() => Math.min(page * limit, drivers?.count || 0), [page, limit, drivers?.count]);
    return (
        <Box pr={5}>
            <ToastContainer />
            <Typography variant="h4" gutterBottom mb={5}>
                Driver
            </Typography>
            <Paper>
                {isLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                        <CircularProgress />
                    </Box>
                ) : isError ? (

                    <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                        <Alert severity="error">Failed to load drivers. Please try again later.</Alert>
                    </Box>
                ) : (<Table>
                    <TableHead>
                        <TableRow
                            hover selected
                        >
                            {["First Name", "Last Name", "Type", "Phone", "Email", "Status", "Created At", "Document"].map((col) => (
                                <TableCell style={{ fontWeight: 'bold' }} key={col}>{col}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {drivers?.data && drivers?.data.length > 0 ? (
                            drivers.data.map((row, index) => (
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
                                            selectedImage={!!row?.medias.length}
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
                                <TableCell colSpan={7} align="center">
                                    No drivers
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>)}
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} py={2} px={2}>
                    <Box flex="1" display="flex" justifyContent="center" marginLeft={20}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={handlePageChange}
                            color="primary"
                        />
                    </Box>
                    {drivers && (
                        <Typography variant="body2" sx={{ ml: 3 }}>
                            Showing {drivers?.data?.length > 0 ? `${currentStart}-${currentEnd}` : 0} of {drivers?.count || 0} items
                        </Typography>
                    )}
                </Box>
            </Paper>
        </Box>
    )
}

export default Driver