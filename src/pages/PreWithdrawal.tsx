import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Backdrop,
} from '@mui/material';
import {
  Add as AddIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import {
  useFetchPreWithdrawals,
  useFetchWithdrawalById,
  useInitiateWithdrawal,
  useUploadLaundryInvoice,
  useCompleteWithdrawal,
  useDownloadLaundryReport,
  useCancelWithdrawal,
} from '../hooks/Admin/withdrawalHooks';
import {
  useUploadImage,
  useFinaliseUploadImage,
} from '../hooks/Admin/mutation';
import uploadAndFinalizeImage from '../utils/uploadAndFinalizeImage';

interface WithdrawalLaundry {
  id: string;
  laundryName: string;
  branchType: string;
  totalOrders: number;
  totalEarnings: number;
  hasInvoice: boolean;
  invoiceUrl?: string;
  invoiceUploadedAt?: string;
}

interface PreWithdrawal {
  id: string;
  withdrawalNumber: number;
  startDate: string;
  endDate: string;
  laundryCount: number;
  totalAmount: number;
  uploadedInvoices: number;
  laundries?: WithdrawalLaundry[];
}

export default function PreWithdrawal() {
  const [selectedWithdrawalId, setSelectedWithdrawalId] = useState<
    string | null
  >(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedLaundry, setSelectedLaundry] =
    useState<WithdrawalLaundry | null>(null);
  const [uploading, setUploading] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [viewingDetails, setViewingDetails] = useState(false);

  // Queries
  const {
    data: preWithdrawals,
    isLoading,
    error,
    refetch: refetchPreWithdrawals,
    isFetching: isFetchingPreWithdrawals,
  } = useFetchPreWithdrawals();

  const {
    data: selectedWithdrawal,
    isLoading: isLoadingDetails,
    refetch: refetchDetails,
  } = useFetchWithdrawalById(selectedWithdrawalId ?? '', {
    enabled: !!selectedWithdrawalId,
  });

  // Mutations
  const initiateMutation = useInitiateWithdrawal();
  const uploadInvoiceMutation = useUploadLaundryInvoice();
  const completeMutation = useCompleteWithdrawal();
  const downloadReportMutation = useDownloadLaundryReport();
  const cancelMutation = useCancelWithdrawal();
  const uploadImageMutation = useUploadImage();
  const finalizeImageMutation = useFinaliseUploadImage();

  const hasPendingWithdrawal = preWithdrawals && preWithdrawals.length > 0;

  const handleInitiateWithdrawal = () => {
    initiateMutation.mutate(undefined, {
      onSuccess: () => {
        refetchPreWithdrawals();
      },
    });
  };

  const handleViewDetails = (withdrawalId: string) => {
    setViewingDetails(true);
    setSelectedWithdrawalId(withdrawalId);
  };

  const handleBackToList = () => {
    setSelectedWithdrawalId(null);
    setViewingDetails(false);
  };

  const handleDownloadReport = (laundryId: string, laundryName: string) => {
    if (!selectedWithdrawalId) return;
    downloadReportMutation.mutate({
      withdrawalId: selectedWithdrawalId,
      laundryId,
      laundryName,
    });
  };

  const handleOpenUploadDialog = (laundry: WithdrawalLaundry) => {
    console.log(laundry);
    setSelectedLaundry(laundry);
    setUploadDialogOpen(true);
  };

  const handleFileUpload = async (file: File) => {
    if (!selectedLaundry) return;

    setUploading(true);
    try {
      const mediaId = await uploadAndFinalizeImage(
        file,
        uploadImageMutation.mutateAsync,
        finalizeImageMutation.mutateAsync,
        'admin',
        false
      );

      if (mediaId !== null) {
        await uploadInvoiceMutation.mutateAsync({
          withdrawalLaundryId: selectedLaundry.id,
          invoiceMediaId: mediaId,
        });
      }
      setUploadDialogOpen(false);
      refetchDetails();
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleCompleteWithdrawal = (withdrawalId: string) => {
    completeMutation.mutate(withdrawalId, {
      onSuccess: () => {
        setSelectedWithdrawalId(null);
        setViewingDetails(false);
        refetchPreWithdrawals();
      },
    });
  };

  const handleCancelWithdrawal = () => {
    if (!selectedWithdrawal) return;

    cancelMutation.mutate(selectedWithdrawal.id, {
      onSuccess: () => {
        setSelectedWithdrawalId(null);
        setViewingDetails(false);
        setCancelDialogOpen(false);
        refetchPreWithdrawals();
      },
    });
  };

  if (isLoading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='400px'
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity='error'>Failed to load pre-withdrawals</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Loading backdrop for refetching */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={
          isFetchingPreWithdrawals ||
          cancelMutation.isPending ||
          completeMutation.isPending ||
          (viewingDetails && isLoadingDetails)
        }
      >
        <CircularProgress color='inherit' />
      </Backdrop>

      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        mb={3}
      >
        <Typography variant='h4'>Pre-Withdrawal</Typography>
        <Box>
          <Button
            variant='contained'
            startIcon={
              initiateMutation.isPending ? (
                <CircularProgress size={20} />
              ) : (
                <AddIcon />
              )
            }
            onClick={handleInitiateWithdrawal}
            disabled={initiateMutation.isPending || hasPendingWithdrawal}
          >
            Initiate Withdrawal
          </Button>
        </Box>
      </Box>

      {hasPendingWithdrawal && (
        <Alert severity='warning' sx={{ mb: 2 }}>
          There is a pending withdrawal. Complete or cancel it before initiating
          a new one.
        </Alert>
      )}

      {!selectedWithdrawal ? (
        <Card>
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Withdrawal #</TableCell>
                    <TableCell>Date Range</TableCell>
                    <TableCell>Laundries</TableCell>
                    <TableCell>Total Amount</TableCell>
                    <TableCell>Invoices</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {preWithdrawals?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align='center'>
                        <Typography color='text.secondary'>
                          No pending withdrawals. Click "Initiate Withdrawal" to
                          start.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    preWithdrawals?.map((withdrawal: PreWithdrawal) => (
                      <TableRow key={withdrawal.id} hover>
                        <TableCell>{withdrawal.withdrawalNumber}</TableCell>
                        <TableCell>
                          {new Date(withdrawal.startDate).toLocaleDateString()}{' '}
                          – {new Date(withdrawal.endDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{withdrawal.laundryCount}</TableCell>
                        <TableCell>
                          SAR {withdrawal.totalAmount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${withdrawal.uploadedInvoices}/${withdrawal.laundryCount}`}
                            color={
                              withdrawal.uploadedInvoices ===
                              withdrawal.laundryCount
                                ? 'success'
                                : 'warning'
                            }
                            size='small'
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size='small'
                            variant='outlined'
                            onClick={() => handleViewDetails(withdrawal.id)}
                            disabled={viewingDetails && isLoadingDetails}
                            startIcon={
                              viewingDetails && isLoadingDetails ? (
                                <CircularProgress size={16} />
                              ) : undefined
                            }
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            {isLoadingDetails ? (
              <Box display='flex' justifyContent='center' p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Box
                  display='flex'
                  justifyContent='space-between'
                  alignItems='center'
                  mb={3}
                >
                  <Typography variant='h5'>
                    Withdrawal #{selectedWithdrawal.withdrawalNumber}
                  </Typography>
                  <Box>
                    <Button
                      variant='outlined'
                      onClick={handleBackToList}
                      sx={{ mr: 2 }}
                    >
                      Back to List
                    </Button>
                    <Button
                      variant='outlined'
                      color='error'
                      startIcon={<CancelIcon />}
                      onClick={() => setCancelDialogOpen(true)}
                      sx={{ mr: 2 }}
                      disabled={cancelMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant='contained'
                      color='success'
                      startIcon={
                        completeMutation.isPending ? (
                          <CircularProgress size={20} color='inherit' />
                        ) : (
                          <CheckCircleIcon />
                        )
                      }
                      onClick={() =>
                        handleCompleteWithdrawal(selectedWithdrawal.id)
                      }
                      disabled={
                        selectedWithdrawal.uploadedInvoices !==
                          selectedWithdrawal.laundryCount ||
                        completeMutation.isPending
                      }
                    >
                      Complete
                    </Button>
                  </Box>
                </Box>

                <Alert severity='info' icon={<InfoIcon />} sx={{ mb: 3 }}>
                  Date Range:{' '}
                  {new Date(selectedWithdrawal.startDate).toLocaleString()} to{' '}
                  {new Date(selectedWithdrawal.endDate).toLocaleString()}
                </Alert>

                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Laundry Name</TableCell>
                        <TableCell>Branch Type</TableCell>
                        <TableCell>Orders</TableCell>
                        <TableCell>Earnings</TableCell>
                        <TableCell>Invoice</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedWithdrawal.laundries?.map((laundry) => (
                        <TableRow key={laundry.id}>
                          <TableCell>{laundry.laundryName}</TableCell>
                          <TableCell>
                            <Chip
                              label={laundry.branchType}
                              size='small'
                              color={
                                laundry.branchType === 'Main'
                                  ? 'primary'
                                  : 'default'
                              }
                            />
                          </TableCell>
                          <TableCell>{laundry.totalOrders}</TableCell>
                          <TableCell>
                            SAR {laundry.totalEarnings.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {laundry.hasInvoice ? (
                              <Chip
                                label='Uploaded'
                                color='success'
                                size='small'
                                icon={<CheckCircleIcon />}
                              />
                            ) : (
                              <Chip
                                label='Pending'
                                color='warning'
                                size='small'
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <IconButton
                              color='primary'
                              onClick={() =>
                                handleDownloadReport(
                                  laundry.id,
                                  laundry.laundryName
                                )
                              }
                              title='Download Earning Report'
                              disabled={downloadReportMutation.isPending}
                            >
                              <DownloadIcon />
                            </IconButton>
                            {!laundry.hasInvoice && (
                              <IconButton
                                color='secondary'
                                onClick={() => handleOpenUploadDialog(laundry)}
                                title='Upload Invoice'
                              >
                                <UploadIcon />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upload Invoice Dialog */}
      <Dialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>
          Upload Invoice for {selectedLaundry?.laundryName}
        </DialogTitle>
        <DialogContent>
          <input
            type='file'
            accept='.pdf,.jpg,.jpeg,.png'
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
            style={{ marginTop: '16px' }}
          />
          {uploading && (
            <Box display='flex' justifyContent='center' mt={2}>
              <CircularProgress size={24} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setUploadDialogOpen(false)}
            disabled={uploading}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Withdrawal Confirmation Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => !cancelMutation.isPending && setCancelDialogOpen(false)}
        maxWidth='xs'
        fullWidth
      >
        <DialogTitle>Cancel Withdrawal</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel this withdrawal? This action cannot
            be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setCancelDialogOpen(false)}
            disabled={cancelMutation.isPending}
          >
            No, Keep It
          </Button>
          <Button
            onClick={handleCancelWithdrawal}
            color='error'
            variant='contained'
            disabled={cancelMutation.isPending}
            startIcon={
              cancelMutation.isPending ? (
                <CircularProgress size={20} color='inherit' />
              ) : (
                <CancelIcon />
              )
            }
          >
            {cancelMutation.isPending
              ? 'Cancelling...'
              : 'Yes, Cancel Withdrawal'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
