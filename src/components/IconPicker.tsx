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
} from '@mui/material';
import { ImageOutlined, Search } from '@mui/icons-material';

interface Icon {
  id: number;
  name: string;
  description?: string;
  path: string;
  type: 'SERVICE' | 'CATEGORY' | 'GENERAL';
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

// Mock icons - replace with actual API call
const mockIcons: Icon[] = [
  {
    id: 1,
    name: 'Washing Machine',
    description: 'General washing service',
    path: '/icons/washing-machine.png',
    type: 'SERVICE',
  },
  {
    id: 2,
    name: 'Dry Cleaning',
    description: 'Professional dry cleaning',
    path: '/icons/dry-cleaning.png',
    type: 'SERVICE',
  },
  {
    id: 3,
    name: 'Shirts',
    description: 'Shirt category',
    path: '/icons/shirt.png',
    type: 'CATEGORY',
  },
  {
    id: 4,
    name: 'Pants',
    description: 'Pants and trousers',
    path: '/icons/pants.png',
    type: 'CATEGORY',
  },
  {
    id: 5,
    name: 'Bedding',
    description: 'Bed sheets and covers',
    path: '/icons/bedding.png',
    type: 'CATEGORY',
  },
  {
    id: 6,
    name: 'Express Service',
    description: 'Fast delivery service',
    path: '/icons/express.png',
    type: 'SERVICE',
  },
];

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

  // Get selected icon details
  const selectedIcon = mockIcons.find((icon) => icon.id === selectedIconId);

  // Filter icons based on search and type
  const filteredIcons = mockIcons.filter((icon) => {
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
              bgcolor: 'grey.50',
            },
          }}
          onClick={handleOpen}
        >
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            {selectedIcon ? (
              <Stack direction='row' alignItems='center' spacing={2}>
                <Avatar
                  src={selectedIcon.path}
                  sx={{ width: 40, height: 40 }}
                  variant='rounded'
                >
                  <ImageOutlined />
                </Avatar>
                <Box>
                  <Typography variant='body1' fontWeight='bold'>
                    {selectedIcon.name}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {selectedIcon.description}
                  </Typography>
                </Box>
              </Stack>
            ) : (
              <Stack direction='row' alignItems='center' spacing={2}>
                <Avatar
                  sx={{ width: 40, height: 40, bgcolor: 'grey.200' }}
                  variant='rounded'
                >
                  <ImageOutlined />
                </Avatar>
                <Typography variant='body2' color='text.secondary'>
                  Click to select an icon
                </Typography>
              </Stack>
            )}
          </CardContent>
        </Card>

        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>

      {/* Icon Selection Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth>
        <DialogTitle>Select Icon</DialogTitle>
        <DialogContent>
          {/* Search and Filter */}
          <Stack direction='row' spacing={2} sx={{ mb: 3 }}>
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
            </TextField>
          </Stack>

          {/* Icons Grid */}
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            {filteredIcons.length > 0 ? (
              <Grid container spacing={2}>
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
                          transform: 'scale(1.02)',
                        },
                        transition: 'all 0.2s',
                      }}
                      onClick={() => setLocalSelectedId(icon.id)}
                    >
                      <CardContent
                        sx={{
                          textAlign: 'center',
                          p: 2,
                          '&:last-child': { pb: 2 },
                        }}
                      >
                        <Avatar
                          src={icon.path}
                          sx={{
                            width: 48,
                            height: 48,
                            mx: 'auto',
                            mb: 1,
                            bgcolor:
                              localSelectedId === icon.id
                                ? 'primary.light'
                                : 'grey.200',
                          }}
                          variant='rounded'
                        >
                          <ImageOutlined />
                        </Avatar>
                        <Typography variant='body2' fontWeight='bold' noWrap>
                          {icon.name}
                        </Typography>
                        <Typography
                          variant='caption'
                          color='text.secondary'
                          noWrap
                        >
                          {icon.type}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <ImageOutlined
                  sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }}
                />
                <Typography variant='body1' color='text.secondary'>
                  No icons found matching your criteria
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Try adjusting your search or filter
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          {selectedIconId && (
            <Button onClick={handleClear} color='warning'>
              Clear Selection
            </Button>
          )}
          <Button
            onClick={handleSelect}
            variant='contained'
            disabled={!localSelectedId}
          >
            Select Icon
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IconPicker;
