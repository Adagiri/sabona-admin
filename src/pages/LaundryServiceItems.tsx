// File: src/pages/LaundryServiceItems.tsx

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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  ArrowBack,
  NavigateNext,
  AttachMoney,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { useForm, Controller } from 'react-hook-form';
import {
  useFetchLaundryById,
  useFetchLaundryServiceItems,
  useFetchCategories,
} from '../hooks/Admin/query';
import { useCreateLaundryServiceItem, useDeleteLaundryServiceItem, useEditLaundryServiceItem } from '../hooks/Admin/mutation';

interface ServiceItem {
  id: string;
  name: string;
  price: number;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
}

interface ItemFormData {
  name: string;
  price: number;
  categoryId: string;
}

const LaundryServiceItems: React.FC = () => {
  const { laundryId, serviceId } = useParams<{
    laundryId: string;
    serviceId: string;
  }>();
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceItem | null>(null);

  const { data: laundry } = useFetchLaundryById(laundryId!);
  const {
    data: items,
    isLoading,
    error,
    refetch,
  } = useFetchLaundryServiceItems(laundryId!, serviceId!);
  const { data: categories } = useFetchCategories();
  const { mutateAsync: createItem } = useCreateLaundryServiceItem();
  const { mutateAsync: editItem } = useEditLaundryServiceItem();
  const { mutateAsync: deleteItem } = useDeleteLaundryServiceItem();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ItemFormData>({
    defaultValues: {
      name: '',
      price: 0,
      categoryId: '',
    },
  });

  const handleCreateItem = () => {
    setEditingItem(null);
    reset({ name: '', price: 0, categoryId: '' });
    setOpenDialog(true);
  };

  const handleEditItem = (item: ServiceItem) => {
    setEditingItem(item);
    reset({
      name: item.name,
      price: item.price,
      categoryId: item.categoryId || '',
    });
    setOpenDialog(true);
  };

  const handleDeleteItem = async (itemId: string, itemName: string) => {
    if (window.confirm(`Are you sure you want to delete "${itemName}"?`)) {
      try {
        await deleteItem({
          laundryId: laundryId!,
          serviceId: serviceId!,
          itemId,
        });
        toast.success('Item deleted successfully');
        refetch();
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Failed to delete item');
      }
    }
  };

  const onSubmit = async (data: ItemFormData) => {
    try {
      const payload = {
        items: [
          {
            name: data.name,
            price: Number(data.price),
            categoryId: data.categoryId || undefined,
          },
        ],
      };

      if (editingItem) {
        await editItem({
          laundryId: laundryId!,
          serviceId: serviceId!,
          itemId: editingItem.id,
          data: payload.items[0],
        });
        toast.success('Item updated successfully');
      } else {
        await createItem({
          laundryId: laundryId!,
          serviceId: serviceId!,
          data: payload,
        });
        toast.success('Item created successfully');
      }
      setOpenDialog(false);
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save item');
    }
  };

  if (isLoading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='60vh'
      >
        <Typography>Loading items...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity='error'>
          Failed to load items:{' '}
          {(error as any)?.response?.data?.message || 'Unknown error'}
        </Alert>
      </Box>
    );
  }

  const serviceName = items?.serviceName || 'Service';

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
        <Link
          component='button'
          variant='body1'
          onClick={() => navigate(`/laundry/${laundryId}/services`)}
          sx={{ textDecoration: 'none' }}
        >
          {laundry?.data?.name}
        </Link>
        <Typography color='text.primary'>{serviceName} - Items</Typography>
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
            <IconButton
              onClick={() => navigate(`/laundry/${laundryId}/services`)}
            >
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant='h4' fontWeight='bold'>
                {serviceName} - Items
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Manage items for this service
              </Typography>
            </Box>
          </Stack>
        </Box>
        <Button
          variant='contained'
          startIcon={<Add />}
          onClick={handleCreateItem}
        >
          Add Item
        </Button>
      </Stack>

      {/* Service Info */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
        <Stack direction='row' spacing={3}>
          <Typography variant='body2'>
            <strong>Laundry:</strong> {laundry?.data?.name}
          </Typography>
          <Typography variant='body2'>
            <strong>Service:</strong> {serviceName}
          </Typography>
          <Typography variant='body2'>
            <strong>Total Items:</strong> {items?.data?.length || 0}
          </Typography>
        </Stack>
      </Paper>

      {/* Items Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Item Name</strong>
              </TableCell>
              <TableCell>
                <strong>Category</strong>
              </TableCell>
              <TableCell>
                <strong>Price</strong>
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
            {items?.data?.length > 0 ? (
              items.data.map((item: ServiceItem) => (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Typography variant='body1' fontWeight='bold'>
                      {item.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {item.category ? (
                      <Chip
                        label={item.category.name}
                        size='small'
                        color='primary'
                      />
                    ) : (
                      <Chip label='No category' size='small' color='default' />
                    )}
                  </TableCell>
                  <TableCell>
                    <Stack direction='row' alignItems='center' spacing={1}>
                      <AttachMoney fontSize='small' />
                      <Typography variant='body1' fontWeight='bold'>
                        {item.price.toFixed(2)}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Stack direction='row' spacing={1}>
                      <IconButton
                        size='small'
                        onClick={() => handleEditItem(item)}
                        color='warning'
                        title='Edit Item'
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size='small'
                        onClick={() => handleDeleteItem(item.id, item.name)}
                        color='error'
                        title='Delete Item'
                      >
                        <Delete />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align='center'>
                  <Typography variant='body1' color='text.secondary' py={4}>
                    No items found. Create your first item to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Create/Edit Item Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth='sm'
        fullWidth
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            {editingItem ? 'Edit Item' : 'Create New Item'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Controller
                name='name'
                control={control}
                rules={{ required: 'Item name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label='Item Name'
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />

              <Controller
                name='price'
                control={control}
                rules={{
                  required: 'Price is required',
                  min: { value: 0.01, message: 'Price must be greater than 0' },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label='Price'
                    type='number'
                    fullWidth
                    inputProps={{ step: '0.01', min: '0.01' }}
                    error={!!errors.price}
                    helperText={errors.price?.message}
                  />
                )}
              />

              <Controller
                name='categoryId'
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.categoryId}>
                    <InputLabel>Category (Optional)</InputLabel>
                    <Select {...field} label='Category (Optional)'>
                      <MenuItem value=''>
                        <em>No category</em>
                      </MenuItem>
                      {categories?.data?.map((category: Category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.categoryId && (
                      <FormHelperText>
                        {errors.categoryId.message}
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type='submit' variant='contained'>
              {editingItem ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default LaundryServiceItems;
