// File: src/pages/LaundryServiceCategories.tsx

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Breadcrumbs,
  Link,
  CircularProgress,
  Alert,
  Avatar,
  Stack,
} from '@mui/material';
import { NavigateNext, Category as CategoryIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useFetchLaundryById,
  useFetchLaundryServices,
  useFetchCategories,
} from '../hooks/Admin/laundryHooks';

interface Category {
  id: string;
  name: string;
  nameLocale: {
    en: string;
    ar: string;
  };
  icon?: {
    id: number;
    name: string;
    media: {
      path: string;
    };
  };
  _count?: {
    laundryServiceItems: number;
  };
}

const LaundryServiceCategories: React.FC = () => {
  const { laundryId, serviceId } = useParams<{
    laundryId: string;
    serviceId: string;
  }>();
  const navigate = useNavigate();

  const { data: laundry } = useFetchLaundryById(laundryId!);
  const { data: serviceData } = useFetchLaundryServices(laundryId!);
  const { data: categoriesData, isLoading, error } = useFetchCategories();

  const service = serviceData?.data?.find((s: any) => s.id === serviceId);
  const categories = categoriesData?.data || [];

  if (isLoading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity='error'>Failed to load categories</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Breadcrumbs */}
        <Breadcrumbs separator={<NavigateNext fontSize='small' />}>
          <Link
            color='inherit'
            href='/laundry'
            onClick={(e) => {
              e.preventDefault();
              navigate('/laundry');
            }}
            sx={{ cursor: 'pointer' }}
          >
            Laundries
          </Link>
          <Link
            color='inherit'
            onClick={(e) => {
              e.preventDefault();
              navigate(`/laundry/${laundryId}/services`);
            }}
            sx={{ cursor: 'pointer' }}
          >
            {laundry?.data?.nameLocale?.en || 'Laundry'}
          </Link>
          <Typography color='text.primary'>
            {service?.nameLocale?.en || 'Service'} - Categories
          </Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box>
          <Typography variant='h4' gutterBottom>
            Select Category
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Choose a category to manage items for {service?.nameLocale?.en || 'this service'}
          </Typography>
        </Box>

        {/* Categories Grid */}
        <Grid container spacing={3}>
          {categories.length === 0 ? (
            <Grid item xs={12}>
              <Alert severity='info'>
                No categories available. Please create categories first.
              </Alert>
            </Grid>
          ) : (
            categories.map((category: Category) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={category.id}>
                <Card
                  sx={{
                    height: '100%',
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'translateY(-4px)',
                      transition: 'all 0.3s ease',
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() =>
                      navigate(
                        `/laundry/${laundryId}/service/${serviceId}/category/${category.id}/items`
                      )
                    }
                    sx={{ height: '100%' }}
                  >
                    <CardContent>
                      <Stack spacing={2} alignItems='center'>
                        {category.icon?.media?.path ? (
                          <Avatar
                            src={category.icon.media.path}
                            alt={category.nameLocale.en}
                            sx={{ width: 64, height: 64 }}
                          />
                        ) : (
                          <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
                            <CategoryIcon fontSize='large' />
                          </Avatar>
                        )}
                        <Typography variant='h6' align='center'>
                          {category.nameLocale.en}
                        </Typography>
                        {category.nameLocale.ar && (
                          <Typography variant='body2' align='center' color='text.secondary'>
                            {category.nameLocale.ar}
                          </Typography>
                        )}
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Stack>
    </Box>
  );
};

export default LaundryServiceCategories;
