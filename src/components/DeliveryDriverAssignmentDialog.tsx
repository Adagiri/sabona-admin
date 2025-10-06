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
  Paper,
  Grid,
} from '@mui/material';
import { LocalShipping } from '@mui/icons-material';
import {
  useFetchAvailableDriversForCustomOrder,
  useMarkCustomOrderReadyForDelivery,
} from '../hooks/Admin/customOrdersHooks';

interface DeliveryDriverAssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  order: any;
}

const DeliveryDriverAssignmentDialog: React.FC<DeliveryDriverAssignmentDialogProps> = ({ open, onClose, order }) => {
  const [selectedDriverId, setSelectedDriverId] = useState('');

  const {
    data: driversData,
    isLoading,
    error,
  } = useFetchAvailableDriversForCustomOrder(order?.id);

  const markReadyMutation = useMarkCustomOrderReadyForDelivery();

  const availableDrivers = driversData?.data || [];

  const handleAssignDeliveryDriver = () => {
    if (!selectedDriverId) return;

    markReadyMutation.mutate(
      {
        orderId: order.id,
        deliveryRiderId: selectedDriverId,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>
        <Box display='flex' alignItems='center' gap={1}>
          <LocalShipping color='primary' />
          Assign Delivery Driver
        </Box>
      </DialogTitle>

      <DialogContent>
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
          <Typography variant='h6' gutterBottom fontWeight='bold'>
            Delivery Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant='body2' gutterBottom>
                <strong>Customer:</strong> {order.customer?.firstName}{' '}
                {order.customer?.lastName}
              </Typography>
              <Typography variant='body2' gutterBottom>
                <strong>From:</strong> {order.customLaundryName}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant='body2' gutterBottom>
                <strong>To:</strong> {order.delivery?.deliveryAddress}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {isLoading ? (
          <Box display='flex' justifyContent='center' p={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity='error'>Failed to load available drivers</Alert>
        ) : availableDrivers.length === 0 ? (
          <Alert severity='warning'>No drivers available</Alert>
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
                  {availableDrivers.map((driver: any) => (
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
                          {driver.firstName?.[0] || 'D'}
                        </Avatar>
                      </ListItemAvatar>

                      <ListItemText
                        primary={
                          <Typography variant='body1' fontWeight='medium'>
                            {driver.firstName} {driver.lastName}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant='body2'>
                              {driver.phone}
                            </Typography>
                            {driver.distance && (
                              <Typography
                                variant='body2'
                                color='text.secondary'
                              >
                                📍 {driver.distance.toFixed(1)} km away
                              </Typography>
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

        {selectedDriverId && (
          <Alert severity='info' sx={{ mt: 2 }}>
            <Typography variant='body2'>
              <strong>After assignment:</strong>
            </Typography>
            <Typography variant='body2' component='ul' sx={{ mt: 1, pl: 2 }}>
              <li>Driver will be notified to pickup from the vendor</li>
              <li>Driver will deliver items to customer</li>
              <li>Order will be marked as completed upon delivery</li>
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={markReadyMutation.isPending}>
          Cancel
        </Button>
        <Button
          onClick={handleAssignDeliveryDriver}
          variant='contained'
          disabled={markReadyMutation.isPending || !selectedDriverId}
          startIcon={
            markReadyMutation.isPending ? (
              <CircularProgress size={20} />
            ) : (
              <LocalShipping />
            )
          }
        >
          {markReadyMutation.isPending
            ? 'Assigning...'
            : 'Assign Delivery Driver'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeliveryDriverAssignmentDialog;