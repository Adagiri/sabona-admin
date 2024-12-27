import { useQuery, UseQueryResult } from "@tanstack/react-query"
import api from "../../../services/api-service"
import { FetchApplicationsParams, FetchOrdersParams, FetchUsersParams, OrderDetails, OrdersResponse, UserCoords, UserResponse } from "../interface"
import { AxiosError, AxiosResponse } from "axios"

export const FETCH_ORDER_QUERIES = {
    FETCH_ALL_ORDERS: 'FETCH_ALL_ORDERS',
    FETCH_ALL_USERS: 'FETCH_ALL_USERS',
    FETCH_ALL_APPLICATIONS: 'FETCH_ALL_APPLICATIONS',
    FETCH_USER_LOCATIONS : 'FETCH_USER_LOCATIONS',
    FETCH_ORDER_DETAILS:'FETCH_ORDER_DETAILS'
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

const getAllUsers = async ({ type, page = 1, limit = 10, column="createdAt" , direction="DESC", dateFilter }: FetchUsersParams): Promise<UserResponse> => {
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
  
  export const useFetchAllUsers = ({ type, page = 1, limit = 10, column="createdAt" , direction="DESC", dateFilter}: FetchUsersParams): UseQueryResult<UserResponse, AxiosError> => {
    return useQuery({
      queryFn: () => getAllUsers({ type, page, limit, column, direction, dateFilter }),
      queryKey: [FETCH_ORDER_QUERIES.FETCH_ALL_USERS, type, page, limit, column, direction, dateFilter],
    });
  };

  const getApplicationsAction = async({ type, page = 1, limit = 10, column="createdAt" , direction="DESC" }: FetchApplicationsParams): Promise<UserResponse> => {
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

  export const useGetApplications = ({ type, page = 1, limit = 10,column="createdAt" , direction="DESC" }: FetchApplicationsParams): UseQueryResult<UserResponse, AxiosError> => {
    return useQuery({
      queryFn: () => getApplicationsAction({ type, page, limit, column, direction }),
      queryKey: [FETCH_ORDER_QUERIES.FETCH_ALL_APPLICATIONS, type, page, limit, column, direction],
    });
  }

  const fetchUserLocationAction = async (): Promise<UserCoords> => {
    const response:  AxiosResponse<UserCoords> = await api.get('/admin/users/location', {
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
  

