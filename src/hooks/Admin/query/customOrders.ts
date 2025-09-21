import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api-service';
import { AxiosResponse } from 'axios';

export const CUSTOM_ORDER_QUERIES = {
  FETCH_CUSTOM_ORDER_DETAILS: 'FETCH_CUSTOM_ORDER_DETAILS',
  FETCH_CUSTOM_ORDER_STATS: 'FETCH_CUSTOM_ORDER_STATS',
  FETCH_AVAILABLE_DRIVERS: 'FETCH_AVAILABLE_DRIVERS',
  FETCH_ALL_CUSTOM_ORDERS: 'FETCH_ALL_CUSTOM_ORDERS',
};

// Custom order details fetching
const getCustomOrderDetails = async (orderId: string) => {
  const response: AxiosResponse<any> = await api.get(
    `/admin/custom-order/${orderId}/details`
  );
  return response.data;
};

export const useFetchCustomOrderDetails = (orderId: string) => {
  return useQuery({
    queryFn: () => getCustomOrderDetails(orderId),
    queryKey: [CUSTOM_ORDER_QUERIES.FETCH_CUSTOM_ORDER_DETAILS, orderId],
    enabled: !!orderId,
  });
};

// Custom order statistics
const getCustomOrderStats = async () => {
  const response: AxiosResponse<any> = await api.get(
    '/admin/custom-order/stats'
  );
  return response.data;
};

export const useFetchCustomOrderStats = () => {
  return useQuery({
    queryFn: getCustomOrderStats,
    queryKey: [CUSTOM_ORDER_QUERIES.FETCH_CUSTOM_ORDER_STATS],
  });
};

// Available drivers for custom order
const getAvailableDriversForCustomOrder = async (orderId: string) => {
  const response: AxiosResponse<any> = await api.get(
    `/admin/custom-order/${orderId}/available-drivers`
  );
  return response.data;
};

export const useFetchAvailableDrivers = (orderId: string) => {
  return useQuery({
    queryFn: () => getAvailableDriversForCustomOrder(orderId),
    queryKey: [CUSTOM_ORDER_QUERIES.FETCH_AVAILABLE_DRIVERS, orderId],
    enabled: !!orderId,
  });
};

// Fetch all custom orders with filtering
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
    queryKey: [CUSTOM_ORDER_QUERIES.FETCH_ALL_CUSTOM_ORDERS, params],
  });
};
