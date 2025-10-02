import React, { useState } from 'react';
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
import {
  useFetchAvailableDriversForCustomOrder,
  useAssignDriverToCustomOrder,
} from '../hooks/Admin/customOrdersHooks';

interface Driver {
  riderId: string; // Changed from id to riderId
  firstName?: string;
  lastName?: string;
  name?: string;
  phone: string;
  email: string;
  rating: number;
  totalOrders: number;
  currentLat?: number;
  currentLong?: number;
  isAvailable: boolean;
  distanceFromPickup?: number;
  distance?: number;
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
    name?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
  };
}

interface DriverAssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  order: CustomOrder;
}

const DriverAssignmentDialog: React.FC<DriverAssignmentDialogProps> = ({
  open,
  onClose,
  order,
}) => {
  const [selectedDriverId, setSelectedDriverId] = useState('');

  const {
    data: driversData,
    isLoading,
    error,
  } = useFetchAvailableDriversForCustomOrder(order?.id);

  const assignDriverMutation = useAssignDriverToCustomOrder();

  const availableDrivers = driversData?.data || [];

  const handleAssignDriver = () => {
    if (!selectedDriverId) {
      return;
    }

    assignDriverMutation.mutate(
      {
        orderId: order.id,
        riderId: selectedDriverId,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const getDriverAvailabilityColor = (driver: Driver) => {
    if (!driver.isAvailable) return 'error';
    const dist = driver.distanceFromPickup || driver.distance || 0;
    if (dist > 10) return 'warning';
    return 'success';
  };

  const getDriverAvailabilityText = (driver: Driver) => {
    if (!driver.isAvailable) return 'Busy';
    const dist = driver.distanceFromPickup || driver.distance || 0;
    if (dist > 10) return 'Far';
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
                  <strong>Customer:</strong> {order.customer?.firstName}{' '}
                  {order.customer?.lastName}
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
        {isLoading ? (
          <Box display='flex' justifyContent='center' p={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity='error'>
            <Typography variant='body2'>
              Failed to load available drivers. Please try again.
            </Typography>
          </Alert>
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
                  {availableDrivers.map((driver: Driver) => {
                    const driverName =
                      driver.firstName && driver.lastName
                        ? `${driver.firstName} ${driver.lastName}`
                        : driver.name || 'Driver';
                    const dist = driver.distanceFromPickup || driver.distance;

                    return (
                      <ListItem
                        key={driver.riderId}
                        onClick={() => setSelectedDriverId(driver.riderId)}
                        sx={{
                          cursor: 'pointer',
                          border: 1,
                          borderColor: 'grey.300',
                          borderRadius: 2,
                          mb: 1,
                          '&:hover': { bgcolor: 'grey.50' },
                          ...(selectedDriverId === driver.riderId && {
                            bgcolor: 'primary.light',
                            borderColor: 'primary.main',
                          }),
                        }}
                      >
                        <Radio
                          checked={selectedDriverId === driver.riderId}
                          value={driver.riderId}
                        />

                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {driverName[0]}
                            {driverName[1] || ''}
                          </Avatar>
                        </ListItemAvatar>

                        <ListItemText
                          primary={
                            <Box display='flex' alignItems='center' gap={1}>
                              <Typography variant='subtitle1' fontWeight='bold'>
                                {driverName}
                              </Typography>
                              <Chip
                                label={getDriverAvailabilityText(driver)}
                                color={getDriverAvailabilityColor(driver)}
                                size='small'
                              />
                            </Box>
                          }
                          secondary={
                            <Box component='div'>
                              <Box
                                display='flex'
                                alignItems='center'
                                gap={2}
                                mt={0.5}
                              >
                                <Box
                                  display='flex'
                                  alignItems='center'
                                  gap={0.5}
                                >
                                  <Star fontSize='small' color='warning' />
                                  <Typography variant='body2' component='span'>
                                    {driver.rating || '_'} (
                                    {driver.totalOrders || 0} orders)
                                  </Typography>
                                </Box>

                                <Box
                                  display='flex'
                                  alignItems='center'
                                  gap={0.5}
                                >
                                  <Phone fontSize='small' color='action' />
                                  <Typography variant='body2' component='span'>
                                    {driver.phone}
                                  </Typography>
                                </Box>
                              </Box>

                              {dist && (
                                <Box
                                  display='flex'
                                  alignItems='center'
                                  gap={2}
                                  mt={0.5}
                                >
                                  <Typography
                                    variant='body2'
                                    color='text.secondary'
                                    component='span'
                                  >
                                    📍 {dist.toFixed(1)} km away
                                  </Typography>
                                  {driver.estimatedArrival && (
                                    <Typography
                                      variant='body2'
                                      color='text.secondary'
                                      component='span'
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
                    );
                  })}
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
        <Button onClick={onClose} disabled={assignDriverMutation.isPending}>
          Cancel
        </Button>
        <Button
          onClick={handleAssignDriver}
          variant='contained'
          disabled={assignDriverMutation.isPending || !selectedDriverId}
          startIcon={
            assignDriverMutation.isPending ? (
              <CircularProgress size={20} />
            ) : (
              <DirectionsCar />
            )
          }
        >
          {assignDriverMutation.isPending ? 'Assigning...' : 'Assign Driver'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DriverAssignmentDialog;
