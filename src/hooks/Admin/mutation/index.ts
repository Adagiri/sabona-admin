import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../services/api-service";
import useAuthStore from "../../../store/Auth";
import { UserCredentials, UserLoginResponse } from "../interface";
import { AxiosResponse } from "axios";
import { FETCH_ORDER_QUERIES } from "../query";

const LoginUser = async (creds: UserCredentials) => {
    const { phone, password } = creds;
    const response: AxiosResponse<UserLoginResponse> = await api.post("/auth/login", { phone, password });
    return response.data;
};


export const useLoginUser = () => {
    const setToken = useAuthStore(store => store.setToken);
    return useMutation({
        mutationFn: (creds: UserCredentials) => LoginUser(creds),
        onSuccess: (res) => {
            setToken(res.token);
        }
    })
}

const approveApplicationAction = async (userId: string) => {
    const response: AxiosResponse = await api.post(`/admin/application/approve/${userId}`);
    return response.data;
}

export const useApproveApplication = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId: string) => approveApplicationAction(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey : FETCH_ORDER_QUERIES.FETCH_ALL_APPLICATIONS});
        }
    })
}