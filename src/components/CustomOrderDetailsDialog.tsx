import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Paper,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  Info,
  Person,
  LocationOn,
  Schedule,
  LocalShipping,
  Receipt,
  Phone,
  Email,
  Business,
  DirectionsCar,
  CheckCircle,
  AccessTime,
  Money,
  Launch,
  ContentCopy,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

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
  customPaymentMethod?: string;
  payTabsTransactionRef?: string;
  customerPaymentDate?: string;
  deliveryType: string;
  createdAt: string;
  customer: {
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  pickup: {
    pickupDate: string;
    pickupTime: string;
    pickupAddress: string;
    pickupLat?: number;
    pickupLong?: number;
  };
  delivery: {
    deliveryAddress: string;
    deliveryType: string;
  };
  riderOrders: Array<{
    id: string;
    type: string;
    status: string;
    createdAt: string;
    rider: {
      name?: string;
      firstName?: string;
      lastName?: string;
      phone: string;
      email?: string;
    };
  }>;
}

interface CustomOrderDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  order: CustomOrder;
  
}

const CustomOrderDetailsDialog: React.FC<CustomOrderDetailsDialogProps> = ({
  open,
  onClose,
  order,
}) => {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const openMap = (lat: number, lng: number, name: string) => {
    console.log(typeof name);
    const url = `https://maps.google.com/maps?q=${lat},${lng}&z=15&ll=${lat},${lng}`;
    window.open(url, '_blank');
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

  const getRiderOrderTypeLabel = (type: string) => {
    switch (type) {
      case 'RIDER_PICKUP':
        return 'Pickup';
      case 'RIDER_DELIVERY':
        return 'Delivery';
      default:
        return type;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='lg' fullWidth>
      <DialogTitle>
        <Box display='flex' alignItems='center' justifyContent='space-between'>
          <Box display='flex' alignItems='center' gap={1}>
            <Info color='primary' />
            <Typography variant='h6'>Custom Order Details</Typography>
          </Box>
          <Chip
            label={order.status.replace('_', ' ')}
            color={getStatusColor(order.status)}
          />
        </Box>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3}>
          {/* Order Summary */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: 'fit-content' }}>
              <Typography variant='h6' gutterBottom fontWeight='bold'>
                📋 Order Summary
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Receipt />
                  </ListItemIcon>
                  <ListItemText
                    primary='Order ID'
                    secondary={
                      <Box display='flex' alignItems='center' gap={1}>
                        <Typography variant='body2'>
                          #{order.id.slice(-8)}
                        </Typography>
                        <IconButton
                          size='small'
                          onClick={() => copyToClipboard(order.id, 'Order ID')}
                        >
                          <ContentCopy fontSize='small' />
                        </IconButton>
                      </Box>
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Schedule />
                  </ListItemIcon>
                  <ListItemText
                    primary='Created'
                    secondary={new Date(order.createdAt).toLocaleString()}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Money />
                  </ListItemIcon>
                  <ListItemText
                    primary='Pricing'
                    secondary={
                      order.adminServiceCharge ? (
                        <Box>
                          <Typography variant='body2'>
                            Service Charge: {order.adminServiceCharge} SAR
                          </Typography>
                          <Typography variant='body2' fontWeight='bold'>
                            Total: {order.totalAmount} SAR
                          </Typography>
                        </Box>
                      ) : (
                        'Not set'
                      )
                    }
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          {/* Customer Information */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: 'fit-content' }}>
              <Typography variant='h6' gutterBottom fontWeight='bold'>
                👤 Customer Information
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Person />
                  </ListItemIcon>
                  <ListItemText
                    primary='Name'
                    secondary={`${order.customer?.firstName} ${order.customer?.lastName}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Email />
                  </ListItemIcon>
                  <ListItemText
                    primary='Email'
                    secondary={
                      <Box display='flex' alignItems='center' gap={1}>
                        <Typography variant='body2'>
                          {order.customer?.email}
                        </Typography>
                        <IconButton
                          size='small'
                          onClick={() =>
                            copyToClipboard(
                              order?.customer?.email || 'nin',
                              'Email'
                            )
                          }
                        >
                          <ContentCopy fontSize='small' />
                        </IconButton>
                      </Box>
                    }
                  />
                </ListItem>
                {order.customer?.phone && (
                  <ListItem>
                    <ListItemIcon>
                      <Phone />
                    </ListItemIcon>
                    <ListItemText
                      primary='Phone'
                      secondary={
                        <Box display='flex' alignItems='center' gap={1}>
                          <Typography variant='body2'>
                            {order.customer?.phone}
                          </Typography>
                          <IconButton
                            size='small'
                            onClick={() =>
                              copyToClipboard(
                                order.customer?.phone ?? '',
                                'Phone'
                              )
                            }
                          >
                            <ContentCopy fontSize='small' />
                          </IconButton>
                        </Box>
                      }
                    />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Grid>

          {/* Laundry Details */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant='h6' gutterBottom fontWeight='bold'>
                🏪 Custom Laundry Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <Business />
                      </ListItemIcon>
                      <ListItemText
                        primary='Laundry Name'
                        secondary={order.customLaundryName}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <LocationOn />
                      </ListItemIcon>
                      <ListItemText
                        primary='Location'
                        secondary={
                          <Box>
                            {order.customLaundryAddress && (
                              <Typography variant='body2' gutterBottom>
                                {order.customLaundryAddress}
                              </Typography>
                            )}
                            <Box display='flex' alignItems='center' gap={1}>
                              <Typography
                                variant='caption'
                                color='text.secondary'
                              >
                                Lat: {order.customLaundryLat.toFixed(6)}, Lng:{' '}
                                {order.customLaundryLong.toFixed(6)}
                              </Typography>
                              <Button
                                size='small'
                                startIcon={<Launch />}
                                onClick={() =>
                                  openMap(
                                    order.customLaundryLat,
                                    order.customLaundryLong,
                                    order.customLaundryName
                                  )
                                }
                              >
                                View on Map
                              </Button>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography
                    variant='subtitle2'
                    gutterBottom
                    fontWeight='bold'
                  >
                    Description:
                  </Typography>
                  <Typography
                    variant='body2'
                    sx={{
                      bgcolor: 'grey.50',
                      p: 1,
                      borderRadius: 1,
                      maxHeight: 100,
                      overflow: 'auto',
                    }}
                  >
                    {order.customLaundryDescription}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Pickup & Delivery */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant='h6' gutterBottom fontWeight='bold'>
                📦 Pickup Details
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Schedule />
                  </ListItemIcon>
                  <ListItemText
                    primary='Pickup Time'
                    secondary={`${order.pickup.pickupDate} at ${order.pickup.pickupTime}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocationOn />
                  </ListItemIcon>
                  <ListItemText
                    primary='Pickup Address'
                    secondary={
                      <Box>
                        <Typography variant='body2' gutterBottom>
                          {order.pickup.pickupAddress}
                        </Typography>
                        {order.pickup.pickupLat && order.pickup.pickupLong && (
                          <Box display='flex' alignItems='center' gap={1} mt={0.5}>
                            <Typography variant='caption' color='text.secondary'>
                              Lat: {order.pickup.pickupLat.toFixed(6)}, Lng:{' '}
                              {order.pickup.pickupLong.toFixed(6)}
                            </Typography>
                            <Button
                              size='small'
                              startIcon={<Launch />}
                              onClick={() =>
                                openMap(
                                  order.pickup.pickupLat!,
                                  order.pickup.pickupLong!,
                                  'Pickup Location'
                                )
                              }
                            >
                              View on Map
                            </Button>
                          </Box>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant='h6' gutterBottom fontWeight='bold'>
                🚚 Delivery Details
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <LocalShipping />
                  </ListItemIcon>
                  <ListItemText
                    primary='Delivery Type'
                    secondary={
                      <Chip
                        label={order.deliveryType}
                        size='small'
                        color={
                          order.deliveryType === 'EXPRESS'
                            ? 'warning'
                            : 'default'
                        }
                      />
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocationOn />
                  </ListItemIcon>
                  <ListItemText
                    primary='Delivery Address'
                    secondary={order.delivery.deliveryAddress}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          {/* Payment Information */}
          {(order.customVendorPaid || order.payTabsInvoiceUrl) && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant='h6' gutterBottom fontWeight='bold'>
                  💳 Payment Information
                </Typography>
                <Grid container spacing={2}>
                  {/* Vendor Payment */}
                  {order.customVendorPaid && (
                    <Grid item xs={12} md={6}>
                      <Typography variant='subtitle2' gutterBottom>
                        Driver Payment to Vendor:
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary='Vendor Name'
                            secondary={order.customVendorName}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary='Amount Paid'
                            secondary={`${order.customVendorPaid} SAR`}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary='Payment Method'
                            secondary={order.customPaymentMethod}
                          />
                        </ListItem>
                      </List>
                    </Grid>
                  )}

                  {/* Customer Payment */}
                  <Grid item xs={12} md={6}>
                    <Typography variant='subtitle2' gutterBottom>
                      Customer Payment:
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          {order.customerPaid ? (
                            <CheckCircle color='success' />
                          ) : (
                            <AccessTime color='warning' />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary='Payment Status'
                          secondary={
                            <Chip
                              label={order.customerPaid ? 'Paid' : 'Pending'}
                              color={order.customerPaid ? 'success' : 'warning'}
                              size='small'
                            />
                          }
                        />
                      </ListItem>
                      {order.payTabsInvoiceUrl && (
                        <ListItem>
                          <ListItemText
                            primary='Payment Link'
                            secondary={
                              <Button
                                size='small'
                                startIcon={<Launch />}
                                onClick={() =>
                                  window.open(order.payTabsInvoiceUrl, '_blank')
                                }
                              >
                                Open PayTabs Invoice
                              </Button>
                            }
                          />
                        </ListItem>
                      )}
                      {order.customerPaymentDate && (
                        <ListItem>
                          <ListItemText
                            primary='Payment Date'
                            secondary={new Date(
                              order.customerPaymentDate
                            ).toLocaleString()}
                          />
                        </ListItem>
                      )}
                      {order.payTabsTransactionRef && (
                        <ListItem>
                          <ListItemText
                            primary='Transaction Reference'
                            secondary={order.payTabsTransactionRef}
                          />
                        </ListItem>
                      )}
                    </List>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          )}

          {/* Driver Assignment */}
          {order.riderOrders.length > 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant='h6' gutterBottom fontWeight='bold'>
                  🚗 Driver Assignments
                </Typography>
                {order.riderOrders.map((riderOrder, index) => (
                  <Box key={riderOrder.id} mb={2}>
                    <Box display='flex' alignItems='center' gap={2} mb={1}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <DirectionsCar />
                      </Avatar>
                      <Box>
                        <Typography variant='subtitle1' fontWeight='bold'>
                          {riderOrder.rider.firstName}{' '}
                          {riderOrder.rider.lastName}
                        </Typography>
                        <Box display='flex' alignItems='center' gap={2}>
                          <Chip
                            label={getRiderOrderTypeLabel(riderOrder.type)}
                            size='small'
                            color='info'
                          />
                          <Chip
                            label={riderOrder.status}
                            size='small'
                            color={
                              riderOrder.status === 'COMPLETED'
                                ? 'success'
                                : 'default'
                            }
                          />
                        </Box>
                      </Box>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant='body2'>
                          📞 {riderOrder.rider.phone}
                        </Typography>
                        <Typography variant='body2'>
                          ✉️ {riderOrder.rider.email}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant='caption' color='text.secondary'>
                          Assigned:{' '}
                          {new Date(riderOrder.createdAt).toLocaleString()}
                        </Typography>
                      </Grid>
                    </Grid>
                    {index < order.riderOrders.length - 1 && (
                      <Divider sx={{ mt: 2 }} />
                    )}
                  </Box>
                ))}
              </Paper>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant='contained'>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomOrderDetailsDialog;
