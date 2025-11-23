// File: src/hooks/Admin/mutation.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../services/api-service';
import useAuthStore from '../../../store/Auth';
import { toast } from 'react-toastify';
import {
  CreateCouponRequest,
  MediaId,
  UploadImage,
  UserCredentials,
  UserLoginResponse,
} from '../interface';
import { AxiosResponse } from 'axios';
import { FETCH_ORDER_QUERIES } from '../query';

const LoginUser = async (creds: UserCredentials) => {
  const { phone, password } = creds;
  const response: AxiosResponse<UserLoginResponse> = await api.post(
    '/auth/login',
    { phone, password }
  );
  return response.data;
};

export const useLoginUser = () => {
  const setToken = useAuthStore((store) => store.setToken);
  return useMutation({
    mutationFn: (creds: UserCredentials) => LoginUser(creds),
    onSuccess: (res) => {
      setToken(res.token);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Login failed';
      toast.error(message);
    },
  });
};

const uploadImage = async (body: UploadImage) => {
  const response: AxiosResponse = await api.post(
    `/media/application/init`,
    body
  );
  return response.data;
};

export const useUploadImage = () => {
  return useMutation({
    mutationFn: async (body: UploadImage) => uploadImage(body),
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to upload image';
      toast.error(message);
    },
  });
};

const deleteMediaAction = async (mediaId: number) => {
  return await api.delete(`/media/${mediaId}`);
};

export const useDeleteMedia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mediaId: number) => deleteMediaAction(mediaId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          FETCH_ORDER_QUERIES.FETCH_ALL_USERS,
          FETCH_ORDER_QUERIES.FETCH_USER_DETAILS,
        ],
      });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to delete media';
      toast.error(message);
    },
  });
};

const finaliseUploadImage = async (body: MediaId) => {
  console.log(body);
  const response: AxiosResponse = await api.post(
    '/media/application/finalize',
    body
  );
  return response.data;
};

export const useFinaliseUploadImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: MediaId) => finaliseUploadImage(body),
    onSuccess: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: [FETCH_ORDER_QUERIES.FETCH_ALL_USERS],
        });
      }, 2000);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to finalize image upload';
      toast.error(message);
    },
  });
};

const createCouponAction = async (body: CreateCouponRequest) => {
  const response: AxiosResponse = await api.post('/admin/create/coupon', body);
  return response.data;
};

export const useCreateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCouponRequest) => createCouponAction(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [FETCH_ORDER_QUERIES.FETCH_ALL_COUPONS],
      });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to create coupon';
      toast.error(message);
    },
  });
};

export const useFinaliseApplicationDocument = () => {
  return useMutation({
    mutationFn: async ({ userId, documentType, uploadId }: any) => {
      const response = await api.put(
        `/admin/application/documents/${userId}/finalize`,
        {
          documentType,
          uploadId,
        }
      );
      return response.data;
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to finalize document';
      toast.error(message);
    },
  });
};

export const useApproveApplication = () => {
  return useMutation({
    mutationFn: async ({
      userId,
      mainVendorId,
      addressLocale,

      contactPhone,
    }: {
      userId: string;
      mainVendorId: string;
      addressLocale: { en: string; ar: string };
      contactPhone: string;
    }) => {
      const response = await api.post(`/admin/application/approve/${userId}`, {
        mainVendorId,
        addressLocale,

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

// ==================== LAUNDRY MANAGEMENT MUTATIONS ====================

export const useEditLaundry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      laundryId,
      data,
    }: {
      laundryId: string;
      data: any;
    }) => {
      const response = await api.patch(
        `/admin/laundry/${laundryId}/edit`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [FETCH_ORDER_QUERIES.FETCH_ALL_LAUNDRIES],
      });
      queryClient.invalidateQueries({
        queryKey: [FETCH_ORDER_QUERIES.FETCH_LAUNDRY_BY_ID],
      });
    },
  });
};

export const useDeleteLaundry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (laundryId: string) => {
      const response = await api.delete(`/admin/laundry/${laundryId}/delete`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [FETCH_ORDER_QUERIES.FETCH_ALL_LAUNDRIES],
      });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to delete laundry';
      toast.error(message);
    },
  });
};

// Service Management Hooks

export const useCreateLaundryService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      laundryId,
      data,
    }: {
      laundryId: string;
      data: any;
    }) => {
      const response = await api.post(
        `/admin/laundry/${laundryId}/service/create`,
        data
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          FETCH_ORDER_QUERIES.FETCH_LAUNDRY_SERVICES,
          variables.laundryId,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [FETCH_ORDER_QUERIES.FETCH_ALL_LAUNDRIES],
      });
    },
  });
};

export const useEditLaundryService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      laundryId,
      serviceId,
      data,
    }: {
      laundryId: string;
      serviceId: string;
      data: any;
    }) => {
      const response = await api.patch(
        `/admin/laundry/${laundryId}/service/${serviceId}/edit`,
        data
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          FETCH_ORDER_QUERIES.FETCH_LAUNDRY_SERVICES,
          variables.laundryId,
        ],
      });
    },
  });
};

export const useDeleteLaundryService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      laundryId,
      serviceId,
    }: {
      laundryId: string;
      serviceId: string;
    }) => {
      const response = await api.delete(
        `/admin/laundry/${laundryId}/service/${serviceId}/delete`
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          FETCH_ORDER_QUERIES.FETCH_LAUNDRY_SERVICES,
          variables.laundryId,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [FETCH_ORDER_QUERIES.FETCH_ALL_LAUNDRIES],
      });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to delete service';
      toast.error(message);
    },
  });
};

// Service Item Management Hooks

export const useCreateLaundryServiceItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      laundryId,
      serviceId,
      data,
    }: {
      laundryId: string;
      serviceId: string;
      data: any;
    }) => {
      const response = await api.post(
        `/admin/laundry/${laundryId}/service/${serviceId}/item`,
        data
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          FETCH_ORDER_QUERIES.FETCH_LAUNDRY_SERVICE_ITEMS,
          variables.laundryId,
          variables.serviceId,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [
          FETCH_ORDER_QUERIES.FETCH_LAUNDRY_SERVICES,
          variables.laundryId,
        ],
      });
    },
  });
};

export const useEditLaundryServiceItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      laundryId,
      serviceId,
      itemId,
      data,
    }: {
      laundryId: string;
      serviceId: string;
      itemId: string;
      data: any;
    }) => {
      const response = await api.patch(
        `/admin/laundry/${laundryId}/service/${serviceId}/item/${itemId}/edit`,
        data
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          FETCH_ORDER_QUERIES.FETCH_LAUNDRY_SERVICE_ITEMS,
          variables.laundryId,
          variables.serviceId,
        ],
      });
    },
  });
};

export const useDeleteLaundryServiceItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      laundryId,
      serviceId,
      itemId,
    }: {
      laundryId: string;
      serviceId: string;
      itemId: string;
    }) => {
      const response = await api.delete(
        `/admin/laundry/${laundryId}/service/${serviceId}/item/${itemId}/delete`
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          FETCH_ORDER_QUERIES.FETCH_LAUNDRY_SERVICE_ITEMS,
          variables.laundryId,
          variables.serviceId,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [
          FETCH_ORDER_QUERIES.FETCH_LAUNDRY_SERVICES,
          variables.laundryId,
        ],
      });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to delete service item';
      toast.error(message);
    },
  });
};

// Category Management Hooks

export const useUploadRiderDocument = () => {
  return useMutation({
    mutationFn: async ({
      userId,
      driverLicenseDocId,
    }: {
      userId: string;
      driverLicenseDocId: string;
    }) => {
      const response = await api.post(`/admin/rider/documents/${userId}`, {
        driverLicenseDocId,
      });
      return response.data;
    },
  });
};

export const useFinaliseRiderDocument = () => {
  return useMutation({
    mutationFn: async ({ userId, documentType, uploadId }: any) => {
      const response = await api.put(
        `/admin/rider/documents/${userId}/finalize`,
        {
          documentType,
          uploadId,
        }
      );
      return response.data;
    },
  });
};

// Icon Management Hooks

export const useCreateIcon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/icon/create', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-icons'] });
    },
  });
};

export const useEditIcon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ iconId, data }: { iconId: number; data: any }) => {
      const response = await api.patch(`/icon/${iconId}/edit`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-icons'] });
    },
  });
};

export const useDeleteIcon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (iconId: number) => {
      const response = await api.delete(`/icon/${iconId}/delete`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-icons'] });
    },
  });
};

// Category Management Hooks - Fix inconsistent endpoints
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      // Use consistent v1/admin prefix
      const response = await api.post('/admin/category/create', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [FETCH_ORDER_QUERIES.FETCH_LAUNDRY_CATEGORIES],
      });
    },
  });
};

export const useEditCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      categoryId,
      data,
    }: {
      categoryId: string;
      data: any;
    }) => {
      // Use consistent v1/admin prefix
      const response = await api.patch(
        `/admin/category/${categoryId}/edit`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [FETCH_ORDER_QUERIES.FETCH_LAUNDRY_CATEGORIES],
      });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string) => {
      // Use consistent v1/admin prefix
      const response = await api.delete(`/admin/category/${categoryId}/delete`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [FETCH_ORDER_QUERIES.FETCH_LAUNDRY_CATEGORIES],
      });
    },
  });
};

// Admin Settings Management
export interface UpdateAdminSettingsRequest {
  vatRate?: number;
  vatEnabled?: boolean;
  serviceChargeType?: string;
  serviceChargeRate?: number;
  customOrderServiceChargeRate?: number;
  deliveryBaseRate?: number;
  deliveryPerKmRate?: number;
  freeDeliveryThreshold?: number;
  expressMultiplier?: number;
  maxDeliveryDistance?: number;
  transferChargeType?: string;
  transferChargeRate?: number;
}

export const useUpdateAdminSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateAdminSettingsRequest) => {
      const response = await api.patch('/admin/settings', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['FETCH_ADMIN_SETTINGS'],
      });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      reason,
    }: {
      userId: string;
      reason?: string;
    }) => {
      const response = await api.delete(`/admin/users/${userId}`, {
        data: { reason },
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all user-related queries
      queryClient.invalidateQueries({
        queryKey: [FETCH_ORDER_QUERIES.FETCH_ALL_USERS],
      });
      queryClient.invalidateQueries({
        queryKey: [FETCH_ORDER_QUERIES.FETCH_USER_DETAILS],
      });
      queryClient.invalidateQueries({
        queryKey: [FETCH_ORDER_QUERIES.FETCH_ALL_APPLICATIONS],
      });
    },
  });
};

// Reordering Hooks for Services and Items

export const useReorderLaundryServices = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      laundryId,
      serviceIds,
    }: {
      laundryId: string;
      serviceIds: string[];
    }) => {
      const response = await api.patch(
        `/admin/laundry/${laundryId}/services/reorder`,
        { serviceIds }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [FETCH_ORDER_QUERIES.FETCH_LAUNDRY_SERVICES, variables.laundryId],
      });
    },
  });
};

export const useReorderLaundryServiceItems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      laundryId,
      serviceId,
      categoryId,
      itemIds,
    }: {
      laundryId: string;
      serviceId: string;
      categoryId: string;
      itemIds: string[];
    }) => {
      const response = await api.patch(
        `/admin/laundry/${laundryId}/service/${serviceId}/category/${categoryId}/items/reorder`,
        { itemIds }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          FETCH_ORDER_QUERIES.FETCH_LAUNDRY_SERVICE_ITEMS,
          variables.laundryId,
          variables.serviceId,
        ],
      });
    },
  });
};
