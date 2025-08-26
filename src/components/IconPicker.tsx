import React, { useState } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Avatar,
  Typography,
  TextField,
  MenuItem,
  Stack,
  Card,
  CardContent,
  FormControl,
  FormLabel,
  FormHelperText,
  CircularProgress,
  Alert,
} from '@mui/material';
import { ImageOutlined, Search } from '@mui/icons-material';
import { useFetchIcons } from '../hooks/Admin/query';

interface Icon {
  id: number;
  name: string;
  description?: string;
  path: string;
  type: 'SERVICE' | 'CATEGORY' | 'GENERAL';
  media: {
    path: string
  }
}

interface IconPickerProps {
  selectedIconId?: number;
  onSelect: (iconId: number | null) => void;
  filterType?: 'SERVICE' | 'CATEGORY' | 'ALL';
  label?: string;
  error?: boolean;
  helperText?: string;
  required?: boolean;
}

const IconPicker: React.FC<IconPickerProps> = ({
  selectedIconId,
  onSelect,
  filterType = 'ALL',
  label = 'Select Icon',
  error = false,
  helperText,
  required = false,
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'SERVICE' | 'CATEGORY' | 'ALL'>(
    filterType
  );
  const [localSelectedId, setLocalSelectedId] = useState<number | null>(
    selectedIconId || null
  );

  // Use real API data instead of mock data
  const { data: iconsData, isLoading, error: fetchError } = useFetchIcons();

  // Get icons from API response
  const allIcons: Icon[] = iconsData?.data || [];

  // Get selected icon details
  const selectedIcon = allIcons.find((icon) => icon.id === selectedIconId);

  // Filter icons based on search and type
  const filteredIcons = allIcons.filter((icon) => {
    const matchesSearch =
      icon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      icon.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'ALL' || icon.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleOpen = () => {
    setOpen(true);
    setLocalSelectedId(selectedIconId || null);
    setSearchTerm('');
    setTypeFilter(filterType);
  };

  const handleClose = () => {
    setOpen(false);
    setLocalSelectedId(selectedIconId || null);
  };

  const handleSelect = () => {
    onSelect(localSelectedId);
    setOpen(false);
  };

  const handleClear = () => {
    setLocalSelectedId(null);
    onSelect(null);
    setOpen(false);
  };

  return (
    <Box>
      <FormControl fullWidth error={error}>
        <FormLabel component='legend'>
          {label} {required && '*'}
        </FormLabel>

        <Card
          sx={{
            mt: 1,
            cursor: 'pointer',
            border: error ? '2px solid' : '1px solid',
            borderColor: error ? 'error.main' : 'grey.300',
            '&:hover': {
              borderColor: error ? 'error.main' : 'primary.main',
            },
          }}
          onClick={handleOpen}
        >
          <CardContent sx={{ p: 2 }}>
            {selectedIcon ? (
              <Stack direction='row' alignItems='center' spacing={2}>
                <Avatar
                  src={selectedIcon.media.path}
                  sx={{ width: 40, height: 40 }}
                  variant='rounded'
                >
                  <ImageOutlined />
                </Avatar>
                <Box>
                  <Typography variant='body2' fontWeight='medium'>
                    {selectedIcon.name}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {selectedIcon.type} • Click to change
                  </Typography>
                </Box>
              </Stack>
            ) : (
              <Stack direction='row' alignItems='center' spacing={2}>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: 'grey.100',
                    color: 'grey.400',
                  }}
                  variant='rounded'
                >
                  <ImageOutlined />
                </Avatar>
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    No icon selected
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    Click to select an icon
                  </Typography>
                </Box>
              </Stack>
            )}
          </CardContent>
        </Card>

        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>

      {/* Icon Selection Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth='md'
        fullWidth
        PaperProps={{
          sx: { height: '80vh' },
        }}
      >
        <DialogTitle>
          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='center'
          >
            <Typography variant='h6'>
              Select Icon
              {typeFilter !== 'ALL' && ` (${typeFilter})`}
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent>
          {/* Search and Filter */}
          <Stack direction='row' spacing={2} sx={{ mb: 2 }}>
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
              sx={{ flexGrow: 1 }}
            />

            {filterType === 'ALL' && (
              <TextField
                select
                label='Type'
                size='small'
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                sx={{ minWidth: 120 }}
              >
                <MenuItem value='ALL'>All</MenuItem>
                <MenuItem value='SERVICE'>Service</MenuItem>
                <MenuItem value='CATEGORY'>Category</MenuItem>
                <MenuItem value='GENERAL'>General</MenuItem>
              </TextField>
            )}
          </Stack>

          {/* Loading State */}
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Error State */}
          {fetchError && (
            <Alert severity='error' sx={{ mb: 2 }}>
              Failed to load icons. Please try again.
            </Alert>
          )}

          {/* Icons Grid */}
          {!isLoading && !fetchError && (
            <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
              {filteredIcons.length > 0 ? (
                <Grid container spacing={1}>
                  {filteredIcons.map((icon) => (
                    <Grid item xs={6} sm={4} md={3} key={icon.id}>
                      <Card
                        sx={{
                          cursor: 'pointer',
                          border:
                            localSelectedId === icon.id
                              ? '2px solid'
                              : '1px solid',
                          borderColor:
                            localSelectedId === icon.id
                              ? 'primary.main'
                              : 'grey.300',
                          '&:hover': {
                            borderColor: 'primary.main',
                            boxShadow: 1,
                          },
                        }}
                        onClick={() => setLocalSelectedId(icon.id)}
                      >
                        <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                          <Avatar
                            src={icon.media.path}
                            sx={{
                              width: 48,
                              height: 48,
                              mx: 'auto',
                              mb: 1,
                            }}
                            variant='rounded'
                          >
                            <ImageOutlined />
                          </Avatar>
                          <Typography
                            variant='caption'
                            sx={{
                              fontSize: '0.75rem',
                              lineHeight: 1.2,
                              display: 'block',
                            }}
                          >
                            {icon.name}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <ImageOutlined
                    sx={{ fontSize: 48, color: 'grey.400', mb: 1 }}
                  />
                  <Typography variant='body2' color='text.secondary'>
                    {allIcons.length === 0
                      ? 'No icons available'
                      : 'No icons found matching your criteria'}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClear} color='error'>
            Clear Selection
          </Button>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSelect}
            variant='contained'
            disabled={localSelectedId === null}
          >
            Select Icon
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IconPicker;
