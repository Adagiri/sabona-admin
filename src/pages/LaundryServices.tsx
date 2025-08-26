// File: src/pages/LaundryServices.tsx

import React, { useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Breadcrumbs,
  Link,
  Alert,
  Avatar,
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  ArrowBack,
  Inventory,
  NavigateNext,
  ImageOutlined,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { useForm, Controller } from 'react-hook-form';
import {
  useFetchLaundryById,
  useFetchLaundryServices,
} from '../hooks/Admin/query';
import {
  useCreateLaundryService,
  useDeleteLaundryService,
  useEditLaundryService,
} from '../hooks/Admin/mutation';
import IconPicker from '../components/IconPicker';

interface Service {
  id: string;
  name: string;
  description?: string;
  iconId?: number;
  icon?: {
    id: number;
    path: string;
    name: string;
    media: {
      path: string;
    };
  };
  laundryId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    laundryServiceItems: number;
  };
}

interface ServiceFormData {
  name: string;
  description: string;
  iconId?: number;
}

const LaundryServices: React.FC = () => {
  const { laundryId } = useParams<{ laundryId: string }>();
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: laundry } = useFetchLaundryById(laundryId!);
  const {
    data: services,
    isLoading,
    error,
    refetch,
  } = useFetchLaundryServices(laundryId!);
  const { mutateAsync: createService } = useCreateLaundryService();
  const { mutateAsync: editService } = useEditLaundryService();
  const { mutateAsync: deleteService } = useDeleteLaundryService();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServiceFormData>({
    defaultValues: {
      name: '',
      description: '',
      iconId: undefined,
    },
  });

  const handleCreateService = () => {
    setEditingService(null);
    reset({ name: '', description: '', iconId: undefined });
    setOpenDialog(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    reset({
      name: service.name,
      description: service.description || '',
      iconId: service.iconId,
    });
    setOpenDialog(true);
  };

  const handleDeleteService = async (
    serviceId: string,
    serviceName: string
  ) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${serviceName}"? This will also delete all associated items.`
      )
    ) {
      try {
        await deleteService({ laundryId: laundryId!, serviceId });
        toast.success('Service deleted successfully');
        refetch();
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || 'Failed to delete service'
        );
      }
    }
  };
const onSubmit = async (data: ServiceFormData) => {
  setIsSubmitting(true);
  try {
    if (editingService) {
      await editService({
        laundryId: laundryId!,
        serviceId: editingService.id,
        data,
      });
      toast.success('Service updated successfully');
    } else {
      await createService({
        laundryId: laundryId!,
        data,
      });
      toast.success('Service created successfully');
    }

    setOpenDialog(false);
    refetch();
  } catch (error: any) {
    toast.error(error?.response?.data?.message || 'Failed to save service');
  } finally {
    setIsSubmitting(false);
  }
};

  const handleViewItems = (serviceId: string) => {
    navigate(`/laundry/${laundryId}/service/${serviceId}/items`);
  };

  if (isLoading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='60vh'
      >
        <Typography>Loading services...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity='error'>
          Failed to load services:{' '}
          {(error as any)?.response?.data?.message || 'Unknown error'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <ToastContainer />

      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNext fontSize='small' />} sx={{ mb: 2 }}>
        <Link
          component='button'
          variant='body1'
          onClick={() => navigate('/laundry')}
          sx={{ textDecoration: 'none' }}
        >
          Laundry Management
        </Link>
        <Typography color='text.primary'>
          {laundry?.data?.name || 'Services'}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Stack
        direction='row'
        justifyContent='space-between'
        alignItems='center'
        mb={3}
      >
        <Box>
          <Stack direction='row' alignItems='center' spacing={2}>
            <IconButton onClick={() => navigate('/laundry')}>
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant='h4' fontWeight='bold'>
                {laundry?.data?.name} - Services
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Manage services for this laundry
              </Typography>
            </Box>
          </Stack>
        </Box>
        <Button
          variant='contained'
          startIcon={<Add />}
          onClick={handleCreateService}
        >
          Add Service
        </Button>
      </Stack>

      {/* Laundry Info */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
        <Stack direction='row' spacing={3}>
          <Typography variant='body2'>
            <strong>Laundry:</strong> {laundry?.data?.name}
          </Typography>
          <Typography variant='body2'>
            <strong>Location:</strong> {laundry?.data?.address}
          </Typography>
          <Typography variant='body2'>
            <strong>Total Services:</strong> {services?.data?.length || 0}
          </Typography>
        </Stack>
      </Paper>

      {/* Services Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Icon</strong>
              </TableCell>
              <TableCell>
                <strong>Service Name</strong>
              </TableCell>
              <TableCell>
                <strong>Description</strong>
              </TableCell>
              <TableCell>
                <strong>Items</strong>
              </TableCell>
              <TableCell>
                <strong>Status</strong>
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
            {services?.data?.length > 0 ? (
              services.data.map((service: Service) => (
                <TableRow key={service.id} hover>
                  <TableCell>
                    <Avatar
                      src={service.icon?.media.path}
                      sx={{ width: 40, height: 40 }}
                      variant='rounded'
                    >
                      <ImageOutlined />
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Typography variant='body1' fontWeight='bold'>
                      {service.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2' color='text.secondary'>
                      {service.description || 'No description'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2'>
                      {service._count?.laundryServiceItems || 0} items
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label='Active' color='success' size='small' />
                  </TableCell>
                  <TableCell>
                    {new Date(service.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Stack direction='row' spacing={1}>
                      <IconButton
                        size='small'
                        onClick={() => handleViewItems(service.id)}
                        color='primary'
                        title='View Items'
                      >
                        <Inventory />
                      </IconButton>
                      <IconButton
                        size='small'
                        onClick={() => handleEditService(service)}
                        color='warning'
                        title='Edit Service'
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size='small'
                        onClick={() =>
                          handleDeleteService(service.id, service.name)
                        }
                        color='error'
                        title='Delete Service'
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
                    No services found. Create your first service to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Create/Edit Service Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth='sm'
        fullWidth
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            {editingService ? 'Edit Service' : 'Create New Service'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Controller
                name='name'
                control={control}
                rules={{ required: 'Service name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label='Service Name'
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />

              <Controller
                name='description'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label='Description'
                    fullWidth
                    multiline
                    rows={3}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />

              <Controller
                name='iconId'
                control={control}
                render={({ field }) => (
                  <IconPicker
                    selectedIconId={field.value}
                    onSelect={(iconId) => field.onChange(iconId)}
                    filterType='SERVICE'
                    label='Service Icon (Optional)'
                    error={!!errors.iconId}
                    helperText={errors.iconId?.message}
                  />
                )}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type='submit' variant='contained' disabled={isSubmitting}>
              {isSubmitting
                ? editingService
                  ? 'Updating...'
                  : 'Creating...'
                : editingService
                ? 'Update'
                : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default LaundryServices;
