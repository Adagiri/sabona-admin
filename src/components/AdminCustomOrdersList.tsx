import  { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import {  User, Phone, Clock } from 'lucide-react';

interface CustomOrder {
  id: string;
  orderNumber: number;
  status: string;
  customLaundryName: string;
  customLaundryDescription: string;
  totalAmount: number;
  adminServiceCharge?: number;
  user: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  pickup: {
    pickupAddress: string;
    pickupDate: string;
    pickupTime: string;
  };
  createdAt: string;
}

export default function AdminCustomOrdersList() {
  const [customOrders, setCustomOrders] = useState<CustomOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<CustomOrder | null>(null);
  const [pricingDialogOpen, setPricingDialogOpen] = useState(false);
  const [adminServiceCharge, setAdminServiceCharge] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [isUpdatingPricing, setIsUpdatingPricing] = useState(false);

  useEffect(() => {
    fetchCustomOrders();
  }, []);

  const fetchCustomOrders = async () => {
    try {
      const response = await fetch('/admin/custom-orders', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`, // Replace with your auth method
        },
      });
      if (response.ok) {
        const result = await response.json();
        setCustomOrders(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch custom orders:', error);
    }
  };

  const handleUpdatePricing = async () => {
    if (!selectedOrder) return;

    setIsUpdatingPricing(true);
    try {
      const response = await fetch(
        `/admin/custom-order/${selectedOrder.id}/pricing`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
          body: JSON.stringify({
            adminServiceCharge: parseFloat(adminServiceCharge),
            totalAmount: parseFloat(totalAmount),
          }),
        }
      );

      if (response.ok) {
        await fetchCustomOrders(); // Refresh list
        setPricingDialogOpen(false);
        setSelectedOrder(null);
        alert('Pricing updated successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to update pricing:', error);
      alert('Failed to update pricing');
    } finally {
      setIsUpdatingPricing(false);
    }
  };

  const openPricingDialog = (order: CustomOrder) => {
    setSelectedOrder(order);
    setAdminServiceCharge(order.adminServiceCharge?.toString() || '');
    setTotalAmount(order.totalAmount?.toString() || '');
    setPricingDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'ACCEPTED':
        return 'info';
      case 'IN_PROGRESS':
        return 'primary';
      case 'COMPLETED':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant='h4' gutterBottom>
        Custom Orders Management
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order #</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Laundry</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>#{order.orderNumber}</TableCell>
                <TableCell>
                  <Box>
                    <Typography
                      variant='body2'
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      <User size={14} />
                      {order.user.firstName} {order.user.lastName}
                    </Typography>
                    <Typography
                      variant='caption'
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      <Phone size={12} />
                      {order.user.phone}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant='body2' fontWeight='bold'>
                    {order.customLaundryName}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {order.customLaundryDescription.substring(0, 50)}...
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={order.status}
                    color={getStatusColor(order.status)}
                    size='small'
                  />
                </TableCell>
                <TableCell>
                  {order.totalAmount} SAR
                  {order.adminServiceCharge && (
                    <Typography variant='caption' display='block'>
                      Service: {order.adminServiceCharge} SAR
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography
                    variant='caption'
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                  >
                    <Clock size={12} />
                    {new Date(order.createdAt).toLocaleDateString()}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {order.pickup.pickupDate} at {order.pickup.pickupTime}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Button
                    size='small'
                    variant='outlined'
                    onClick={() => openPricingDialog(order)}
                    disabled={order.status !== 'PENDING'}
                  >
                    Set Pricing
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pricing Dialog */}
      <Dialog
        open={pricingDialogOpen}
        onClose={() => setPricingDialogOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Update Custom Order Pricing</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ pt: 1 }}>
              <Alert severity='info' sx={{ mb: 2 }}>
                <Typography variant='subtitle2'>Order Details:</Typography>
                <Typography variant='body2'>
                  Customer: {selectedOrder.user.firstName}{' '}
                  {selectedOrder.user.lastName}
                  <br />
                  Laundry: {selectedOrder.customLaundryName}
                  <br />
                  Description:{' '}
                  {selectedOrder.customLaundryDescription.substring(0, 100)}...
                </Typography>
              </Alert>

              <TextField
                label='Admin Service Charge (SAR)'
                type='number'
                fullWidth
                margin='normal'
                value={adminServiceCharge}
                onChange={(e) => setAdminServiceCharge(e.target.value)}
                helperText='Your service charge for handling this custom order'
              />

              <TextField
                label='Total Amount Customer Pays (SAR)'
                type='number'
                fullWidth
                margin='normal'
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                helperText='Total amount customer will pay (including delivery and your service charge)'
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPricingDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUpdatePricing}
            variant='contained'
            disabled={isUpdatingPricing || !adminServiceCharge || !totalAmount}
          >
            {isUpdatingPricing ? (
              <CircularProgress size={20} />
            ) : (
              'Update Pricing'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
