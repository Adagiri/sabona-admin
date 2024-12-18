import { useQuery, UseQueryResult } from "@tanstack/react-query"
import api from "../../../services/api-service"
import { OrdersResponse, USER_TYPES, UserResponse } from "../interface"
import { AxiosError, AxiosResponse } from "axios"

export const FETCH_ORDER_QUERIES = {
    FETCH_ALL_ORDERS: 'FETCH_ALL_ORDERS',
    FETCH_ALL_USERS: 'FETCH_ALL_USERS'
}

const getAllOrders = async () => {
    const response: AxiosResponse<OrdersResponse> = await api.get('/admin/orders/all')
    return response.data;
}

export const useFetchAllOrders = () => {
    return useQuery({
        queryFn: getAllOrders,
        queryKey: [FETCH_ORDER_QUERIES.FETCH_ALL_ORDERS]
    })
}

const getAllUsers = async (type: keyof typeof USER_TYPES): Promise<UserResponse> => {
    const response: AxiosResponse<UserResponse> = await api.get(`/admin/users/all?type=${type}`);
    return response.data;
};

export const useFetchAllUsers = (type: keyof typeof USER_TYPES): UseQueryResult<UserResponse, AxiosError> => {
    return useQuery({
        queryFn: () => getAllUsers(type),
        queryKey: [FETCH_ORDER_QUERIES.FETCH_ALL_USERS, type]
    })
}