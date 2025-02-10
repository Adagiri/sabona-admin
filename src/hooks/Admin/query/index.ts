import { useQuery, UseQueryResult } from "@tanstack/react-query"
import api from "../../../services/api-service"
import { FetchApplicationsParams, FetchCouponParams, FetchOrdersParams, FetchUsersParams, getRiderTipsParams, OrderDetails, OrdersResponse, User, UserCoords, UserResponse } from "../interface"
import { AxiosError, AxiosResponse } from "axios"

export const FETCH_ORDER_QUERIES = {
  FETCH_ALL_ORDERS: 'FETCH_ALL_ORDERS',
  FETCH_ALL_USERS: 'FETCH_ALL_USERS',
  FETCH_ALL_APPLICATIONS: 'FETCH_ALL_APPLICATIONS',
  FETCH_USER_LOCATIONS: 'FETCH_USER_LOCATIONS',
  FETCH_ORDER_DETAILS: 'FETCH_ORDER_DETAILS',
  FETCH_USER_DETAILS: 'FETCH_USER_DETAILS',
  FETCH_ALL_COUPONS : 'FETCH_ALL_COUPONS',
  FETCH_COUPON_USAGE: 'FETCH_COUPON_USAGE',
  FETCH_DRIVER_TIPS: 'FETCH_DRIVER_TIPS',
  FETCH_ALL_TIPS: 'FETCH_ALL_TIPS'
}

const getAllOrders = async ({
  type,
  page,
  limit,
  column,
  direction,
}: FetchOrdersParams) => {
  const params: Record<string, any> = {};

  if (type !== undefined) params.type = type;
  if (page !== undefined) params.page = page;
  if (limit !== undefined) params.limit = limit;
  if (column !== undefined) params.column = column;
  if (direction !== undefined) params.direction = direction;

  const response: AxiosResponse<OrdersResponse> = await api.get('/admin/orders/all', { params });
  return response.data;
};

export const useFetchAllOrders = ({ type, page, limit, column, direction }: FetchOrdersParams) => {
  return useQuery({
    queryFn: () => getAllOrders({ type, page, limit, column, direction }),
    queryKey: [
      FETCH_ORDER_QUERIES.FETCH_ALL_ORDERS,
      type,
      page,
      limit,
      column,
      direction,
    ],
  });
};

const getAllUsers = async ({ type, page = 1, limit = 10, column = "createdAt", direction = "DESC", dateFilter }: FetchUsersParams): Promise<UserResponse> => {
  const response: AxiosResponse<UserResponse> = await api.get(
    `/admin/users/all`,
    {
      params: {
        type,
        page,
        limit,
        column,
        direction,
        dateFilter
      },
    }
  );
  return response.data;
};

export const useFetchAllUsers = ({ type, page = 1, limit = 10, column = "createdAt", direction = "DESC", dateFilter }: FetchUsersParams): UseQueryResult<UserResponse, AxiosError> => {
  return useQuery({
    queryFn: () => getAllUsers({ type, page, limit, column, direction, dateFilter }),
    queryKey: [FETCH_ORDER_QUERIES.FETCH_ALL_USERS, type, page, limit, column, direction, dateFilter],
  });
};

const getUserDetailsAction = async (userId: string) => {
  return await api.get(`/admin/user-details/${userId}`);
}

export const useGetUserDetails = (userId: string): UseQueryResult<AxiosResponse<User>, AxiosError> => {
  return useQuery({
    queryKey: [FETCH_ORDER_QUERIES.FETCH_USER_DETAILS, userId],
    queryFn: () => getUserDetailsAction(userId),
    enabled: !!userId
  })
}

const getApplicationsAction = async ({ type, page = 1, limit = 10, column = "createdAt", direction = "DESC" }: FetchApplicationsParams): Promise<UserResponse> => {
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
}

export const useGetApplications = ({ type, page = 1, limit = 10, column = "createdAt", direction = "DESC" }: FetchApplicationsParams): UseQueryResult<UserResponse, AxiosError> => {
  return useQuery({
    queryFn: () => getApplicationsAction({ type, page, limit, column, direction }),
    queryKey: [FETCH_ORDER_QUERIES.FETCH_ALL_APPLICATIONS, type, page, limit, column, direction],
  });
}

const fetchUserLocationAction = async (): Promise<UserCoords> => {
  const response: AxiosResponse<UserCoords> = await api.get('/admin/users/location', {
    params: {
    }
  });
  return response.data;
}

export const useFetchUserLocations = (): UseQueryResult<UserCoords, AxiosError> => {
  return useQuery({
    queryFn: fetchUserLocationAction,
    queryKey: [FETCH_ORDER_QUERIES.FETCH_USER_LOCATIONS],
  });
}

export const useFetchOrderDetails = (id: string) => {
  return useQuery<OrderDetails, Error>({
    queryFn: () => getOrderDetails(id),
    queryKey: ["FETCH_ORDER_DETAILS", id],
    enabled: !!id,
  });
};


const getOrderDetails = async (id: string): Promise<OrderDetails> => {
  const response: AxiosResponse<OrderDetails> = await api.get(`/admin/orders/${id}`);
  return response.data;
};

const getAllCoupons = async (params :FetchCouponParams) => {
  const response: AxiosResponse = await api.get('/admin/coupons/all', { params });
  return response.data;
}

export const useGetAllCoupons = (params:FetchCouponParams) => {
  return useQuery({
    queryFn: () =>  getAllCoupons(params),
    queryKey: [FETCH_ORDER_QUERIES.FETCH_ALL_COUPONS]
  })
}

const getCouponUsageAction = async (couponId: string) => {
  const response: AxiosResponse = await api.get(`/admin/coupons/${couponId}/usage`);
  return response.data;
}

export const useGetCouponUsage = (couponId: string) => {
  return useQuery({
    queryFn: () => getCouponUsageAction(couponId),
    queryKey: [FETCH_ORDER_QUERIES.FETCH_COUPON_USAGE, couponId],
    enabled: !!couponId
  })
}

export const getDriverTipsAction = async (driverId: string, params: getRiderTipsParams) => {
  const response: AxiosResponse = await api.get(`/admin/driver-tips/${driverId}`, { params });
  return response.data;
}

// export const useGetDriverTips = (driverId: string, params: getRiderTipsParams) => {
//   return useQuery({
//     queryFn: () => getDriverTipsAction(driverId, params),
//     queryKey: [FETCH_ORDER_QUERIES.FETCH_DRIVER_TIPS, driverId],
//     enabled: !!params.startDate && !!params.endDate
//   })
// }

const fetchAllTips = async (params: FetchCouponParams) => {
  const response: AxiosResponse = await api.get(`/admin/tips/all`, { params });
  return response.data;
}

export const useFetchAllTips = (params: FetchCouponParams) => {
  return useQuery({
    queryFn: () => fetchAllTips(params),
    queryKey: [FETCH_ORDER_QUERIES.FETCH_ALL_TIPS]
  })
}


