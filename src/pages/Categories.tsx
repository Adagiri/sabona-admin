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
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  NavigateNext,
  Category,
  ImageOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { useForm, Controller } from 'react-hook-form';
import { useFetchCategories } from '../hooks/Admin/query';
import {
  useCreateCategory,
  useDeleteCategory,
  useEditCategory,
} from '../hooks/Admin/mutation';
import IconPicker from '../components/IconPicker';
import TranslationFields from '../components/TranslationFields';

interface CategoryData {
  id: string;
  nameLocale: {
    en: string;
    ar: string;
  };
  iconId?: number;
  icon?: {
    id: number;
    path: string;
    name: string;
    media: {
      path: string;
    };
  };
  createdAt: string;
  updatedAt: string;
  _count?: {
    laundryServiceItem: number;
  };
}

interface CategoryFormData {
  nameLocale: {
    en: string;
    ar: string;
  };
  descriptionLocale?: {
    en: string;
    ar: string;
  };
  iconId?: number;
}

const Categories: React.FC = () => {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: categories, isLoading, error, refetch } = useFetchCategories();
  const { mutateAsync: createCategory } = useCreateCategory();
  const { mutateAsync: editCategory } = useEditCategory();
  const { mutateAsync: deleteCategory } = useDeleteCategory();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    defaultValues: {
      nameLocale: { en: '', ar: '' },
      descriptionLocale: { en: '', ar: '' },
      iconId: undefined,
    },
  });

  const handleCreateCategory = () => {
    setEditingCategory(null);
    reset({
      nameLocale: { en: '', ar: '' },
      descriptionLocale: { en: '', ar: '' },
      iconId: undefined,
    });
    setOpenDialog(true);
  };

  const handleEditCategory = (category: CategoryData) => {
    setEditingCategory(category);
    reset({
      nameLocale: {
        en: category.nameLocale?.en,
        ar: category.nameLocale?.ar,
      },

      iconId: category.iconId,
    });
    setOpenDialog(true);
  };

  const handleDeleteCategory = async (
    categoryId: string,
    categoryName: string
  ) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${categoryName}"? This action cannot be undone.`
      )
    ) {
      try {
        await deleteCategory(categoryId);
        toast.success('Category deleted successfully');
        refetch();
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || 'Failed to delete category'
        );
      }
    }
  };
  const onSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await editCategory({
          categoryId: editingCategory.id,
          data,
        });
        toast.success('Category updated successfully');
      } else {
        await createCategory(data);
        toast.success('Category created successfully');
      }

      setOpenDialog(false);
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
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
        <Typography>Loading categories...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity='error'>
          Failed to load categories:{' '}
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
        <Typography color='text.primary'>Categories</Typography>
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
                Item Categories
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Manage categories for laundry service items
              </Typography>
            </Box>
          </Stack>
        </Box>
        <Button
          variant='contained'
          startIcon={<Add />}
          onClick={handleCreateCategory}
        >
          Add Category
        </Button>
      </Stack>

      {/* Stats */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
        <Stack direction='row' spacing={3}>
          <Stack direction='row' alignItems='center' spacing={1}>
            <Category color='primary' />
            <Typography variant='body2'>
              <strong>Total Categories:</strong> {categories?.data?.length || 0}
            </Typography>
          </Stack>
        </Stack>
      </Paper>

      {/* Categories Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Icon</strong>
              </TableCell>
              <TableCell>
                <strong>Category Name</strong>
              </TableCell>
              <TableCell>
                <strong>Items Count</strong>
              </TableCell>
              <TableCell>
                <strong>Created</strong>
              </TableCell>
              <TableCell>
                <strong>Last Updated</strong>
              </TableCell>
              <TableCell>
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories?.data?.length > 0 ? (
              categories.data.map((category: CategoryData) => (
                <TableRow key={category.id} hover>
                  <TableCell>
                    <Avatar
                      src={category.icon?.media.path}
                      sx={{ width: 40, height: 40 }}
                      variant='rounded'
                    >
                      <ImageOutlined />
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Typography variant='body1' fontWeight='bold'>
                      {category.nameLocale.en}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2'>
                      {category._count?.laundryServiceItem || 0} items
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {new Date(category.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(category.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Stack direction='row' spacing={1}>
                      <IconButton
                        size='small'
                        onClick={() => handleEditCategory(category)}
                        color='warning'
                        title='Edit Category'
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size='small'
                        onClick={() =>
                          handleDeleteCategory(category.id, category.nameLocale.en)
                        }
                        color='error'
                        title='Delete Category'
                        disabled={
                          category._count?.laundryServiceItem &&
                          category._count.laundryServiceItem > 0
                            ? true
                            : false
                        }
                      >
                        <Delete />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align='center'>
                  <Typography variant='body1' color='text.secondary' py={4}>
                    No categories found. Create your first category to get
                    started.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Create/Edit Category Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth='sm'
        fullWidth
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            {editingCategory ? 'Edit Category' : 'Create New Category'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TranslationFields
                control={control}
                fieldName='nameLocale'
                label='Category Name'
                errors={errors}
                required={true}
              />

              <Controller
                name='iconId'
                control={control}
                render={({ field }) => (
                  <IconPicker
                    selectedIconId={field.value}
                    onSelect={(iconId) => field.onChange(iconId)}
                    filterType='CATEGORY'
                    label='Category Icon (Optional)'
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
                ? editingCategory
                  ? 'Updating...'
                  : 'Creating...'
                : editingCategory
                ? 'Update'
                : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Categories;
