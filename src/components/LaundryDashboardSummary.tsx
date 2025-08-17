import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Stack,
  Chip,
  LinearProgress,
  Card,
  CardContent,
  CardActions,
  Divider,
} from '@mui/material';
import {
  LocalLaundryService,
  Business,
  Category,
  Settings,
  TrendingUp,
  Add,
  ManageAccounts,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  useFetchAllLaundries,
  useFetchCategories,
  useFetchAllUsers,
} from '../hooks/Admin/query';
import { USER_TYPES } from '../hooks/Admin/interface';

const LaundryDashboardSummary: React.FC = () => {
  const navigate = useNavigate();

  const { data: laundries } = useFetchAllLaundries();
  const { data: categories } = useFetchCategories();
  const { data: vendors } = useFetchAllUsers({
    type: USER_TYPES.VENDOR,
    page: 1,
    limit: 1000,
  });

  // Calculate statistics
  const totalLaundries = laundries?.data?.length || 0;
  const totalCategories = categories?.data?.length || 0;
  const totalVendors = vendors?.data?.length || 0;
  const vendorsWithLaundries =
    vendors?.data?.filter((vendor: any) =>
      laundries?.data?.some((laundry: any) => laundry.vendorId === vendor.id)
    ).length || 0;

  const totalServices =
    laundries?.data?.reduce(
      (sum: number, laundry: any) =>
        sum + (laundry._count?.laundryService || 0),
      0
    ) || 0;

  const laundryAdoptionRate =
    totalVendors > 0 ? (vendorsWithLaundries / totalVendors) * 100 : 0;

  const statsCards = [
    {
      title: 'Total Laundries',
      value: totalLaundries,
      icon: <LocalLaundryService />,
      color: 'primary',
      subtitle: `${vendorsWithLaundries} vendors active`,
    },
    {
      title: 'Laundry Services',
      value: totalServices,
      icon: <Settings />,
      color: 'secondary',
      subtitle: `Across ${totalLaundries} laundries`,
    },
    {
      title: 'Item Categories',
      value: totalCategories,
      icon: <Category />,
      color: 'success',
      subtitle: 'For service items',
    },
    {
      title: 'Vendor Adoption',
      value: `${laundryAdoptionRate.toFixed(1)}%`,
      icon: <TrendingUp />,
      color: 'warning',
      subtitle: `${vendorsWithLaundries}/${totalVendors} vendors`,
    },
  ];

  const quickActions = [
    {
      title: 'Manage Categories',
      description: 'Create and organize item categories',
      icon: <Category />,
      action: () => navigate('/laundry/categories'),
      color: 'primary' as const,
    },
    {
      title: 'View All Vendors',
      description: 'See vendors and their laundries',
      icon: <ManageAccounts />,
      action: () => navigate('/vendor'),
      color: 'secondary' as const,
    },
  ];

  return (
    <Box>
      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${
                  stat.color === 'primary'
                    ? '#1976d2'
                    : stat.color === 'secondary'
                    ? '#9c27b0'
                    : stat.color === 'success'
                    ? '#2e7d32'
                    : '#ed6c02'
                }15, ${
                  stat.color === 'primary'
                    ? '#1976d2'
                    : stat.color === 'secondary'
                    ? '#9c27b0'
                    : stat.color === 'success'
                    ? '#2e7d32'
                    : '#ed6c02'
                }05)`,
                border: `1px solid ${
                  stat.color === 'primary'
                    ? '#1976d2'
                    : stat.color === 'secondary'
                    ? '#9c27b0'
                    : stat.color === 'success'
                    ? '#2e7d32'
                    : '#ed6c02'
                }20`,
              }}
            >
              <Stack
                direction='row'
                alignItems='flex-start'
                justifyContent='space-between'
              >
                <Box>
                  <Typography
                    variant='h4'
                    fontWeight='bold'
                    color={`${stat.color}.main`}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant='h6' fontWeight='600' gutterBottom>
                    {stat.title}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {stat.subtitle}
                  </Typography>
                </Box>
                <Box color={`${stat.color}.main`} sx={{ fontSize: 40 }}>
                  {stat.icon}
                </Box>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Adoption Rate Progress */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant='h6' gutterBottom fontWeight='bold'>
          Vendor Laundry Adoption Rate
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='center'
            mb={1}
          >
            <Typography variant='body2' color='text.secondary'>
              Vendors with registered laundries
            </Typography>
            <Typography variant='body2' fontWeight='bold'>
              {vendorsWithLaundries} / {totalVendors} (
              {laundryAdoptionRate.toFixed(1)}%)
            </Typography>
          </Stack>
          <LinearProgress
            variant='determinate'
            value={laundryAdoptionRate}
            sx={{ height: 8, borderRadius: 4 }}
            color={
              laundryAdoptionRate > 70
                ? 'success'
                : laundryAdoptionRate > 40
                ? 'warning'
                : 'error'
            }
          />
        </Box>
        <Typography variant='body2' color='text.secondary'>
          {laundryAdoptionRate > 70
            ? 'Excellent adoption rate!'
            : laundryAdoptionRate > 40
            ? 'Good progress, encourage more vendors to register their laundries.'
            : 'Low adoption rate. Consider outreach to vendors without laundries.'}
        </Typography>
      </Paper>

      {/* Quick Actions */}
      <Typography variant='h6' gutterBottom fontWeight='bold'>
        Quick Actions
      </Typography>
      <Grid container spacing={3}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction='row' alignItems='center' spacing={2} mb={2}>
                  <Box color={`${action.color}.main`} sx={{ fontSize: 32 }}>
                    {action.icon}
                  </Box>
                  <Box>
                    <Typography variant='h6' fontWeight='bold'>
                      {action.title}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {action.description}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
              <CardActions>
                <Button
                  size='small'
                  color={action.color}
                  onClick={action.action}
                  startIcon={<Add />}
                >
                  Go to {action.title}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default LaundryDashboardSummary;
