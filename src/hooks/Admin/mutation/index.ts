import { useMutation } from "@tanstack/react-query";
import api from "../../../services/api-service";
import useAuthStore from "../../../store/Auth";
import { UserCredentials, UserLoginResponse } from "../interface";
import { AxiosResponse } from "axios";

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