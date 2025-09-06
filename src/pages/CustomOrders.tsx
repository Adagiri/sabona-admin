// File: src/pages/CustomOrders.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Button,
  IconButton,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Grid,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Search,
  LocationOn,
  Assignment,
  Receipt,
  Info,
  Money,
  Refresh,
  BusAlert,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import CustomOrdersStats from '../components/CustomOrdersStats';
import CustomOrderDetailsDialog from '../components/CustomOrderDetailsDialog';
import PricingDialog from '../components/PricingDialog';
import DriverAssignmentDialog from '../components/DriverAssignmentDialog';
import ReceiptUploadDialog from '../components/ReceiptUploadDialog';

interface CustomOrder {
  id: string;
  customLaundryName: string;
  customLaundryDescription: string;
  customLaundryLat: number;
  customLaundryLong: number;
  customLaundryAddress?: string;
  status: string;
  adminServiceCharge?: number;
  totalAmount?: number;
  customerPaid: boolean;
  payTabsInvoiceUrl?: string;
  customVendorPaid?: number;
  customVendorName?: string;
  createdAt: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  pickup: {
    pickupDate: string;
    pickupTime: string;
    pickupAddress: string;
  };
  delivery: {
    deliveryAddress: string;
    deliveryType: string;
  };
  riderOrders: Array<{
    id: string;
    type: string;
    status: string;
    rider: {
      firstName?: string;
      lastName?: string;
      phone: string;
      email?: string;
    };
    createdAt: string;
  }>;
}

const CustomOrders: React.FC = () => {
//   const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [customOrders, setCustomOrders] = useState<CustomOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<CustomOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<CustomOrder | null>(
    null
  );

  // Dialog states
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [pricingDialogOpen, setPricingDialogOpen] = useState(false);
  const [driverDialogOpen, setDriverDialogOpen] = useState(false);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);

  const tabs = [
    { label: 'All Orders', value: 'all' },
    { label: 'Pending Pricing', value: 'PENDING' },
    { label: 'Awaiting Driver', value: 'awaiting_driver' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Awaiting Payment', value: 'awaiting_payment' },
    { label: 'Completed', value: 'COMPLETED' },
  ];

  useEffect(() => {
    fetchCustomOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [customOrders, tabValue, searchTerm]);

  const fetchCustomOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/custom-orders');
      const data = await response.json();
      setCustomOrders(data.data || []);
    } catch (error) {
      console.error('Failed to fetch custom orders:', error);
      toast.error('Failed to load custom orders');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = customOrders;

    // Filter by tab
    const currentTab = tabs[tabValue];
    if (currentTab.value !== 'all') {
      if (currentTab.value === 'awaiting_receipt') {
        // Orders where driver is assigned but no receipt uploaded yet
        filtered = filtered.filter(
          (order) =>
            order.status === 'IN_PROGRESS' &&
            order.riderOrders.some((ro) => ro.type === 'RIDER_PICKUP') &&
            !order.customVendorPaid
        );
      } else if (currentTab.value === 'awaiting_pricing') {
        // Orders where receipt is uploaded but pricing not set
        filtered = filtered.filter(
          (order) => order.customVendorPaid && !order.adminServiceCharge
        );
      } else if (currentTab.value === 'awaiting_payment') {
        // Orders where pricing is set but customer hasn't paid
        filtered = filtered.filter(
          (order) =>
            order.adminServiceCharge &&
            !order.customerPaid &&
            order.payTabsInvoiceUrl
        );
      } else {
        // Standard status filtering
        filtered = filtered.filter(
          (order) => order.status === currentTab.value
        );
      }
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.customLaundryName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          `${order.customer.firstName} ${order.customer.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.customer.email
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'ACCEPTED':
        return 'info';
      case 'IN_PROGRESS':
        return 'primary';
      case 'READY_FOR_PICKUP':
        return 'secondary';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getNextAction = (order: CustomOrder) => {
    if (order.status === 'PENDING' && !order.adminServiceCharge) {
      return {
        action: 'pricing',
        label: 'Set Pricing',
        color: 'warning',
        icon: <Money />,
      };
    }
    if (
      order.status === 'ACCEPTED' &&
      !order.riderOrders.some((ro) => ro.type === 'RIDER_PICKUP')
    ) {
      return {
        action: 'driver',
        label: 'Assign Driver',
        color: 'info',
        icon: <Assignment />,
      };
    }
    if (order.status === 'IN_PROGRESS' && !order.customVendorPaid) {
      return {
        action: 'receipt',
        label: 'Upload Receipt',
        color: 'primary',
        icon: <Receipt />,
      };
    }
    if (order.status === 'READY_FOR_PICKUP' && !order.customerPaid) {
      return {
        action: 'payment',
        label: 'Send Invoice',
        color: 'secondary',
        icon: <BusAlert />,
      };
    }
    return null;
  };

  const handleAction = (order: CustomOrder, action: string) => {
    setSelectedOrder(order);
    switch (action) {
      case 'pricing':
        setPricingDialogOpen(true);
        break;
      case 'driver':
        setDriverDialogOpen(true);
        break;
      case 'receipt':
        setReceiptDialogOpen(true);
        break;
      case 'payment':
        // Handle sending PayTabs invoice
        handleSendInvoice(order);
        break;
    }
  };

  const handleSendInvoice = async (order: CustomOrder) => {
    try {
      const response = await fetch(
        `/api/admin/custom-order/${order.id}/send-invoice`,
        {
          method: 'POST',
        }
      );
      if (response.ok) {
        toast.success('Invoice sent to customer');
        fetchCustomOrders();
      } else {
        toast.error('Failed to send invoice');
      }
    } catch (error) {
      console.error('Failed to send invoice:', error);
      toast.error('Failed to send invoice');
    }
  };

  const handleViewDetails = (order: CustomOrder) => {
    setSelectedOrder(order);
    setDetailsDialogOpen(true);
  };

  if (loading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        height='50vh'
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={3}>
        <Typography variant='h4' gutterBottom fontWeight='bold'>
          Custom Orders Management
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Manage custom laundry orders from customer-pinned locations
        </Typography>
      </Box>

      {/* Stats Cards */}
      <CustomOrdersStats />

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems='center'>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder='Search by order ID, customer name, or laundry name...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant='outlined'
              onClick={fetchCustomOrders}
              fullWidth
              startIcon={<Refresh />}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          variant='scrollable'
          scrollButtons='auto'
        >
          {tabs.map((tab, index) => (
            <Tab key={index} label={tab.label} />
          ))}
        </Tabs>
      </Paper>

      {/* Orders Table */}
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Laundry Details</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Pricing</TableCell>
              <TableCell>Pickup Info</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.map((order) => {
              const nextAction = getNextAction(order);
              return (
                <TableRow key={order.id} hover>
                  <TableCell>
                    <Typography variant='body2' fontWeight='bold'>
                      #{order.id.slice(-8)}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Box>
                      <Typography variant='body2' fontWeight='medium'>
                        {order.customer.firstName} {order.customer.lastName}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {order.customer.email}
                      </Typography>
                      {order.customer.phone && (
                        <Typography
                          variant='caption'
                          display='block'
                          color='text.secondary'
                        >
                          {order.customer.phone}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box>
                      <Typography variant='body2' fontWeight='medium'>
                        {order.customLaundryName}
                      </Typography>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        noWrap
                      >
                        {order.customLaundryDescription.length > 50
                          ? `${order.customLaundryDescription.slice(0, 50)}...`
                          : order.customLaundryDescription}
                      </Typography>
                      {order.customLaundryAddress && (
                        <Box display='flex' alignItems='center' mt={0.5}>
                          <LocationOn fontSize='small' color='action' />
                          <Typography variant='caption' color='text.secondary'>
                            {order.customLaundryAddress.slice(0, 30)}...
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={order.status.replace('_', ' ')}
                      color={getStatusColor(order.status)}
                      size='small'
                    />
                    {order.customerPaid && (
                      <Chip
                        label='Paid'
                        color='success'
                        size='small'
                        sx={{ ml: 0.5 }}
                      />
                    )}
                  </TableCell>

                  <TableCell>
                    <Box>
                      {order.adminServiceCharge ? (
                        <>
                          <Typography variant='body2'>
                            Service: {order.adminServiceCharge} SAR
                          </Typography>
                          <Typography variant='body2' fontWeight='bold'>
                            Total: {order.totalAmount} SAR
                          </Typography>
                        </>
                      ) : (
                        <Typography variant='caption' color='text.secondary'>
                          Not set
                        </Typography>
                      )}
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box>
                      <Typography variant='caption' display='block'>
                        {order.pickup.pickupDate} at {order.pickup.pickupTime}
                      </Typography>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        noWrap
                      >
                        {order.pickup.pickupAddress.slice(0, 30)}...
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Stack direction='row' spacing={1}>
                      <Tooltip title='View Details'>
                        <IconButton
                          size='small'
                          onClick={() => handleViewDetails(order)}
                        >
                          <Info />
                        </IconButton>
                      </Tooltip>

                      {nextAction && (
                        <Button
                          size='small'
                          variant='contained'
                          color={nextAction.color as any}
                          startIcon={nextAction.icon}
                          onClick={() => handleAction(order, nextAction.action)}
                        >
                          {nextAction.label}
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {filteredOrders.length === 0 && (
          <Box p={4} textAlign='center'>
            <Typography color='text.secondary'>
              No custom orders found for the selected criteria
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Dialogs */}
      {selectedOrder && (
        <>
          <CustomOrderDetailsDialog
            open={detailsDialogOpen}
            onClose={() => setDetailsDialogOpen(false)}
            order={selectedOrder}
          />

          <PricingDialog
            open={pricingDialogOpen}
            onClose={() => setPricingDialogOpen(false)}
            order={selectedOrder}
            onUpdate={fetchCustomOrders}
          />

          <DriverAssignmentDialog
            open={driverDialogOpen}
            onClose={() => setDriverDialogOpen(false)}
            order={selectedOrder}
            onUpdate={fetchCustomOrders}
          />

          <ReceiptUploadDialog
            open={receiptDialogOpen}
            onClose={() => setReceiptDialogOpen(false)}
            order={selectedOrder}
            onUpdate={fetchCustomOrders}
          />
        </>
      )}
    </Box>
  );
};

export default CustomOrders;
