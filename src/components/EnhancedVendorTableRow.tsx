// File: src/components/EnhancedVendorTableRow.tsx

import React, { useState } from 'react';
import {
  TableRow,
  TableCell,
  IconButton,
  Avatar,
  Typography,
  Chip,
  Stack,
  Button,
  Collapse,
  Box,
  Table,
  TableHead,
  TableBody,
  Divider,
} from '@mui/material';
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  LocalLaundryService,
  Visibility,
  Edit,
  Settings,
  LocationOn,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFetchAllLaundries } from '../hooks/Admin/query';

interface Vendor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
  profileImage?: {
    url: string;
  };
}

interface Laundry {
  id: string;
  name: string;
  address?: string;
  lat: number;
  long: number;
  vendorId: string;
  _count?: {
    laundryService: number;
  };
}

interface EnhancedVendorTableRowProps {
  vendor: Vendor;
  handleImageClick: (vendorId: string) => () => void;
  handleImageChange: (
    vendorId: string
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRefs: React.MutableRefObject<
    Record<string | number, HTMLInputElement>
  >;
}

const EnhancedVendorTableRow: React.FC<EnhancedVendorTableRowProps> = ({
  vendor,
  handleImageClick,
  handleImageChange,
  fileInputRefs,
}) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { data: allLaundries } = useFetchAllLaundries();

  // Filter laundries for this vendor
  const vendorLaundries =
    allLaundries?.data?.filter(
      (laundry: Laundry) => laundry.vendorId === vendor.id
    ) || [];

  const handleViewDetails = () => {
    navigate(`/user-details/${vendor.id}`);
  };

  const handleViewLaundryServices = (laundryId: string) => {
    navigate(`/laundry/${laundryId}/services`);
  };

  const handleEditLaundry = (laundryId: string) => {
    navigate(`/laundry/${laundryId}/edit`);
  };

  const handleViewOnMap = (lat: number, lng: number) => {
    window.open(`https://maps.google.com/?q=${lat},${lng}`, '_blank');
  };

  return (
    <>
      <TableRow hover>
        <TableCell>
          <IconButton
            aria-label='expand row'
            size='small'
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Stack direction='row' alignItems='center' spacing={2}>
            <Avatar
              src={vendor.profileImage?.url}
              onClick={handleImageClick(vendor.id)}
              sx={{ cursor: 'pointer', width: 40, height: 40 }}
            >
              {vendor?.firstName?.charAt(0) || vendor.phone[length - 1]}
            </Avatar>
            <Box>
              <Typography variant='body1' fontWeight='bold'>
                {vendor.firstName} {vendor.lastName}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {vendor.email}
              </Typography>
            </Box>
          </Stack>
          <input
            type='file'
            accept='image/*'
            ref={(el) => {
              if (el) fileInputRefs.current[vendor.id] = el;
            }}
            style={{ display: 'none' }}
            onChange={handleImageChange(vendor.id)}
          />
        </TableCell>
        <TableCell>{vendor.phone || 'N/A'}</TableCell>
        <TableCell>
          <Chip
            label={vendor.status}
            color={vendor.status === 'ACTIVE' ? 'success' : 'error'}
            size='small'
          />
        </TableCell>
        <TableCell>
          <Stack direction='row' alignItems='center' spacing={1}>
            <LocalLaundryService fontSize='small' color='primary' />
            <Chip
              label={`${vendorLaundries.length} laundries`}
              color={vendorLaundries.length > 0 ? 'primary' : 'default'}
              size='small'
            />
          </Stack>
        </TableCell>
        <TableCell>{new Date(vendor.createdAt).toLocaleDateString()}</TableCell>
        <TableCell>
          <Stack direction='row' spacing={1}>
            <IconButton
              size='small'
              onClick={handleViewDetails}
              color='primary'
              title='View Details'
            >
              <Visibility />
            </IconButton>
          </Stack>
        </TableCell>
      </TableRow>

      {/* Expanded Row - Laundries */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout='auto' unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography
                variant='h6'
                gutterBottom
                component='div'
                color='primary'
              >
                Vendor Laundries ({vendorLaundries.length})
              </Typography>

              {vendorLaundries.length > 0 ? (
                <Table size='small' aria-label='laundries'>
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
                        <strong>Actions</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {vendorLaundries.map((laundry: Laundry) => (
                      <TableRow key={laundry.id}>
                        <TableCell>
                          <Typography variant='body2' fontWeight='bold'>
                            {laundry.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2'>
                            {laundry.address || 'No address'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${
                              laundry._count?.laundryService || 0
                            } services`}
                            size='small'
                            color={
                              laundry._count?.laundryService
                                ? 'success'
                                : 'default'
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction='row' spacing={1}>
                            <IconButton
                              size='small'
                              onClick={() =>
                                handleViewLaundryServices(laundry.id)
                              }
                              color='primary'
                              title='View Services'
                            >
                              <Settings />
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
                                handleViewOnMap(laundry.lat, laundry.long)
                              }
                              color='info'
                              title='View on Map'
                            >
                              <LocationOn />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ p: 2 }}
                >
                  No laundries registered for this vendor.
                </Typography>
              )}

              <Divider sx={{ my: 2 }} />
              <Stack direction='row' spacing={2}>
                <Button
                  size='small'
                  variant='outlined'
                  onClick={handleViewDetails}
                >
                  View Vendor Details
                </Button>
                <Button
                  size='small'
                  variant='text'
                  onClick={() => navigate('/laundry')}
                >
                  Go to Laundry Management
                </Button>
              </Stack>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export default EnhancedVendorTableRow;
