import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Stack,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tabs,
  Tab,
  Badge,
} from '@mui/material';
import {
  ArrowBack,
  Email,
  Phone,
  CalendarToday,
  Star,
  ShoppingBag,
  LocalOffer,
  AttachMoney,
  Edit,
  Block,
  CheckCircle,
  Person,
  History,
  Loyalty,
  Assignment,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useFetchUserById, useFetchUserOrders } from '../hooks/Admin/query';
import { LEVELS, ORDER_STATUSES } from '../hooks/Admin/interface';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`customer-tabpanel-${index}`}
      aria-labelledby={`customer-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const CustomerDetails = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);

  // Fetch customer data
  const {
    data: customer,
    isLoading: customerLoading,
    error: customerError,
    refetch: refetchCustomer,
  } = useFetchUserById(customerId || '');

  // Fetch customer orders
  const {
    data: orders,
    isLoading: ordersLoading,
    error: ordersError,
  } = useFetchUserOrders(customerId || '');

  // Fetch customer addresses
  //   const {
  //     data: addresses,
  //     isLoading: addressesLoading,
  //     error: addressesError,
  //   } = useFetchUserAddresses(customerId || '');

  //   useEffect(() => {
  //     if (customerError) {
  //       toast.error(
  //         (customerError?.response?.data as { message: string })?.message ||
  //           'Failed to load customer details'
  //       );
  //     }
  //   }, [customerError]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleBack = () => {
    navigate('/customers');
  };

  const handleEditCustomer = () => {
    // Navigate to edit page or open edit dialog
    toast.info('Edit functionality to be implemented');
  };

  const handleToggleStatus = async () => {
    // Toggle customer status logic
    try {
      // await updateCustomerStatus API call
      toast.success('Customer status updated');
      refetchCustomer();
    } catch (error) {
      console.log(error);
      toast.error('Failed to update customer status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'error';
      case 'SUSPENDED':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case ORDER_STATUSES.COMPLETED:
        return 'success';
      case ORDER_STATUSES.CANCELLED:
        return 'error';
      case ORDER_STATUSES.IN_PROGRESS:
        return 'warning';
      case ORDER_STATUSES.PENDING:
        return 'info';
      default:
        return 'default';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateTotalSpent = () => {
    if (!orders?.data) return 0;
    return orders.data
      .reduce(
        (total: number, order: any) => total + (order.totalAmount || 0),
        0
      )
      .toFixed(2);
  };

  const calculateTotalOrders = () => {
    return orders?.count || 0;
  };

  if (customerLoading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='400px'
      >
        <CircularProgress />
      </Box>
    );
  }

  if (customerError && !customer) {
    return (
      <Box p={3}>
        <Button startIcon={<ArrowBack />} onClick={handleBack} sx={{ mb: 2 }}>
          Back to Customers
        </Button>
        <Alert severity='error'>
          Failed to load customer details. Please try again later.
        </Alert>
      </Box>
    );
  }

  if (!customer) {
    return (
      <Box p={3}>
        <Button startIcon={<ArrowBack />} onClick={handleBack} sx={{ mb: 2 }}>
          Back to Customers
        </Button>
        <Alert severity='warning'>Customer not found.</Alert>
      </Box>
    );
  }

  return (
    <Box pr={5}>
      <ToastContainer />

      {/* Header */}
      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        mb={3}
      >
        <Box display='flex' alignItems='center' gap={2}>
          <IconButton onClick={handleBack} size='small'>
            <ArrowBack />
          </IconButton>
          <Typography variant='h4'>Customer Details</Typography>
        </Box>
        <Box display='flex' gap={1}>
          <Button
            variant='outlined'
            startIcon={<Edit />}
            onClick={handleEditCustomer}
          >
            Edit
          </Button>
          <Button
            variant='contained'
            color={customer.status === 'ACTIVE' ? 'error' : 'success'}
            startIcon={
              customer.status === 'ACTIVE' ? <Block /> : <CheckCircle />
            }
            onClick={handleToggleStatus}
          >
            {customer.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
          </Button>
        </Box>
      </Box>

      {/* Customer Overview Card */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Box display='flex' alignItems='center' gap={2} mb={2}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'primary.main',
                    fontSize: '2rem',
                  }}
                >
                  {customer.firstName?.[0]}
                  {customer.lastName?.[0]}
                </Avatar>
                <Box>
                  <Typography variant='h5'>
                    {customer.firstName || 'N/A'} {customer.lastName || 'N/A'}
                  </Typography>
                  <Chip
                    label={customer.status}
                    color={getStatusColor(customer.status)}
                    size='small'
                  />
                  {customer.level === LEVELS.LOYAL && (
                    <Chip
                      icon={<Star />}
                      label='LOYAL'
                      color='warning'
                      size='small'
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Person />
                  </ListItemIcon>
                  <ListItemText
                    primary='Customer ID'
                    secondary={customer.id || 'N/A'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Email />
                  </ListItemIcon>
                  <ListItemText
                    primary='Email'
                    secondary={customer.email || 'Not provided'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Phone />
                  </ListItemIcon>
                  <ListItemText
                    primary='Phone'
                    secondary={customer.phone || 'Not provided'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Loyalty />
                  </ListItemIcon>
                  <ListItemText
                    primary='Level'
                    secondary={customer.level || 'BASIC'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CalendarToday />
                  </ListItemIcon>
                  <ListItemText
                    primary='Member Since'
                    secondary={formatDate(customer.createdAt)}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Statistics Cards */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Card elevation={3}>
                <CardContent>
                  <Box display='flex' alignItems='center' gap={1}>
                    <ShoppingBag color='primary' />
                    <Typography variant='h6'>Total Orders</Typography>
                  </Box>
                  <Typography variant='h3' sx={{ mt: 1 }}>
                    {calculateTotalOrders()}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Lifetime orders placed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Card elevation={3}>
                <CardContent>
                  <Box display='flex' alignItems='center' gap={1}>
                    <AttachMoney color='success' />
                    <Typography variant='h6'>Total Spent</Typography>
                  </Box>
                  <Typography variant='h3' sx={{ mt: 1 }}>
                    ${calculateTotalSpent()}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Lifetime value
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Card elevation={3}>
                <CardContent>
                  <Box display='flex' alignItems='center' gap={1}>
                    <LocalOffer color='warning' />
                    <Typography variant='h6'>Coupons Used</Typography>
                  </Box>
                  <Typography variant='h3' sx={{ mt: 1 }}>
                    {customer.couponsUsed || 0}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Total coupons redeemed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Card elevation={3}>
                <CardContent>
                  <Box display='flex' alignItems='center' gap={1}>
                    <History color='info' />
                    <Typography variant='h6'>Last Order</Typography>
                  </Box>
                  <Typography variant='body1' sx={{ mt: 1 }}>
                    {orders?.data?.[0]?.createdAt
                      ? formatDate(orders.data[0].createdAt)
                      : 'No orders yet'}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Most recent activity
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Tabs Section */}
      <Paper elevation={3}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab
            label={
              <Badge badgeContent={calculateTotalOrders()} color='primary'>
                Orders
              </Badge>
            }
            icon={<Assignment />}
            iconPosition='start'
          />
          {/* <Tab
            label={
              <Badge badgeContent={addresses?.count || 0} color='primary'>
                Addresses
              </Badge>
            }
            icon={<Home />}
            iconPosition='start'
          /> */}
          <Tab label='Activity Log' icon={<History />} iconPosition='start' />
        </Tabs>

        {/* Orders Tab */}
        <TabPanel value={tabValue} index={0}>
          {ordersLoading ? (
            <Box display='flex' justifyContent='center' p={3}>
              <CircularProgress />
            </Box>
          ) : ordersError ? (
            <Alert severity='error'>Failed to load orders</Alert>
          ) : !orders?.data || orders.data.length === 0 ? (
            <Alert severity='info'>No orders found for this customer</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.data.map((order: any) => (
                    <TableRow key={order.id} hover>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>
                        <Chip
                          label={order.status}
                          color={getOrderStatusColor(order.status)}
                          size='small'
                        />
                      </TableCell>
                      <TableCell>{order.orderType || 'REGULAR'}</TableCell>
                      <TableCell>
                        {order.services?.reduce(
                          (total: number, service: any) =>
                            total + (service.items?.length || 0),
                          0
                        ) || 0}{' '}
                        items
                      </TableCell>
                      <TableCell>
                        ${order.totalAmount?.toFixed(2) || '0.00'}
                      </TableCell>
                      <TableCell>
                        <Button
                          size='small'
                          onClick={() => navigate(`/order-details/${order.id}`)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* Addresses Tab */}
        {/* <TabPanel value={tabValue} index={1}>
          {addressesLoading ? (
            <Box display='flex' justifyContent='center' p={3}>
              <CircularProgress />
            </Box>
          ) : addressesError ? (
            <Alert severity='error'>Failed to load addresses</Alert>
          ) : !addresses?.data || addresses.data.length === 0 ? (
            <Alert severity='info'>No addresses found for this customer</Alert>
          ) : (
            <Grid container spacing={2}>
              {addresses.data.map((address: any) => (
                <Grid item xs={12} md={6} key={address.id}>
                  <Card variant='outlined'>
                    <CardContent>
                      <Box display='flex' alignItems='center' gap={1} mb={1}>
                        <LocationOn color='primary' />
                        <Typography variant='h6'>
                          {address.label || 'Address'}
                        </Typography>
                        {address.isDefault && (
                          <Chip label='Default' color='primary' size='small' />
                        )}
                      </Box>
                      <Typography variant='body2' color='text.secondary'>
                        {address.streetAddress}
                      </Typography>
                      {address.apartment && (
                        <Typography variant='body2' color='text.secondary'>
                          Apartment: {address.apartment}
                        </Typography>
                      )}
                      <Typography variant='body2' color='text.secondary'>
                        {address.city}, {address.state} {address.zipCode}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {address.country}
                      </Typography>
                      {address.instructions && (
                        <Typography
                          variant='body2'
                          sx={{ mt: 1, fontStyle: 'italic' }}
                        >
                          Instructions: {address.instructions}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel> */}

        {/* Activity Log Tab */}
        <TabPanel value={tabValue} index={2}>
          <Stack spacing={2}>
            <Alert severity='info'>
              Activity log shows recent customer interactions and changes
            </Alert>

            {/* Sample activity log items */}
            <Card variant='outlined'>
              <CardContent>
                <Typography variant='subtitle2' color='text.secondary'>
                  {formatDate(customer.updatedAt || customer.createdAt)}
                </Typography>
                <Typography variant='body2'>
                  Customer account created
                </Typography>
              </CardContent>
            </Card>

            {customer.lastLogin && (
              <Card variant='outlined'>
                <CardContent>
                  <Typography variant='subtitle2' color='text.secondary'>
                    {formatDate(customer.lastLogin)}
                  </Typography>
                  <Typography variant='body2'>Customer logged in</Typography>
                </CardContent>
              </Card>
            )}

            {/* {orders?.data?.[0] && (
              <Card variant='outlined'>
                <CardContent>
                  <Typography variant='subtitle2' color='text.secondary'>
                    {formatDate(orders.data[0].createdAt)}
                  </Typography>
                  <Typography variant='body2'>
                    Placed order #{orders.data[0].id}
                  </Typography>
                </CardContent>
              </Card>
            )} */}
          </Stack>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default CustomerDetails;
