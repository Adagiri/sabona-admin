import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  CircularProgress,
  FormHelperText,
  Chip,
  Box,
  Typography,
} from '@mui/material';
import { Warning } from '@mui/icons-material';
import { useSearchMainVendors } from '../hooks/Admin/query';

interface MainVendorSearchProps {
  onVendorSelect: (vendor: any) => void;
  selectedVendor: any;
  error?: string;
  required?: boolean;
}

const MainVendorSearch: React.FC<MainVendorSearchProps> = ({
  onVendorSelect,
  selectedVendor,
  error,
  required = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    data: vendors,
    isLoading,
    isFetching,
  } = useSearchMainVendors({
    query: debouncedSearchTerm,
    limit: 50,
    enabled: debouncedSearchTerm.length >= 3,
  });

  const getNoOptionsText = () => {
    if (debouncedSearchTerm.length < 3) {
      return 'Type at least 3 characters to search vendors';
    }
    if (isLoading || isFetching) {
      return 'Searching...';
    }
    if (vendors?.length === 0) {
      return 'No main vendors found';
    }
    return 'No options';
  };

  const getHelperText = () => {
    if (vendors?.length === 50) {
      return '⚠️ Showing first 50 results. Be more specific to narrow down results.';
    }
    if (vendors?.length > 0) {
      return `Found ${vendors.length} vendor${vendors.length === 1 ? '' : 's'}`;
    }
    return 'Search existing main vendors to link this vendor as a branch';
  };

  return (
    <Box>
      <Autocomplete
        options={vendors || []}
        getOptionLabel={(option) =>
          `${option.laundryName} (${option.phone}) - ${option.branchCount} branches`
        }
        value={selectedVendor}
        onChange={(_, newValue) => onVendorSelect(newValue)}
        onInputChange={(_, newInputValue) => setSearchTerm(newInputValue)}
        loading={isLoading || isFetching}
        loadingText='Searching vendors...'
        noOptionsText={getNoOptionsText()}
        filterOptions={(x) => x} // Disable client-side filtering since we do server-side
        renderInput={(params) => (
          <TextField
            {...params}
            label={`Main Vendor ${required ? '*' : '(Optional)'}`}
            placeholder='Type laundry name to search...'
            fullWidth
            margin='normal'
            required={required}
            error={!!error}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {isLoading || isFetching ? (
                    <CircularProgress color='inherit' size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderOption={(props, option) => (
          <Box component='li' {...props}>
            <Box sx={{ width: '100%' }}>
              <Box
                display='flex'
                justifyContent='space-between'
                alignItems='center'
              >
                <Typography variant='body1' fontWeight='bold'>
                  {option.laundryName}
                </Typography>
                <Chip
                  label={`${option.branchCount} branches`}
                  size='small'
                  color='primary'
                  variant='outlined'
                />
              </Box>
              <Typography variant='body2' color='text.secondary'>
                📞 {option.phone} • Created:{' '}
                {new Date(option.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        )}
      />

      {/* Helper text with warning for too many results */}
      <FormHelperText
        sx={{
          color: vendors?.length === 50 ? 'warning.main' : 'text.secondary',
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        {vendors?.length === 50 && <Warning fontSize='small' />}
        {getHelperText()}
      </FormHelperText>

      {error && (
        <FormHelperText error sx={{ mx: 2 }}>
          {error}
        </FormHelperText>
      )}
    </Box>
  );
};

export default MainVendorSearch;
