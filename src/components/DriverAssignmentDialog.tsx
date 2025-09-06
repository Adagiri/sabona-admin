// File: src/components/DriverAssignmentDialog.tsx

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Radio,
  FormControlLabel,
  RadioGroup,
  FormControl,
  Chip,
  Paper,
  Grid,
} from '@mui/material';
import {
  DirectionsCar,
  Star,
  Phone,
  LocationOn,
  AccessTime,
  Person,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  rating: number;
  totalOrders: number;
  currentLat?: number;
  currentLong?: number;
  isAvailable: boolean;
  distanceFromPickup?: number;
  estimatedArrival?: string;
}

interface CustomOrder {
  id: string;
  customLaundryName: string;
  customLaundryLat: number;
  customLaundryLong: number;
  pickup: {
    pickupDate: string;
    pickupTime: string;
    pickupAddress: string;
  };
  customer: {
    firstName: string;
    lastName: string;
  };
}

interface DriverAssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  order: CustomOrder;
  onUpdate: () => void;
}

const DriverAssignmentDialog: React.FC<DriverAssignmentDialogProps> = ({
  open,
  onClose,
  order,
  onUpdate,
}) => {
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (open && order) {
      fetchAvailableDrivers();
    }
  }, [open, order]);

  const fetchAvailableDrivers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/custom-order/${order.id}/available-drivers`
      );
      const data = await response.json();
      setAvailableDrivers(data.data || []);
    } catch (error) {
      console.error('Failed to fetch available drivers:', error);
      toast.error('Failed to load available drivers');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDriver = async () => {
    if (!selectedDriverId) {
      toast.error('Please select a driver');
      return;
    }

    setAssigning(true);
    try {
      const response = await fetch(
        `/api/admin/custom-order/${order.id}/assign-driver`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            riderId: selectedDriverId,
          }),
        }
      );

      if (response.ok) {
        toast.success('Driver assigned successfully');
        onUpdate();
        onClose();
      } else {
        const error = await response.json();
        toast.error(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to assign driver:', error);
      toast.error('Failed to assign driver');
    } finally {
      setAssigning(false);
    }
  };

  const getDriverAvailabilityColor = (driver: Driver) => {
    if (!driver.isAvailable) return 'error';
    if (driver.distanceFromPickup && driver.distanceFromPickup > 10)
      return 'warning';
    return 'success';
  };

  const getDriverAvailabilityText = (driver: Driver) => {
    if (!driver.isAvailable) return 'Busy';
    if (driver.distanceFromPickup && driver.distanceFromPickup > 10)
      return 'Far';
    return 'Available';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>
        <Box display='flex' alignItems='center' gap={1}>
          <DirectionsCar color='primary' />
          Assign Driver to Custom Order
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Order Summary */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
          <Typography variant='h6' gutterBottom fontWeight='bold'>
            Pickup Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box display='flex' alignItems='center' gap={1} mb={1}>
                <Person fontSize='small' color='action' />
                <Typography variant='body2'>
                  <strong>Customer:</strong> {order.customer.firstName}{' '}
                  {order.customer.lastName}
                </Typography>
              </Box>
              <Box display='flex' alignItems='center' gap={1} mb={1}>
                <AccessTime fontSize='small' color='action' />
                <Typography variant='body2'>
                  <strong>Time:</strong> {order.pickup.pickupDate} at{' '}
                  {order.pickup.pickupTime}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant='body2' gutterBottom>
                <strong>Destination:</strong> {order.customLaundryName}
              </Typography>
              <Box display='flex' alignItems='center' gap={1}>
                <LocationOn fontSize='small' color='action' />
                <Typography variant='body2' color='text.secondary'>
                  From: {order.pickup.pickupAddress}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Driver Selection */}
        {loading ? (
          <Box display='flex' justifyContent='center' p={4}>
            <CircularProgress />
          </Box>
        ) : availableDrivers.length === 0 ? (
          <Alert severity='warning'>
            <Typography variant='body2'>
              No drivers are currently available for this pickup time and
              location. Please try refreshing or check back later.
            </Typography>
          </Alert>
        ) : (
          <>
            <Typography variant='h6' gutterBottom fontWeight='bold'>
              Available Drivers ({availableDrivers.length})
            </Typography>

            <FormControl component='fieldset' fullWidth>
              <RadioGroup
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
              >
                <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {availableDrivers.map((driver) => (
                    <ListItem
                      key={driver.id}
                      sx={{
                        border: 1,
                        borderColor: 'grey.300',
                        borderRadius: 2,
                        mb: 1,
                        '&:hover': { bgcolor: 'grey.50' },
                        ...(selectedDriverId === driver.id && {
                          bgcolor: 'primary.light',
                          borderColor: 'primary.main',
                        }),
                      }}
                    >
                      <FormControlLabel
                        value={driver.id}
                        control={<Radio />}
                        label=''
                        sx={{ mr: 1 }}
                      />

                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {driver.firstName[0]}
                          {driver.lastName[0]}
                        </Avatar>
                      </ListItemAvatar>

                      <ListItemText
                        primary={
                          <Box display='flex' alignItems='center' gap={1}>
                            <Typography variant='subtitle1' fontWeight='bold'>
                              {driver.firstName} {driver.lastName}
                            </Typography>
                            <Chip
                              label={getDriverAvailabilityText(driver)}
                              color={getDriverAvailabilityColor(driver)}
                              size='small'
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Box
                              display='flex'
                              alignItems='center'
                              gap={2}
                              mt={0.5}
                            >
                              <Box display='flex' alignItems='center' gap={0.5}>
                                <Star fontSize='small' color='warning' />
                                <Typography variant='body2'>
                                  {driver.rating.toFixed(1)} (
                                  {driver.totalOrders} orders)
                                </Typography>
                              </Box>

                              <Box display='flex' alignItems='center' gap={0.5}>
                                <Phone fontSize='small' color='action' />
                                <Typography variant='body2'>
                                  {driver.phone}
                                </Typography>
                              </Box>
                            </Box>

                            {driver.distanceFromPickup && (
                              <Box
                                display='flex'
                                alignItems='center'
                                gap={2}
                                mt={0.5}
                              >
                                <Typography
                                  variant='body2'
                                  color='text.secondary'
                                >
                                  📍 {driver.distanceFromPickup.toFixed(1)} km
                                  away
                                </Typography>
                                {driver.estimatedArrival && (
                                  <Typography
                                    variant='body2'
                                    color='text.secondary'
                                  >
                                    🕒 ETA: {driver.estimatedArrival}
                                  </Typography>
                                )}
                              </Box>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </RadioGroup>
            </FormControl>
          </>
        )}

        {/* Assignment Instructions */}
        {selectedDriverId && (
          <Alert severity='info' sx={{ mt: 2 }}>
            <Typography variant='body2'>
              <strong>Next steps after assignment:</strong>
            </Typography>
            <Typography variant='body2' component='ul' sx={{ mt: 1, pl: 2 }}>
              <li>Driver will be notified of the pickup details</li>
              <li>Customer will receive driver contact information</li>
              <li>
                Driver will collect items and proceed to the custom laundry
              </li>
              <li>
                You'll need to upload the vendor receipt once the driver pays
              </li>
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={assigning}>
          Cancel
        </Button>
        <Button
          onClick={handleAssignDriver}
          variant='contained'
          disabled={assigning || !selectedDriverId}
          startIcon={
            assigning ? <CircularProgress size={20} /> : <DirectionsCar />
          }
        >
          {assigning ? 'Assigning...' : 'Assign Driver'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DriverAssignmentDialog;
