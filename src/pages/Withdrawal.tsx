import { useState } from 'react';
import {
  Box,
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
  Button,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import {
  useFetchCompletedWithdrawals,
  useFetchWithdrawalById,
  useDownloadLaundryReport,
} from '../hooks/Admin/withdrawalHooks';

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

interface Withdrawal {
  id: string;
  withdrawalNumber: number;
  startDate: string;
  endDate: string;
  completedAt?: string;
  laundryCount: number;
  totalAmount: number;
  uploadedInvoices: number;
  laundries?: WithdrawalLaundry[];
}

export default function Withdrawals() {
  const [selectedWithdrawalId, setSelectedWithdrawalId] = useState<
    string | null
  >(null);

  // Queries
  const {
    data: withdrawals,
    isLoading,
    error,
  } = useFetchCompletedWithdrawals();
  const { data: selectedWithdrawal, isLoading: detailsLoading } =
    useFetchWithdrawalById(selectedWithdrawalId || '');

  // Mutations
  const downloadReportMutation = useDownloadLaundryReport();

  const handleViewDetails = (withdrawalId: string) => {
    setSelectedWithdrawalId(withdrawalId);
  };

  const handleDownloadReport = (laundryId: string, laundryName: string) => {
    if (!selectedWithdrawalId) return;

    downloadReportMutation.mutate({
      withdrawalId: selectedWithdrawalId,
      laundryId,
      laundryName,
    });
  };

  const handleViewInvoice = (invoiceUrl: string) => {
    window.open(invoiceUrl, '_blank');
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
        <Alert severity='error'>Failed to load completed withdrawals</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h4' mb={3}>
        Withdrawals
      </Typography>

      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Withdrawal #</TableCell>
                  <TableCell>Date Range</TableCell>
                  <TableCell>Completed At</TableCell>
                  <TableCell>Laundries</TableCell>
                  <TableCell>Total Amount</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {withdrawals?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align='center'>
                      <Typography color='text.secondary'>
                        No completed withdrawals yet.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  withdrawals?.map((withdrawal: Withdrawal) => (
                    <TableRow key={withdrawal.id} hover>
                      <TableCell>
                        <Chip
                          label={`#${withdrawal.withdrawalNumber}`}
                          color='success'
                          size='small'
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(withdrawal.startDate).toLocaleDateString()} -{' '}
                        {new Date(withdrawal.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {withdrawal.completedAt
                          ? new Date(withdrawal.completedAt).toLocaleString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell>{withdrawal.laundryCount}</TableCell>
                      <TableCell>
                        <Typography fontWeight='bold'>
                          SAR {withdrawal.totalAmount.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          color='primary'
                          onClick={() => handleViewDetails(withdrawal.id)}
                          title='View Details'
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog
        open={!!selectedWithdrawalId}
        onClose={() => setSelectedWithdrawalId(null)}
        maxWidth='lg'
        fullWidth
      >
        <DialogTitle>
          <Box
            display='flex'
            justifyContent='space-between'
            alignItems='center'
          >
            <Typography variant='h5'>
              Withdrawal #{selectedWithdrawal?.withdrawalNumber}
            </Typography>
            <IconButton onClick={() => setSelectedWithdrawalId(null)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {detailsLoading ? (
            <Box display='flex' justifyContent='center' p={3}>
              <CircularProgress />
            </Box>
          ) : selectedWithdrawal ? (
            <>
              <Grid container spacing={2} mb={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant='subtitle2' color='text.secondary'>
                      Date Range
                    </Typography>
                    <Typography variant='body1'>
                      {new Date(selectedWithdrawal.startDate).toLocaleString()}
                      <br />
                      to
                      <br />
                      {new Date(selectedWithdrawal.endDate).toLocaleString()}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant='subtitle2' color='text.secondary'>
                      Completed At
                    </Typography>
                    <Typography variant='body1'>
                      {selectedWithdrawal.completedAt
                        ? new Date(
                            selectedWithdrawal.completedAt
                          ).toLocaleString()
                        : 'N/A'}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: 'success.light' }}>
                    <Typography variant='subtitle2' color='text.secondary'>
                      Total Laundries
                    </Typography>
                    <Typography variant='h4'>
                      {selectedWithdrawal.laundryCount}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: 'primary.light' }}>
                    <Typography variant='subtitle2' color='text.secondary'>
                      Total Amount
                    </Typography>
                    <Typography variant='h4'>
                      SAR {selectedWithdrawal.totalAmount.toFixed(2)}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

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
                          <Typography fontWeight='bold'>
                            SAR {laundry.totalEarnings.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label='Uploaded'
                            color='success'
                            size='small'
                            icon={<CheckCircleIcon />}
                          />
                          {laundry.invoiceUploadedAt && (
                            <Typography
                              variant='caption'
                              display='block'
                              color='text.secondary'
                            >
                              {new Date(
                                laundry.invoiceUploadedAt
                              ).toLocaleString()}
                            </Typography>
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
                            size='small'
                            disabled={downloadReportMutation.isPending}
                          >
                            <DownloadIcon />
                          </IconButton>
                          {laundry.invoiceUrl && (
                            <Button
                              size='small'
                              variant='outlined'
                              onClick={() =>
                                handleViewInvoice(laundry.invoiceUrl!)
                              }
                              sx={{ ml: 1 }}
                            >
                              View Invoice
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedWithdrawalId(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
