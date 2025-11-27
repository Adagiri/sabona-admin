import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api-service';
import { toast } from 'react-toastify';

// ==================== CUSTOM ORDERS QUERY HOOKS ====================

export const useFetchCustomOrders = () => {
  return useQuery({
    queryKey: ['custom-orders'],
    queryFn: async () => {
      const response = await api.get('/admin/custom-orders');
      return response.data;
    },
  });
};

export const useFetchCustomOrderById = (orderId: string) => {
  return useQuery({
    queryKey: ['custom-order', orderId],
    queryFn: async () => {
      const response = await api.get(`/admin/custom-order/${orderId}`);
      return response.data.data;
    },
    enabled: !!orderId,
  });
};

export const useFetchCustomOrderStats = () => {
  return useQuery({
    queryKey: ['custom-orders-stats'],
    queryFn: async () => {
      const response = await api.get('/admin/custom-orders/dashboard-stats');
      return response.data;
    },
  });
};

export const useFetchPendingCustomOrders = () => {
  return useQuery({
    queryKey: ['custom-orders-pending'],
    queryFn: async () => {
      const response = await api.get('/admin/custom-orders/pending');
      return response.data;
    },
  });
};

export const useFetchAvailableDriversForCustomOrder = (orderId: string) => {
  return useQuery({
    queryKey: ['custom-order-available-drivers', orderId],
    queryFn: async () => {
      const response = await api.get(
        `/admin/custom-order/${orderId}/available-drivers`
      );
      return response.data;
    },
    enabled: !!orderId,
  });
};

export const useFetchCustomOrderWorkflowStatus = (orderId: string) => {
  return useQuery({
    queryKey: ['custom-order-workflow', orderId],
    queryFn: async () => {
      const response = await api.get(
        `/admin/custom-order/${orderId}/workflow-status`
      );
      return response.data;
    },
    enabled: !!orderId,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
};

export const useSearchCustomOrders = (query: string) => {
  return useQuery({
    queryKey: ['custom-orders-search', query],
    queryFn: async () => {
      const response = await api.get(`/admin/custom-orders/search`, {
        params: { q: query },
      });
      return response.data;
    },
    enabled: query.length >= 2,
  });
};

// ==================== CUSTOM ORDERS MUTATION HOOKS ====================

export const useUpdateCustomOrderPricing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      adminServiceCharge,
      totalAmount,
      estimatedVendorCost,
      notes,
    }: {
      orderId: string;
      adminServiceCharge: number;
      totalAmount: number;
      estimatedVendorCost?: number;
      notes?: string;
    }) => {
      const response = await api.patch(
        `/admin/custom-order/${orderId}/pricing`,
        {
          adminServiceCharge,
          totalAmount,
          estimatedVendorCost,
          notes,
        }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['custom-orders'] });
      queryClient.invalidateQueries({
        queryKey: ['custom-order', variables.orderId],
      });
      queryClient.invalidateQueries({ queryKey: ['custom-orders-stats'] });
      queryClient.invalidateQueries({ queryKey: ['custom-orders-pending'] });
    },
  });
};

export const useAssignDriverToCustomOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      riderId,
    }: {
      orderId: string;
      riderId: string;
    }) => {
      const response = await api.post(
        `/admin/custom-order/${orderId}/assign-driver`,
        {
          riderId,
        }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['custom-orders'] });
      queryClient.invalidateQueries({
        queryKey: ['custom-order', variables.orderId],
      });
      queryClient.invalidateQueries({ queryKey: ['custom-orders-stats'] });
      queryClient.invalidateQueries({ queryKey: ['custom-orders-pending'] });
      queryClient.invalidateQueries({
        queryKey: ['custom-order-workflow', variables.orderId],
      });
    },
  });
};

// export const useMarkCustomOrderReadyForDelivery = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async ({
//       orderId,
//       deliveryRiderId,
//     }: {
//       orderId: string;
//       deliveryRiderId?: string;
//     }) => {
//       const response = await api.post(
//         `/admin/custom-order/${orderId}/mark-ready-for-delivery`,
//         {
//           deliveryRiderId,
//         }
//       );
//       return response.data;
//     },
//     onSuccess: (_, variables) => {
//       queryClient.invalidateQueries({ queryKey: ['custom-orders'] });
//       queryClient.invalidateQueries({
//         queryKey: ['custom-order', variables.orderId],
//       });
//       queryClient.invalidateQueries({ queryKey: ['custom-orders-stats'] });
//       queryClient.invalidateQueries({ queryKey: ['custom-orders-pending'] });
//       queryClient.invalidateQueries({
//         queryKey: ['custom-order-workflow', variables.orderId],
//       });
//     },
//   });
// };

export const useSendCustomOrderInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await api.post(
        `/admin/custom-order/${orderId}/send-invoice`
      );
      return response.data;
    },
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['custom-orders'] });
      queryClient.invalidateQueries({ queryKey: ['custom-order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['custom-orders-stats'] });
      queryClient.invalidateQueries({ queryKey: ['custom-orders-pending'] });
      queryClient.invalidateQueries({
        queryKey: ['custom-order-workflow', orderId],
      });
    },
  });
};

export const useResendCustomOrderInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await api.post(
        `/admin/custom-order/${orderId}/resend-invoice`
      );
      return response.data;
    },
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['custom-order', orderId] });
    },
  });
};

export const useCancelCustomOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      reason,
    }: {
      orderId: string;
      reason: string;
    }) => {
      const response = await api.patch(
        `/admin/custom-order/${orderId}/cancel`,
        {
          reason,
        }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['custom-orders'] });
      queryClient.invalidateQueries({
        queryKey: ['custom-order', variables.orderId],
      });
      queryClient.invalidateQueries({ queryKey: ['custom-orders-stats'] });
      queryClient.invalidateQueries({ queryKey: ['custom-orders-pending'] });
    },
  });
};

export const useUpdateCustomOrderNotes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      notes,
    }: {
      orderId: string;
      notes: string;
    }) => {
      const response = await api.patch(`/admin/custom-order/${orderId}/notes`, {
        notes,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['custom-order', variables.orderId],
      });
    },
  });
};

// ==================== EXPORT CUSTOM ORDERS DATA ====================

export const useExportCustomOrdersData = () => {
  return useMutation({
    mutationFn: async ({
      startDate,
      endDate,
      status,
      format = 'csv',
    }: {
      startDate?: string;
      endDate?: string;
      status?: string;
      format?: 'csv' | 'excel';
    }) => {
      const response = await api.get('/admin/custom-orders/export', {
        params: {
          startDate,
          endDate,
          status,
          format,
        },
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `custom-orders-${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return response.data;
    },
  });
};

// ==================== CUSTOM ORDERS ANALYTICS ====================

export const useFetchCustomOrdersAnalytics = (timeRange: string = '30d') => {
  return useQuery({
    queryKey: ['custom-orders-analytics', timeRange],
    queryFn: async () => {
      const response = await api.get('/admin/custom-orders/analytics', {
        params: { timeRange },
      });
      return response.data;
    },
  });
};

export const useMarkCustomOrderReadyForDelivery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      deliveryRiderId,
    }: {
      orderId: string;
      deliveryRiderId: string;
    }) => {
      const response = await api.post(
        `/admin/custom-order/${orderId}/mark-ready-for-delivery`,
        { deliveryRiderId }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['custom-orders'] });
      queryClient.invalidateQueries({
        queryKey: ['custom-order', variables.orderId],
      });
      toast.success('Delivery driver assigned successfully');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to assign delivery driver'
      );
    },
  });
};

export const useUploadCustomOrderReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      receiptImageId, // Changed from receiptFile
      vendorName,
      amountPaid,
      paymentMethod,
      notes,
    }: {
      orderId: string;
      receiptImageId?: string; // mediaId from S3 upload
      vendorName: string;
      amountPaid: number;
      paymentMethod: string;
      notes?: string;
    }) => {
      // Send JSON, not FormData
      const response = await api.post(
        `/admin/custom-order/${orderId}/upload-receipt`,
        {
          receiptImageId, // Send mediaId
          vendorName,
          amountPaid,
          paymentMethod,
          notes,
        }
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      console.log(typeof data);
      queryClient.invalidateQueries({
        queryKey: ['custom-order', variables.orderId],
      });
      toast.success('Receipt uploaded successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to upload receipt');
    },
  });
};
