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
} from '@mui/material';
import {
  Edit,
  Delete,
  Visibility,
  Search,
  Add,
  Business,
  LocationOn,
  Dashboard,
  List,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { useFetchAllLaundries, useFetchAllUsers } from '../hooks/Admin/query';
import { useDeleteLaundry } from '../hooks/Admin/mutation';
import { USER_TYPES } from '../hooks/Admin/interface';
import LaundryDashboardSummary from '../components/LaundryDashboardSummary';

interface Laundry {
  id: string;
  name: string;
  address?: string;
  lat: number;
  long: number;
  vendorId: string;
  vendor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  _count?: {
    laundryService: number;
  };
}

const Laundry: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLaundries, setFilteredLaundries] = useState<Laundry[]>([]);
  const [tabValue, setTabValue] = useState(0);

  const { data: laundries, isLoading, error, refetch } = useFetchAllLaundries();
  const { data: vendors } = useFetchAllUsers({
    type: USER_TYPES.VENDOR,
    page: 1,
    limit: 1000,
  });
  const { mutateAsync: deleteLaundry } = useDeleteLaundry();

  useEffect(() => {
    if (laundries?.data) {
      const filtered = laundries.data.filter(
        (laundry: Laundry) =>
          laundry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          laundry.vendor?.email
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          `${laundry.vendor?.firstName} ${laundry.vendor?.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
      setFilteredLaundries(filtered);
    }
  }, [laundries, searchTerm]);

  const handleEdit = (laundryId: string) => {
    navigate(`/laundry/${laundryId}/edit`);
  };

  const handleViewServices = (laundryId: string) => {
    navigate(`/laundry/${laundryId}/services`);
  };

  const handleViewVendor = (vendorId: string) => {
    navigate(`/user-details/${vendorId}`);
  };

  const handleDelete = async (laundryId: string, laundryName: string) => {
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

  const showError = (errorMessage: string) => {
    toast.error(errorMessage);
  };

  useEffect(() => {
    if (error) {
      showError(
        // (error?.response?.data as { message: string })?.message ||
          'Failed to fetch laundries'
      );
    }
  }, [error]);

  if (isLoading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='60vh'
      >
        <Typography>Loading laundries...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <ToastContainer />

      {/* Header */}
      <Stack
        direction='row'
        justifyContent='space-between'
        alignItems='center'
        mb={3}
      >
        <Typography variant='h4' fontWeight='bold'>
          Laundry Management
        </Typography>
        <Button
          variant='contained'
          startIcon={<Add />}
          onClick={() => navigate('/laundry/categories')}
          sx={{ ml: 2 }}
        >
          Manage Categories
        </Button>
      </Stack>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
        >
          <Tab icon={<Dashboard />} label='Dashboard' />
          <Tab icon={<List />} label='All Laundries' />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {tabValue === 0 && <LaundryDashboardSummary />}

      {tabValue === 1 && (
        <>
          {/* Search Bar */}
          <TextField
            fullWidth
            placeholder='Search by laundry name, vendor name, or email...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <Search />
                </InputAdornment>
              ),
            }}
          />

          {/* Stats */}
          <Stack direction='row' spacing={2} mb={3}>
            <Chip
              icon={<Business />}
              label={`Total Laundries: ${laundries?.data?.length || 0}`}
              color='primary'
              variant='outlined'
            />
            <Chip
              icon={<Business />}
              label={`Total Vendors: ${vendors?.data?.length || 0}`}
              color='secondary'
              variant='outlined'
            />
          </Stack>

          {/* Laundries Table */}
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Laundry Name</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Owner</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Contact</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Address</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Services</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Location</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Actions</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLaundries.length > 0 ? (
                  filteredLaundries.map((laundry: Laundry) => (
                    <TableRow key={laundry.id} hover>
                      <TableCell>
                        <Typography variant='body1' fontWeight='bold'>
                          {laundry.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant='text'
                          onClick={() => handleViewVendor(laundry.vendorId)}
                          sx={{ textTransform: 'none' }}
                        >
                          {laundry.vendor?.firstName} {laundry.vendor?.lastName}
                        </Button>
                      </TableCell>
                      <TableCell>{laundry.vendor?.email}</TableCell>
                      <TableCell>
                        {laundry.address || 'No address provided'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${
                            laundry._count?.laundryService || 0
                          } services`}
                          color={
                            laundry._count?.laundryService
                              ? 'success'
                              : 'default'
                          }
                          size='small'
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size='small'
                          startIcon={<LocationOn />}
                          onClick={() =>
                            window.open(
                              `https://maps.google.com/?q=${laundry.lat},${laundry.long}`,
                              '_blank'
                            )
                          }
                        >
                          View Map
                        </Button>
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
                            onClick={() => handleEdit(laundry.id)}
                            color='warning'
                            title='Edit Laundry'
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            size='small'
                            onClick={() =>
                              handleDelete(laundry.id, laundry.name)
                            }
                            color='error'
                            title='Delete Laundry'
                          >
                            <Delete />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align='center'>
                      <Typography variant='body1' color='text.secondary' py={4}>
                        {searchTerm
                          ? 'No laundries found matching your search.'
                          : 'No laundries found.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default Laundry;
