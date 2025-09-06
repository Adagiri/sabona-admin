// File: src/components/CustomOrdersStats.tsx

import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  Assignment,
  Money,
  LocalShipping,
  CheckCircle,
  Pending,
  TrendingUp,
} from '@mui/icons-material';

interface StatsData {
  totalOrders: number;
  pendingPricing: number;
  awaitingDriver: number;
  inProgress: number;
  completed: number;
  totalRevenue: number;
  averageOrderValue: number;
  completionRate: number;
}

const CustomOrdersStats: React.FC = () => {
  const theme = useTheme();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/custom-orders/dashboard-stats');
      const data = await response.json();
      setStats(data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: <Assignment />,
      color: theme.palette.primary.main,
      bgColor: theme.palette.primary.light + '20',
    },
    {
      title: 'Pending Pricing',
      value: stats?.pendingPricing || 0,
      icon: <Pending />,
      color: theme.palette.warning.main,
      bgColor: theme.palette.warning.light + '20',
    },
    {
      title: 'Awaiting Driver',
      value: stats?.awaitingDriver || 0,
      icon: <LocalShipping />,
      color: theme.palette.info.main,
      bgColor: theme.palette.info.light + '20',
    },
    {
      title: 'In Progress',
      value: stats?.inProgress || 0,
      icon: <TrendingUp />,
      color: theme.palette.secondary.main,
      bgColor: theme.palette.secondary.light + '20',
    },
    {
      title: 'Completed',
      value: stats?.completed || 0,
      icon: <CheckCircle />,
      color: theme.palette.success.main,
      bgColor: theme.palette.success.light + '20',
    },
    {
      title: 'Total Revenue',
      value: `${stats?.totalRevenue || 0} SAR`,
      icon: <Money />,
      color: theme.palette.success.main,
      bgColor: theme.palette.success.light + '20',
    },
  ];

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {statCards.map((card, index) => (
        <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
          <Card
            sx={{
              height: '100%',
              background: `linear-gradient(135deg, ${card.bgColor} 0%, ${card.bgColor}80 100%)`,
              border: `1px solid ${card.color}30`,
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[8],
              },
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Box
                display='flex'
                alignItems='center'
                justifyContent='space-between'
              >
                <Box>
                  <Typography variant='h4' fontWeight='bold' color={card.color}>
                    {card.value}
                  </Typography>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ mt: 0.5 }}
                  >
                    {card.title}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: '50%',
                    backgroundColor: card.color,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {card.icon}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}

      {/* Additional metrics */}
      <Grid item xs={12}>
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant='h6' gutterBottom fontWeight='bold'>
              Performance Metrics
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={4}>
                <Box textAlign='center'>
                  <Typography variant='h5' color='primary' fontWeight='bold'>
                    {stats?.averageOrderValue?.toFixed(2) || 0} SAR
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Average Order Value
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box textAlign='center'>
                  <Typography
                    variant='h5'
                    color='success.main'
                    fontWeight='bold'
                  >
                    {stats?.completionRate?.toFixed(1) || 0}%
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Completion Rate
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box textAlign='center'>
                  <Typography variant='h5' color='info.main' fontWeight='bold'>
                    {(stats?.inProgress || 0) + (stats?.pendingPricing || 0)}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Needs Attention
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default CustomOrdersStats;
