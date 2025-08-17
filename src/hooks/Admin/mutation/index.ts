import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../services/api-service";
import useAuthStore from "../../../store/Auth";
import { CreateCouponRequest, MediaId, UploadImage, UserCredentials, UserLoginResponse } from "../interface";
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

// const approveApplicationAction = async (userId: string) => {
//     const response: AxiosResponse = await api.post(`/admin/application/approve/${userId}`);
//     return response.data;
// }

// export const useApproveApplication = () => {
//     const queryClient = useQueryClient();
//     return useMutation({
//         mutationFn: (userId: string) => approveApplicationAction(userId),
//         onSuccess: () => {
//             queryClient.invalidateQueries({ queryKey: FETCH_ORDER_QUERIES.FETCH_ALL_APPLICATIONS });
//         }
//     })
// }

const uploadImage = async (body: UploadImage) => {
    const response: AxiosResponse = await api.post(`/media/application/init`, body);
    return response.data;
};

export const useUploadImage = () => {
    return useMutation({
        mutationFn: async (body: UploadImage) => uploadImage(body),
    });
};

const deleteMediaAction = async (mediaId: number) => {
    return await api.delete(`/media/${mediaId}`);
}

export const useDeleteMedia = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (mediaId: number) => deleteMediaAction(mediaId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [FETCH_ORDER_QUERIES.FETCH_ALL_USERS,FETCH_ORDER_QUERIES.FETCH_USER_DETAILS] });
        },
        onError: (err) => {
            console.error(err.message)
        }
    });
}

const finaliseUploadImage = async (body: MediaId) => {
    console.log(body);
    const response: AxiosResponse = await api.post('/media/application/finalize', body);
    return response.data;
};

export const useFinaliseUploadImage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: MediaId) => finaliseUploadImage(body),
        onSuccess: () => {
            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: FETCH_ORDER_QUERIES.FETCH_ALL_USERS });
            }, 2000);
        }
    });
};

const createCouponAction = async (body: CreateCouponRequest) => {
    const response : AxiosResponse = await api.post("/admin/create/coupon",body);
    return response.data;
}

export const useCreateCoupon = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: CreateCouponRequest) => createCouponAction(body),
        onError: (err) => {
            console.error(err.message)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: FETCH_ORDER_QUERIES.FETCH_ALL_COUPONS });
        }
    })
}


export const useFinaliseApplicationDocument = () => {
  return useMutation({
    mutationFn: async ({ userId, documentType, uploadId }: any) => {
      const response = await api.put(`/admin/application/documents/${userId}/finalize`, {
        documentType,
        uploadId
      });
      return response.data;
    }
  });
};

export const useApproveApplication = () => {
  return useMutation({
    mutationFn: async ({
      userId,
      mainVendorId,
      address,
      contactPhone,
    }: {
      userId: string;
      mainVendorId: string;
      address: string;
      contactPhone: string;
    }) => {
      const response = await api.post(`/admin/application/approve/${userId}`, {
        mainVendorId,
        address,
        contactPhone,
      });
      return response.data;
    },
  });
};

// Corrected rejection mutation
export const useRejectApplication = () => {
  return useMutation({
    mutationFn: async ({
      userId,
      rejectionReason,
    }: {
      userId: string;
      rejectionReason: string;
    }) => {
      const response = await api.post(`/admin/application/reject/${userId}`, {
        rejectionReason, // Backend expects this field name
      });
      return response.data;
    },
  });
};

// Document upload mutation (submits media IDs)
export const useUploadApplicationDocument = () => {
  return useMutation({
    mutationFn: async ({
      userId,
      vatNumberDocId,
      businessCertDocId,
    }: {
      userId: string;
      vatNumberDocId: string;
      businessCertDocId: string;
    }) => {
      const response = await api.post(
        `/admin/application/documents/${userId}`,
        {
          vatNumberDocId,
          businessCertDocId,
        }
      );
      return response.data;
    },
  });
};