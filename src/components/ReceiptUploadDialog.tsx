import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Receipt,
  CloudUpload,
  Image,
  Money,
  Person,
  Payment,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useUploadCustomOrderReceipt } from '../hooks/Admin/customOrdersHooks';
import {
  useUploadImage,
  useFinaliseUploadImage,
} from '../hooks/Admin/mutation';
import uploadAndFinalizeImage from '../utils/uploadAndFinalizeImage';

interface CustomOrder {
  id: string;
  customLaundryName: string;
  adminServiceCharge?: number;
  totalAmount?: number;
  customer: {
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  riderOrders: Array<{
    rider: {
      name?: string;
      firstName?: string;
      lastName?: string;
      phone: string;
      email?: string;
    };
  }>;
}

interface ReceiptUploadDialogProps {
  open: boolean;
  onClose: () => void;
  order: CustomOrder;
}

const ReceiptUploadDialog: React.FC<ReceiptUploadDialogProps> = ({
  open,
  onClose,
  order,
}) => {
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [vendorName, setVendorName] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // S3 upload hooks
  const { mutateAsync: uploadImage } = useUploadImage();
  const { mutateAsync: finaliseUpload } = useFinaliseUploadImage();
  const uploadReceiptMutation = useUploadCustomOrderReceipt();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setReceiptFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeFile = () => {
    setReceiptFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateInputs = () => {
    const newErrors: { [key: string]: string } = {};

    if (!receiptFile) {
      newErrors.receiptFile = 'Receipt image is required';
    }

    if (!vendorName.trim()) {
      newErrors.vendorName = 'Vendor name is required';
    }

    const amount = parseFloat(amountPaid);
    if (!amountPaid || amount <= 0) {
      newErrors.amountPaid = 'Valid amount paid is required';
    }

    if (!paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUploadReceipt = async () => {
    if (!validateInputs()) {
      return;
    }

    setIsUploading(true);

    try {
      // Step 1: Upload receipt image to S3 using signed URL
      const receiptMediaId = await uploadAndFinalizeImage(
        receiptFile!,
        uploadImage,
        finaliseUpload,
        'admin',
        false // private
      );

      // Step 2: Send receipt metadata + mediaId to backend
      if (receiptMediaId) {
        uploadReceiptMutation.mutate(
          {
            orderId: order.id,
            receiptImageId: receiptMediaId,
            vendorName: vendorName.trim(),
            amountPaid: parseFloat(amountPaid),
            paymentMethod,
            notes: notes.trim() || undefined,
          },
          {
            onSuccess: () => {
              setIsUploading(false);
              onClose();
            },
            onError: () => {
              setIsUploading(false);
            },
          }
        );
      }
    } catch (error) {
      console.error('Receipt upload error:', error);
      toast.error('Failed to upload receipt');
      setIsUploading(false);
    }
  };

  const assignedDriver = order.riderOrders?.[0]?.rider;
  const isButtonDisabled =
    isUploading ||
    uploadReceiptMutation.isPending ||
    !receiptFile ||
    !vendorName ||
    !amountPaid ||
    !paymentMethod;

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>
        <Box display='flex' alignItems='center' gap={1}>
          <Receipt color='primary' />
          Upload Vendor Receipt
        </Box>
      </DialogTitle>

      <DialogContent>
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
          <Typography variant='h6' gutterBottom fontWeight='bold'>
            Order Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant='body2' gutterBottom>
                <strong>Customer:</strong> {order.customer?.firstName}{' '}
                {order.customer?.lastName}
              </Typography>
              <Typography variant='body2' gutterBottom>
                <strong>Laundry:</strong> {order.customLaundryName}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              {assignedDriver && (
                <Typography variant='body2' gutterBottom>
                  <strong>Driver:</strong> {assignedDriver.firstName}{' '}
                  {assignedDriver.lastName}
                  <br />
                  <strong>Phone:</strong> {assignedDriver.phone}
                </Typography>
              )}
            </Grid>
          </Grid>
        </Paper>

        <Box mb={3}>
          <Typography variant='h6' gutterBottom fontWeight='bold'>
            Receipt Image
          </Typography>

          {!receiptFile ? (
            <Paper
              sx={{
                p: 4,
                textAlign: 'center',
                border: '2px dashed',
                borderColor: errors.receiptFile ? 'error.main' : 'grey.300',
                bgcolor: 'grey.50',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'grey.100' },
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <CloudUpload sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
              <Typography variant='h6' color='text.secondary' gutterBottom>
                Click to upload receipt image
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Supports: JPG, PNG, JPEG (Max 5MB)
              </Typography>
              {errors.receiptFile && (
                <Typography
                  variant='caption'
                  color='error'
                  display='block'
                  mt={1}
                >
                  {errors.receiptFile}
                </Typography>
              )}
            </Paper>
          ) : (
            <Paper sx={{ p: 2, border: 1, borderColor: 'success.main' }}>
              <Grid container spacing={2} alignItems='center'>
                <Grid item xs={12} md={6}>
                  {previewUrl && (
                    <Box
                      component='img'
                      src={previewUrl}
                      alt='Receipt preview'
                      sx={{
                        width: '100%',
                        maxHeight: 200,
                        objectFit: 'contain',
                        border: 1,
                        borderColor: 'grey.300',
                        borderRadius: 1,
                      }}
                    />
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box display='flex' alignItems='center' gap={1} mb={1}>
                    <Image color='success' />
                    <Typography variant='body2' fontWeight='bold'>
                      {receiptFile.name}
                    </Typography>
                  </Box>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    display='block'
                  >
                    Size: {(receiptFile.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                  <Button
                    size='small'
                    color='error'
                    onClick={removeFile}
                    sx={{ mt: 1 }}
                  >
                    Remove
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          )}

          <input
            ref={fileInputRef}
            type='file'
            accept='image/*'
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
        </Box>

        <Typography variant='h6' gutterBottom fontWeight='bold'>
          Payment Details
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label='Vendor Name'
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              error={!!errors.vendorName}
              helperText={errors.vendorName || 'Name as shown on receipt'}
              required
              InputProps={{
                startAdornment: (
                  <Person sx={{ mr: 1, color: 'action.active' }} />
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label='Amount Paid (SAR)'
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              type='number'
              inputProps={{ min: 0, step: 0.01 }}
              error={!!errors.amountPaid}
              helperText={errors.amountPaid || 'Amount driver paid to vendor'}
              required
              InputProps={{
                startAdornment: (
                  <Money sx={{ mr: 1, color: 'action.active' }} />
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.paymentMethod} required>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                startAdornment={
                  <Payment sx={{ mr: 1, color: 'action.active' }} />
                }
              >
                <MenuItem value='CASH'>Cash</MenuItem>
                <MenuItem value='CARD'>Card</MenuItem>
                <MenuItem value='BANK_TRANSFER'>Bank Transfer</MenuItem>
                <MenuItem value='MOBILE_PAYMENT'>Mobile Payment</MenuItem>
              </Select>
              {errors.paymentMethod && (
                <Typography variant='caption' color='error'>
                  {errors.paymentMethod}
                </Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label='Notes (Optional)'
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder='Any additional notes about the payment...'
            />
          </Grid>
        </Grid>

        <Alert severity='info' sx={{ mt: 3 }}>
          <Typography variant='body2' gutterBottom>
            <strong>What happens next:</strong>
          </Typography>
          <Typography variant='body2' component='ul' sx={{ mt: 1, pl: 2 }}>
            <li>Receipt will be stored and linked to this order</li>
            <li>
              <strong>
                Customer invoice will be generated for the amount paid to vendor
              </strong>
            </li>
            <li>Customer will receive payment link via SMS/Email</li>
            <li>
              Order status will update to "Ready for Delivery" after customer
              payment
            </li>
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={onClose}
          disabled={isUploading || uploadReceiptMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          onClick={handleUploadReceipt}
          variant='contained'
          disabled={isButtonDisabled}
          startIcon={
            isUploading || uploadReceiptMutation.isPending ? (
              <CircularProgress size={20} />
            ) : (
              <CloudUpload />
            )
          }
        >
          {isUploading || uploadReceiptMutation.isPending
            ? 'Uploading...'
            : 'Upload Receipt & Generate Invoice'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReceiptUploadDialog;
