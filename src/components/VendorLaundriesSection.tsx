// File: src/components/VendorLaundriesSection.tsx
// Create this as a separate component to add to UserDetails

import React from 'react';
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
  Divider,
} from '@mui/material';
import {
  Visibility,
  Edit,
  Delete,
  LocationOn,
  LocalLaundryService,
  Settings,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useFetchAllLaundries } from '../hooks/Admin/query';
import { useDeleteLaundry } from '../hooks/Admin/mutation';

interface VendorLaundriesSectionProps {
  vendorId: string;
}

interface Laundry {
  id: string;
  name: string;
  address?: string;
  lat: number;
  long: number;
  vendorId: string;
  createdAt: string;
  _count?: {
    laundryService: number;
  };
}

const VendorLaundriesSection: React.FC<VendorLaundriesSectionProps> = ({
  vendorId,
}) => {
  const navigate = useNavigate();
  const { data: allLaundries, refetch } = useFetchAllLaundries();
  const { mutateAsync: deleteLaundry } = useDeleteLaundry();

  // Filter laundries for this specific vendor
  const vendorLaundries =
    allLaundries?.data?.filter(
      (laundry: Laundry) => laundry.vendorId === vendorId
    ) || [];

  const handleViewServices = (laundryId: string) => {
    navigate(`/laundry/${laundryId}/services`);
  };

  const handleEditLaundry = (laundryId: string) => {
    navigate(`/laundry/${laundryId}/edit`);
  };

  const handleDeleteLaundry = async (
    laundryId: string,
    laundryName: string
  ) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${laundryName}"? This action cannot be undone.`
      )
    ) {
      try {
        await deleteLaundry(laundryId);
        toast.success('Laundry deleted successfully');
        refetch();
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || 'Failed to delete laundry'
        );
      }
    }
  };

  const handleViewOnMap = (lat: number, lng: number) => {
    window.open(`https://maps.google.com/?q=${lat},${lng}`, '_blank');
  };

  return (
    <Box>
      <Typography variant='h5' gutterBottom fontWeight='bold' mt={4}>
        <Stack direction='row' alignItems='center' spacing={1}>
          <LocalLaundryService />
          <span>Vendor Laundries</span>
        </Stack>
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {vendorLaundries.length > 0 ? (
        <>
          {/* Stats */}
          <Stack direction='row' spacing={2} mb={3}>
            <Chip
              icon={<LocalLaundryService />}
              label={`Total Laundries: ${vendorLaundries.length}`}
              color='primary'
              variant='outlined'
            />
            <Chip
              icon={<Settings />}
              label={`Total Services: ${vendorLaundries.reduce(
                (sum: number, laundry: any) => sum + (laundry._count?.laundryService || 0),
                0
              )}`}
              color='secondary'
              variant='outlined'
            />
          </Stack>

          {/* Laundries Table */}
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Laundry Name</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Address</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Services</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Created</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Actions</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vendorLaundries.map((laundry: Laundry) => (
                  <TableRow key={laundry.id} hover>
                    <TableCell>
                      <Typography variant='body1' fontWeight='bold'>
                        {laundry.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant='body2'>
                          {laundry.address || 'No address provided'}
                        </Typography>
                        <Button
                          size='small'
                          startIcon={<LocationOn />}
                          onClick={() =>
                            handleViewOnMap(laundry.lat, laundry.long)
                          }
                          sx={{ mt: 0.5 }}
                        >
                          View on Map
                        </Button>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${
                          laundry._count?.laundryService || 0
                        } services`}
                        color={
                          laundry._count?.laundryService ? 'success' : 'default'
                        }
                        size='small'
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(laundry.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Stack direction='row' spacing={1}>
                        <IconButton
                          size='small'
                          onClick={() => handleViewServices(laundry.id)}
                          color='primary'
                          title='View Services'
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          size='small'
                          onClick={() => handleEditLaundry(laundry.id)}
                          color='warning'
                          title='Edit Laundry'
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size='small'
                          onClick={() =>
                            handleDeleteLaundry(laundry.id, laundry.name)
                          }
                          color='error'
                          title='Delete Laundry'
                        >
                          <Delete />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <LocalLaundryService
            sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }}
          />
          <Typography variant='h6' color='text.secondary' gutterBottom>
            No Laundries Found
          </Typography>
          <Typography variant='body2' color='text.secondary' mb={3}>
            This vendor doesn't have any laundries registered yet.
          </Typography>
          <Button variant='outlined' onClick={() => navigate('/laundry')}>
            Go to Laundry Management
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default VendorLaundriesSection;
