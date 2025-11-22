// File: src/hooks/Admin/query.ts

import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import api from '../../../services/api-service';
import { toast } from 'react-toastify';
import {
  FetchApplicationsParams,
  FetchCouponParams,
  FetchOrdersParams,
  FetchUsersParams,
  getRiderTipsParams,
  OrderDetails,
  OrdersResponse,
  User,
  UserCoords,
  UserResponse,
} from '../interface';
import { AxiosError, AxiosResponse } from 'axios';
import CustomOrder from '../../../types/customOrders';

export const FETCH_ORDER_QUERIES = {
  FETCH_ALL_ORDERS: 'FETCH_ALL_ORDERS',
  FETCH_ALL_USERS: 'FETCH_ALL_USERS',
  FETCH_ALL_APPLICATIONS: 'FETCH_ALL_APPLICATIONS',
  FETCH_USER_LOCATIONS: 'FETCH_USER_LOCATIONS',
  FETCH_ORDER_DETAILS: 'FETCH_ORDER_DETAILS',
  FETCH_USER_DETAILS: 'FETCH_USER_DETAILS',
  FETCH_ALL_COUPONS: 'FETCH_ALL_COUPONS',
  FETCH_COUPON_USAGE: 'FETCH_COUPON_USAGE',
  FETCH_DRIVER_TIPS: 'FETCH_DRIVER_TIPS',
  FETCH_ALL_TIPS: 'FETCH_ALL_TIPS',
  // Laundry related queries
  FETCH_ALL_LAUNDRIES: 'FETCH_ALL_LAUNDRIES',
  FETCH_LAUNDRY_BY_ID: 'FETCH_LAUNDRY_BY_ID',
  FETCH_LAUNDRY_SERVICES: 'FETCH_LAUNDRY_SERVICES',
  FETCH_LAUNDRY_SERVICE_ITEMS: 'FETCH_LAUNDRY_SERVICE_ITEMS',
  FETCH_LAUNDRY_CATEGORIES: 'FETCH_LAUNDRY_CATEGORIES',
  FETCH_LAUNDRY_CATEGORY_BY_ID: 'FETCH_LAUNDRY_CATEGORY_BY_ID',
  //
  FETCH_CUSTOM_ORDER_DETAILS: 'FETCH_CUSTOM_ORDER_DETAILS',
  FETCH_CUSTOM_ORDER_STATS: 'FETCH_CUSTOM_ORDER_STATS',
  FETCH_AVAILABLE_DRIVERS: 'FETCH_AVAILABLE_DRIVERS',
  FETCH_ALL_CUSTOM_ORDERS: 'FETCH_ALL_CUSTOM_ORDERS',
  // Dashboard and Finance queries
  FETCH_DASHBOARD_METRICS: 'FETCH_DASHBOARD_METRICS',
  FETCH_ORDER_TRENDS: 'FETCH_ORDER_TRENDS',
  FETCH_FINANCE_OVERVIEW: 'FETCH_FINANCE_OVERVIEW',
  FETCH_MONTHLY_FINANCE: 'FETCH_MONTHLY_FINANCE',
  FETCH_VENDOR_EARNINGS: 'FETCH_VENDOR_EARNINGS',
  FETCH_DAILY_REVENUE: 'FETCH_DAILY_REVENUE',
};

const getAllUsers = async ({
  type,
  page = 1,
  limit = 10,
  column = 'createdAt',
  direction = 'DESC',
  dateFilter,
}: FetchUsersParams): Promise<UserResponse> => {
  const response: AxiosResponse<UserResponse> = await api.get(
    `/admin/users/all`,
    {
      params: {
        type,
        page,
        limit,
        column,
        direction,
        dateFilter,
      },
    }
  );
  return response.data;
};

export const useFetchAllUsers = ({
  type,
  page = 1,
  limit = 10,
  column = 'createdAt',
  direction = 'DESC',
  dateFilter,
}: FetchUsersParams): UseQueryResult<UserResponse, AxiosError> => {
  return useQuery({
    queryFn: () =>
      getAllUsers({ type, page, limit, column, direction, dateFilter }),
    queryKey: [
      FETCH_ORDER_QUERIES.FETCH_ALL_USERS,
      type,
      page,
      limit,
      column,
      direction,
      dateFilter,
    ],
  });
};

const getUserDetailsAction = async (userId: string) => {
  return await api.get(`/admin/user-details/${userId}`);
};

export const useGetUserDetails = (
  userId: string
): UseQueryResult<AxiosResponse<User>, AxiosError> => {
  return useQuery({
    queryKey: [FETCH_ORDER_QUERIES.FETCH_USER_DETAILS, userId],
    queryFn: () => getUserDetailsAction(userId),
    enabled: !!userId,
  });
};

const getApplicationsAction = async ({
  type,
  page = 1,
  limit = 10,
  column = 'createdAt',
  direction = 'DESC',
}: FetchApplicationsParams): Promise<UserResponse> => {
  const response: AxiosResponse<UserResponse> = await api.get(
    `/admin/applications`,
    {
      params: {
        type,
        page,
        limit,
        column,
        direction,
      },
    }
  );
  return response.data;
};

export const useGetApplications = ({
  type,
  page = 1,
  limit = 10,
  column = 'createdAt',
  direction = 'DESC',
}: FetchApplicationsParams): UseQueryResult<UserResponse, AxiosError> => {
  return useQuery({
    queryFn: () =>
      getApplicationsAction({ type, page, limit, column, direction }),
    queryKey: [
      FETCH_ORDER_QUERIES.FETCH_ALL_APPLICATIONS,
      type,
      page,
      limit,
      column,
      direction,
    ],
  });
};

const fetchUserLocationAction = async (): Promise<UserCoords> => {
  const response: AxiosResponse<UserCoords> = await api.get(
    '/admin/users/location',
    {
      params: {},
    }
  );
  return response.data;
};

export const useFetchUserLocations = (): UseQueryResult<
  UserCoords,
  AxiosError
> => {
  return useQuery({
    queryFn: fetchUserLocationAction,
    queryKey: [FETCH_ORDER_QUERIES.FETCH_USER_LOCATIONS],
  });
};

export const useFetchOrderDetails = (id: string) => {
  return useQuery<OrderDetails, Error>({
    queryFn: () => getOrderDetails(id),
    queryKey: ['FETCH_ORDER_DETAILS', id],
    enabled: !!id,
  });
};

const getOrderDetails = async (id: string): Promise<OrderDetails> => {
  const response: AxiosResponse<any> = await api.get(`/admin/orders/${id}`);
  return response.data.data;
};

const getAllCoupons = async (params: FetchCouponParams) => {
  const response: AxiosResponse = await api.get('/admin/coupons/all', {
    params,
  });
  return response.data;
};

export const useGetAllCoupons = (params: FetchCouponParams) => {
  return useQuery({
    queryFn: () => getAllCoupons(params),
    queryKey: [FETCH_ORDER_QUERIES.FETCH_ALL_COUPONS],
  });
};

const getCouponUsageAction = async (couponId: string) => {
  const response: AxiosResponse = await api.get(
    `/admin/coupons/${couponId}/usage`
  );
  return response.data;
};

export const useGetCouponUsage = (couponId: string) => {
  return useQuery({
    queryFn: () => getCouponUsageAction(couponId),
    queryKey: [FETCH_ORDER_QUERIES.FETCH_COUPON_USAGE, couponId],
    enabled: !!couponId,
  });
};

export const getDriverTipsAction = async (
  driverId: string,
  params: getRiderTipsParams
) => {
  const response: AxiosResponse = await api.get(
    `/admin/driver-tips/${driverId}`,
    { params }
  );
  return response.data;
};

const fetchAllTips = async (params: FetchCouponParams) => {
  const response: AxiosResponse = await api.get(`/admin/tips/all`, { params });
  return response.data;
};

export const useFetchAllTips = (params: FetchCouponParams) => {
  return useQuery({
    queryFn: () => fetchAllTips(params),
    queryKey: [FETCH_ORDER_QUERIES.FETCH_ALL_TIPS],
  });
};

const getApplicationDocumentsAction = async (userId: string) => {
  const response = await api.get(`/admin/application/documents/${userId}`);
  console.log(response.data);
  return response.data;
};

export const useGetApplicationDocuments = (userId: string) => {
  return useQuery({
    queryFn: () => getApplicationDocumentsAction(userId),
    queryKey: ['APPLICATION_DOCUMENTS', userId],
    enabled: !!userId,
  });
};

const searchMainVendorsAction = async (params: {
  laundryName: string;
  limit?: number;
}) => {
  const response = await api.get('/admin/main-vendors/search', { params });
  return response.data;
};

export const useSearchMainVendors = ({
  query,
  laundryName,
  limit = 50,
  enabled = true,
}: {
  query?: string;
  laundryName?: string;
  limit?: number;
  enabled?: boolean;
}) => {
  // Use either query or laundryName parameter (for backward compatibility)
  const searchTerm = query || laundryName || '';

  return useQuery({
    queryFn: () =>
      searchMainVendorsAction({
        laundryName: searchTerm,
        limit,
      }),
    queryKey: ['SEARCH_MAIN_VENDORS', searchTerm, limit],
    enabled: enabled && searchTerm.length >= 3, // Safe length check
    staleTime: 30000, // Cache for 30 seconds
    gcTime: 10 * 60 * 1000, // 10 minutes (fixed from cacheTime)
  });
};

// ==================== LAUNDRY MANAGEMENT QUERIES ====================

export const useFetchAllLaundries = () => {
  return useQuery({
    queryKey: [FETCH_ORDER_QUERIES.FETCH_ALL_LAUNDRIES],
    queryFn: async () => {
      const response = await api.get('/admin/laundries');
      return response.data;
    },
  });
};

export const useFetchLaundryById = (laundryId: string) => {
  return useQuery({
    queryKey: [FETCH_ORDER_QUERIES.FETCH_LAUNDRY_BY_ID, laundryId],
    queryFn: async () => {
      const response = await api.get(`/admin/laundry/${laundryId}`);
      return response.data;
    },
    enabled: !!laundryId,
  });
};

export const useFetchLaundryServices = (laundryId: string) => {
  return useQuery({
    queryKey: [FETCH_ORDER_QUERIES.FETCH_LAUNDRY_SERVICES, laundryId],
    queryFn: async () => {
      const response = await api.get(`/admin/laundry/${laundryId}/services`);
      return response.data;
    },
    enabled: !!laundryId,
  });
};

export const useFetchLaundryServiceItems = (
  laundryId: string,
  serviceId: string
) => {
  return useQuery({
    queryKey: [
      FETCH_ORDER_QUERIES.FETCH_LAUNDRY_SERVICE_ITEMS,
      laundryId,
      serviceId,
    ],
    queryFn: async () => {
      const response = await api.get(
        `/admin/laundry/${laundryId}/service/${serviceId}/items`
      );
      return response.data;
    },
    enabled: !!laundryId && !!serviceId,
  });
};

export const useFetchLaundryServiceItemsByCategory = (
  laundryId: string,
  serviceId: string,
  categoryId: string
) => {
  return useQuery({
    queryKey: [
      FETCH_ORDER_QUERIES.FETCH_LAUNDRY_SERVICE_ITEMS,
      laundryId,
      serviceId,
      categoryId,
    ],
    queryFn: async () => {
      const response = await api.get(
        `/admin/laundry/${laundryId}/service/${serviceId}/category/${categoryId}/items`
      );
      return response.data;
    },
    enabled: !!laundryId && !!serviceId && !!categoryId,
  });
};

const getRiderDocumentsAction = async (userId: string) => {
  const response = await api.get(`/admin/rider/documents/${userId}`);
  return response.data;
};

export const useGetRiderDocuments = (userId: string) => {
  return useQuery({
    queryFn: () => getRiderDocumentsAction(userId),
    queryKey: ['RIDER_DOCUMENTS', userId],
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useFetchCategories = () => {
  return useQuery({
    queryKey: [FETCH_ORDER_QUERIES.FETCH_LAUNDRY_CATEGORIES],
    queryFn: async () => {
      // Use consistent v1/admin prefix
      const response = await api.get('/admin/categories');
      return response.data;
    },
  });
};

export const useFetchCategoryById = (categoryId: string) => {
  return useQuery({
    queryKey: [FETCH_ORDER_QUERIES.FETCH_LAUNDRY_CATEGORY_BY_ID, categoryId],
    queryFn: async () => {
      // Use consistent v1/admin prefix
      const response = await api.get(`/admin/category/${categoryId}`);
      return response.data;
    },
    enabled: !!categoryId,
  });
};

export const useFetchIcons = () => {
  return useQuery({
    queryKey: ['admin-icons'],
    queryFn: async () => {
      // Use consistent endpoint - match with mutation hooks
      const response = await api.get('/icon/all');
      return response.data;
    },
  });
};

export const ADMIN_SETTINGS_QUERIES = {
  FETCH_ADMIN_SETTINGS: 'FETCH_ADMIN_SETTINGS',
};

export const useFetchAdminSettings = () => {
  return useQuery({
    queryKey: [ADMIN_SETTINGS_QUERIES.FETCH_ADMIN_SETTINGS],
    queryFn: async () => {
      const response = await api.get('/admin/settings');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Custom order details fetching - ADD this function
const getCustomOrderDetails = async (orderId: string): Promise<CustomOrder> => {
  const response: AxiosResponse<CustomOrder> = await api.get(
    `/admin/custom-order/${orderId}/details`
  );
  return response.data;
};

export const useFetchCustomOrderDetails = (orderId: string) => {
  return useQuery({
    queryFn: () => getCustomOrderDetails(orderId),
    queryKey: [FETCH_ORDER_QUERIES.FETCH_CUSTOM_ORDER_DETAILS, orderId],
    enabled: !!orderId,
  });
};

// Custom order statistics - ADD this function
const getCustomOrderStats = async () => {
  const response: AxiosResponse<any> = await api.get(
    '/admin/custom-order/stats'
  );
  return response.data;
};

export const useFetchCustomOrderStats = () => {
  return useQuery({
    queryFn: getCustomOrderStats,
    queryKey: [FETCH_ORDER_QUERIES.FETCH_CUSTOM_ORDER_STATS],
  });
};

// Available drivers for custom order - ADD this function
const getAvailableDriversForCustomOrder = async (orderId: string) => {
  const response: AxiosResponse<any> = await api.get(
    `/admin/custom-order/${orderId}/available-drivers`
  );
  return response.data;
};

export const useFetchAvailableDrivers = (orderId: string) => {
  return useQuery({
    queryFn: () => getAvailableDriversForCustomOrder(orderId),
    queryKey: [FETCH_ORDER_QUERIES.FETCH_AVAILABLE_DRIVERS, orderId],
    enabled: !!orderId,
  });
};

// Fetch all custom orders with filtering - ADD this function
interface FetchCustomOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
  searchTerm?: string;
}

const getAllCustomOrders = async (params: FetchCustomOrdersParams) => {
  const response: AxiosResponse<any> = await api.get(
    '/admin/custom-order/all',
    {
      params,
    }
  );
  return response.data;
};

export const useFetchAllCustomOrders = (params: FetchCustomOrdersParams) => {
  return useQuery({
    queryFn: () => getAllCustomOrders(params),
    queryKey: [FETCH_ORDER_QUERIES.FETCH_ALL_CUSTOM_ORDERS, params],
  });
};

const getAllOrders = async ({
  type,
  orderType,
  page,
  limit,
  column,
  direction,
}: FetchOrdersParams) => {
  const params: Record<string, any> = {};

  if (type !== undefined) params.type = type;
  if (orderType !== undefined) params.orderType = orderType; // NEW: Include orderType
  if (page !== undefined) params.page = page;
  if (limit !== undefined) params.limit = limit;
  if (column !== undefined) params.column = column;
  if (direction !== undefined) params.direction = direction;

  const response: AxiosResponse<OrdersResponse> = await api.get(
    '/admin/orders/all',
    { params }
  );
  return response.data;
};

export const useFetchAllOrders = ({
  type,
  orderType, // NEW: Add orderType parameter
  page,
  limit,
  column,
  direction,
}: FetchOrdersParams) => {
  return useQuery({
    queryFn: () =>
      getAllOrders({ type, orderType, page, limit, column, direction }),
    queryKey: [
      FETCH_ORDER_QUERIES.FETCH_ALL_ORDERS,
      type,
      orderType,
      page,
      limit,
      column,
      direction,
    ],
  });
};

// Fetch single user by ID
export const useFetchUserById = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      const response = await api.get(`/user/${userId}`);
      return response.data;
    },
    enabled: !!userId,
  });
};

// Fetch user orders
export const useFetchUserOrders = (userId: string, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['userOrders', userId, page, limit],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      const response = await api.get(`/orders/user/${userId}`, {
        params: { page, limit },
      });
      return response.data;
    },
    enabled: !!userId,
  });
};

// Fetch user addresses
export const useFetchUserAddresses = (userId: string) => {
  return useQuery({
    queryKey: ['userAddresses', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      const response = await api.get(`/user/${userId}/addresses`);
      return response.data;
    },
    enabled: !!userId,
  });
};

// Update user status
export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      status,
    }: {
      userId: string;
      status: string;
    }) => {
      const response = await api.patch(`/user/${userId}/status`, {
        status,
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      console.log(typeof data)
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// ==================== DASHBOARD QUERIES ====================

export interface DashboardMetrics {
  orders: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    completed: number;
    cancelled: number;
    pending: number;
    inProgress: number;
    normalDelivery: number;
    expressDelivery: number;
    completionRate: string | number;
    cancellationRate: string | number;
  };
  revenue: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    lastMonth: number;
    growthPercentage: number;
    averageOrderValue: number;
  };
  platformEarnings: {
    serviceCharges: number;
    deliveryFees: number;
    vatCollected: number;
    total: number;
  };
  customers: {
    total: number;
    active: number;
    newToday: number;
    newThisMonth: number;
  };
  vendors: {
    total: number;
    active: number;
    laundries: number;
    activeLaundries: number;
  };
  drivers: {
    total: number;
    active: number;
  };
  topLaundries: Array<{
    id: string;
    name: string;
    orderCount: number;
    revenue: number;
  }>;
  orderStatusDistribution: Array<{
    status: string;
    count: number;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: number;
    status: string;
    totalAmount: number;
    deliveryType: string;
    customerName: string;
    laundryName: string;
    createdAt: string;
  }>;
}

export const useFetchDashboardMetrics = () => {
  return useQuery<DashboardMetrics, AxiosError>({
    queryKey: [FETCH_ORDER_QUERIES.FETCH_DASHBOARD_METRICS],
    queryFn: async () => {
      const response = await api.get('/admin/dashboard/metrics');
      return response.data;
    },
    refetchInterval: 60000, // Refresh every minute
    onError: (error: AxiosError) => {
      const message = (error?.response?.data as any)?.message || error?.message || 'Failed to load dashboard metrics';
      toast.error(message);
    },
  });
};

export const useFetchOrderTrends = (days: number = 30) => {
  return useQuery({
    queryKey: [FETCH_ORDER_QUERIES.FETCH_ORDER_TRENDS, days],
    queryFn: async () => {
      const response = await api.get(`/admin/dashboard/trends?days=${days}`);
      return response.data;
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to load order trends';
      toast.error(message);
    },
  });
};

// ==================== FINANCE QUERIES ====================

export interface FinanceOverview {
  period: {
    startDate: string;
    endDate: string;
  };
  inflow: {
    totalRevenue: number;
    itemRevenue: number;
    serviceCharges: number;
    deliveryFees: number;
    vatCollected: number;
    transferCharges: number;
    orderCount: number;
  };
  outflow: {
    vendorEarnings: number;
    withdrawalsCompleted: number;
    pendingWithdrawals: number;
    withdrawalCount: number;
  };
  platformGains: {
    grossProfit: number;
    itemMarkup: number;
    serviceCharges: number;
    deliveryFees: number;
    transferCharges: number;
    netProfit: number;
  };
  summary: {
    totalInflow: number;
    totalOutflow: number;
    netCashflow: number;
    pendingPayables: number;
  };
}

export interface MonthlyFinanceData {
  month: number;
  monthName: string;
  year: number;
  revenue: number;
  serviceCharges: number;
  deliveryFees: number;
  vatCollected: number;
  withdrawals: number;
  orderCount: number;
}

export interface VendorEarning {
  laundryId: string;
  laundryName: string;
  vendorName: string;
  vendorPhone: string;
  orderCount: number;
  totalEarning: number;
  disbursedEarning: number;
  pendingEarning: number;
}

export const useFetchFinanceOverview = (startDate: Date | null, endDate: Date | null) => {
  return useQuery<FinanceOverview, AxiosError>({
    queryKey: [FETCH_ORDER_QUERIES.FETCH_FINANCE_OVERVIEW, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());
      const response = await api.get(`/admin/dashboard/finance/overview?${params}`);
      return response.data;
    },
    onError: (error: AxiosError) => {
      const message = (error?.response?.data as any)?.message || error?.message || 'Failed to load finance overview';
      toast.error(message);
    },
  });
};

export const useFetchMonthlyFinance = () => {
  return useQuery<MonthlyFinanceData[], AxiosError>({
    queryKey: [FETCH_ORDER_QUERIES.FETCH_MONTHLY_FINANCE],
    queryFn: async () => {
      const response = await api.get('/admin/dashboard/finance/monthly');
      return response.data;
    },
    onError: (error: AxiosError) => {
      const message = (error?.response?.data as any)?.message || error?.message || 'Failed to load monthly finance data';
      toast.error(message);
    },
  });
};

export const useFetchVendorEarnings = (startDate: Date | null, endDate: Date | null) => {
  return useQuery<VendorEarning[], AxiosError>({
    queryKey: [FETCH_ORDER_QUERIES.FETCH_VENDOR_EARNINGS, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());
      const response = await api.get(`/admin/dashboard/finance/vendor-earnings?${params}`);
      return response.data;
    },
    onError: (error: AxiosError) => {
      const message = (error?.response?.data as any)?.message || error?.message || 'Failed to load vendor earnings';
      toast.error(message);
    },
  });
};

export const useFetchDailyRevenue = (days: number = 30) => {
  return useQuery({
    queryKey: [FETCH_ORDER_QUERIES.FETCH_DAILY_REVENUE, days],
    queryFn: async () => {
      const response = await api.get(`/admin/dashboard/finance/daily-revenue?days=${days}`);
      return response.data;
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to load daily revenue';
      toast.error(message);
    },
  });
};
