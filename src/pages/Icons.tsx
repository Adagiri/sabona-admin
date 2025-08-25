import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
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
  FormControl,
  FormLabel,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Menu,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Add,
  ArrowBack,
  NavigateNext,
  Delete,
  Edit,
  MoreVert,
  ImageOutlined,
  Search,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { useForm, Controller } from 'react-hook-form';
import ImageUpload from '../components/upload/ImageUpload';
import uploadAndFinalizeImage from '../utils/uploadAndFinalizeImage';
import {
  useUploadAdminMedia,
  useFinalizeAdminMedia,
} from '../hooks/Admin/mutation';

interface Icon {
  id: number;
  name: string;
  description?: string;
  path: string;
  type: 'SERVICE' | 'CATEGORY' | 'GENERAL';
  createdAt: string;
  updatedAt: string;
  _count?: {
    services: number;
    categories: number;
  };
}

interface IconFormData {
  name: string;
  description: string;
  type: 'SERVICE' | 'CATEGORY' | 'GENERAL';
}

// Mock data - replace with actual API calls
const mockIcons: Icon[] = [
  {
    id: 1,
    name: 'Washing Machine',
    description: 'General washing service icon',
    path: '/icons/washing-machine.png',
    type: 'SERVICE',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    _count: { services: 3, categories: 0 },
  },
  {
    id: 2,
    name: 'Shirts Category',
    description: 'Icon for shirt items',
    path: '/icons/shirt.png',
    type: 'CATEGORY',
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-14T09:00:00Z',
    _count: { services: 0, categories: 5 },
  },
];

const Icons: React.FC = () => {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingIcon, setEditingIcon] = useState<Icon | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<
    'ALL' | 'SERVICE' | 'CATEGORY' | 'GENERAL'
  >('ALL');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedIcon, setSelectedIcon] = useState<Icon | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Mock hooks - replace with actual ones
  const icons = mockIcons;
  const { mutateAsync: uploadMedia } = useUploadAdminMedia();
  const { mutateAsync: finalizeMedia } = useFinalizeAdminMedia();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IconFormData>({
    defaultValues: {
      name: '',
      description: '',
      type: 'GENERAL',
    },
  });

  const handleCreateIcon = () => {
    setEditingIcon(null);
    setSelectedFile(null);
    setFilePreview(null);
    reset({ name: '', description: '', type: 'GENERAL' });
    setOpenDialog(true);
  };

  const handleEditIcon = (icon: Icon) => {
    setEditingIcon(icon);
    setSelectedFile(null);
    setFilePreview(icon.path);
    reset({
      name: icon.name,
      description: icon.description || '',
      type: icon.type,
    });
    setOpenDialog(true);
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (max 2MB for icons)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Icon size should be less than 2MB');
        return;
      }

      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    icon: Icon
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedIcon(icon);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedIcon(null);
  };

  const handleDeleteIcon = async () => {
    if (!selectedIcon) return;

    const totalUsage =
      (selectedIcon._count?.services || 0) +
      (selectedIcon._count?.categories || 0);
    if (totalUsage > 0) {
      toast.error(
        `Cannot delete icon. It's being used by ${totalUsage} items.`
      );
      handleMenuClose();
      return;
    }

    if (
      window.confirm(`Are you sure you want to delete "${selectedIcon.name}"?`)
    ) {
      try {
        // TODO: Call delete API
        toast.success('Icon deleted successfully');
        handleMenuClose();
      } catch (error: any) {
        toast.error('Failed to delete icon');
      }
    }
  };

  const onSubmit = async (data: IconFormData) => {
    if (!selectedFile && !editingIcon) {
      toast.error('Please select an icon file');
      return;
    }

    try {
      setIsUploading(true);
      let mediaId;

      // Upload new file if selected
      if (selectedFile) {
        mediaId = await uploadAndFinalizeImage(
          selectedFile,
          uploadMedia,
          finalizeMedia,
          'admin',
          true
        );
      }

      const iconData = {
        ...data,
        ...(mediaId && { mediaId }),
      };

      if (editingIcon) {
        // TODO: Call edit icon API
        toast.success('Icon updated successfully');
      } else {
        // TODO: Call create icon API
        toast.success('Icon created successfully');
      }

      setOpenDialog(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save icon');
    } finally {
      setIsUploading(false);
    }
  };

  const filteredIcons = icons.filter((icon) => {
    const matchesSearch =
      icon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      icon.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || icon.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SERVICE':
        return 'primary';
      case 'CATEGORY':
        return 'secondary';
      case 'GENERAL':
        return 'default';
      default:
        return 'default';
    }
  };

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
        <Typography color='text.primary'>Icon Library</Typography>
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
                Icon Library
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Manage icons for services and categories
              </Typography>
            </Box>
          </Stack>
        </Box>
        <Button
          variant='contained'
          startIcon={<Add />}
          onClick={handleCreateIcon}
        >
          Add Icon
        </Button>
      </Stack>

      {/* Stats */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
        <Stack direction='row' spacing={3}>
          <Typography variant='body2'>
            <strong>Total Icons:</strong> {icons.length}
          </Typography>
          <Typography variant='body2'>
            <strong>Service Icons:</strong>{' '}
            {icons.filter((i) => i.type === 'SERVICE').length}
          </Typography>
          <Typography variant='body2'>
            <strong>Category Icons:</strong>{' '}
            {icons.filter((i) => i.type === 'CATEGORY').length}
          </Typography>
          <Typography variant='body2'>
            <strong>General Icons:</strong>{' '}
            {icons.filter((i) => i.type === 'GENERAL').length}
          </Typography>
        </Stack>
      </Paper>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction='row' spacing={2} alignItems='center'>
          <TextField
            placeholder='Search icons...'
            size='small'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <Search sx={{ mr: 1, color: 'text.secondary' }} />
              ),
            }}
            sx={{ minWidth: 250 }}
          />
          <TextField
            select
            label='Filter by Type'
            size='small'
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value='ALL'>All Types</MenuItem>
            <MenuItem value='SERVICE'>Service Icons</MenuItem>
            <MenuItem value='CATEGORY'>Category Icons</MenuItem>
            <MenuItem value='GENERAL'>General Icons</MenuItem>
          </TextField>
        </Stack>
      </Paper>

      {/* Icons Grid */}
      <Grid container spacing={2}>
        {filteredIcons.length > 0 ? (
          filteredIcons.map((icon) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={icon.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CardMedia
                  sx={{
                    height: 120,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'grey.50',
                  }}
                >
                  <Avatar
                    src={icon.path}
                    sx={{ width: 64, height: 64 }}
                    variant='rounded'
                  >
                    <ImageOutlined />
                  </Avatar>
                </CardMedia>
                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  <Stack
                    direction='row'
                    justifyContent='space-between'
                    alignItems='flex-start'
                  >
                    <Box sx={{ flexGrow: 1, mr: 1 }}>
                      <Typography variant='subtitle1' fontWeight='bold' noWrap>
                        {icon.name}
                      </Typography>
                      <Typography variant='body2' color='text.secondary' noWrap>
                        {icon.description || 'No description'}
                      </Typography>
                    </Box>
                    <IconButton
                      size='small'
                      onClick={(e) => handleMenuClick(e, icon)}
                    >
                      <MoreVert fontSize='small' />
                    </IconButton>
                  </Stack>

                  <Stack
                    direction='row'
                    justifyContent='space-between'
                    alignItems='center'
                    mt={1}
                  >
                    <Chip
                      label={icon.type}
                      size='small'
                      color={getTypeColor(icon.type) as any}
                      variant='outlined'
                    />
                    <Typography variant='caption' color='text.secondary'>
                      Used:{' '}
                      {(icon._count?.services || 0) +
                        (icon._count?.categories || 0)}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <ImageOutlined
                sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }}
              />
              <Typography variant='h6' color='text.secondary' gutterBottom>
                No Icons Found
              </Typography>
              <Typography variant='body2' color='text.secondary' mb={3}>
                {searchTerm
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Create your first icon to get started.'}
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            handleEditIcon(selectedIcon!);
            handleMenuClose();
          }}
        >
          <Edit fontSize='small' sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem
          onClick={handleDeleteIcon}
          disabled={
            (selectedIcon?._count?.services || 0) +
              (selectedIcon?._count?.categories || 0) >
            0
          }
        >
          <Delete fontSize='small' sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Create/Edit Icon Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth='sm'
        fullWidth
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            {editingIcon ? 'Edit Icon' : 'Create New Icon'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Controller
                name='name'
                control={control}
                rules={{ required: 'Icon name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label='Icon Name'
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    placeholder='e.g., Washing Machine, Shirt Category'
                  />
                )}
              />

              <Controller
                name='description'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label='Description (Optional)'
                    fullWidth
                    multiline
                    rows={2}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    placeholder='Brief description of when to use this icon'
                  />
                )}
              />

              <Controller
                name='type'
                control={control}
                rules={{ required: 'Icon type is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label='Icon Type'
                    fullWidth
                    error={!!errors.type}
                    helperText={errors.type?.message}
                  >
                    <MenuItem value='SERVICE'>Service Icon</MenuItem>
                    <MenuItem value='CATEGORY'>Category Icon</MenuItem>
                    <MenuItem value='GENERAL'>General Purpose</MenuItem>
                  </TextField>
                )}
              />

              <FormControl>
                <FormLabel component='legend'>Icon Image</FormLabel>
                <Box sx={{ mt: 1 }}>
                  <Stack direction='row' spacing={2} alignItems='center'>
                    {filePreview && (
                      <Avatar
                        src={filePreview}
                        sx={{ width: 80, height: 80 }}
                        variant='rounded'
                      />
                    )}
                    <ImageUpload
                      selectedImage={!!selectedFile || !!filePreview}
                      handleImageClick={handleFileClick}
                      fileInputRef={(el) => (fileInputRef.current = el)}
                      handleImageChange={handleFileChange}
                      isLoading={isUploading}
                    />
                  </Stack>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{ mt: 1, display: 'block' }}
                  >
                    Recommended: Square icon (64x64 or larger), max 2MB (PNG,
                    SVG preferred)
                  </Typography>
                </Box>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type='submit' variant='contained' disabled={isUploading}>
              {editingIcon ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Icons;
