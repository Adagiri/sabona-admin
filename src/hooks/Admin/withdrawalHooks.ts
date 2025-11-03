
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api-service';
import { toast } from 'react-toastify';

export const WITHDRAWAL_QUERIES = {
  FETCH_PRE_WITHDRAWALS: 'FETCH_PRE_WITHDRAWALS',
  FETCH_COMPLETED_WITHDRAWALS: 'FETCH_COMPLETED_WITHDRAWALS',
  FETCH_WITHDRAWAL_DETAILS: 'FETCH_WITHDRAWAL_DETAILS',
};


// interface WithdrawalLaundry {
//   id: string;
//   laundryName: string;
//   branchType: string;
//   totalOrders: number;
//   totalEarnings: number;
//   hasInvoice: boolean;
//   invoiceUrl?: string;
//   invoiceUploadedAt?: string;
// }

// interface Withdrawal {
//   id: string;
//   withdrawalNumber: number;
//   startDate: string;
//   endDate: string;
//   completedAt?: string;
//   laundryCount: number;
//   totalAmount: number;
//   uploadedInvoices: number;
//   status: 'PENDING' | 'COMPLETED';
//   laundries?: WithdrawalLaundry[];
// }

interface UploadInvoiceRequest {
  withdrawalLaundryId: string;
  invoiceMediaId: string;
}

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Fetch all pre-withdrawals (pending status)
 */
export const useFetchPreWithdrawals = () => {
  return useQuery({
    queryKey: [WITHDRAWAL_QUERIES.FETCH_PRE_WITHDRAWALS],
    queryFn: async () => {
      const response = await api.get('/admin/withdrawals/pre-withdrawals');
      return response.data;
    },
  });
};

/**
 * Fetch all completed withdrawals
 */
export const useFetchCompletedWithdrawals = () => {
  return useQuery({
    queryKey: [WITHDRAWAL_QUERIES.FETCH_COMPLETED_WITHDRAWALS],
    queryFn: async () => {
      const response = await api.get('/admin/withdrawals/completed');
      return response.data;
    },
  });
};

/**
 * Fetch single withdrawal details by ID
 */
export const useFetchWithdrawalById = (
  id: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ['withdrawalById', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await api.get(`/admin/withdrawals/${id}`);
      return response.data;
    },
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
  });
};
// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Initiate new withdrawal
 */
export const useInitiateWithdrawal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.post('/admin/withdrawals/initiate');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [WITHDRAWAL_QUERIES.FETCH_PRE_WITHDRAWALS],
      });
      toast.success('Withdrawal initiated successfully');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Failed to initiate withdrawal';
      toast.error(message);
    },
  });
};

interface UploadInvoiceRequest {
  withdrawalLaundryId: string;
  invoiceMediaId: string;
}

export const useUploadLaundryInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UploadInvoiceRequest) => {
      const response = await api.post(
        '/admin/withdrawals/upload-invoice',
        data
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      console.log(typeof _, typeof variables);
      queryClient.invalidateQueries({
        queryKey: [WITHDRAWAL_QUERIES.FETCH_PRE_WITHDRAWALS],
      });
      // Also invalidate the specific withdrawal if we have the ID
      queryClient.invalidateQueries({
        queryKey: [WITHDRAWAL_QUERIES.FETCH_WITHDRAWAL_DETAILS],
      });
      toast.success('Invoice uploaded successfully');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Failed to upload invoice';
      toast.error(message);
    },
  });
};
/**
 * Complete withdrawal (move from pending to completed)
 */
export const useCompleteWithdrawal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (withdrawalId: string) => {
      const response = await api.post(
        `/admin/withdrawals/${withdrawalId}/complete`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [WITHDRAWAL_QUERIES.FETCH_PRE_WITHDRAWALS],
      });
      queryClient.invalidateQueries({
        queryKey: [WITHDRAWAL_QUERIES.FETCH_COMPLETED_WITHDRAWALS],
      });
      toast.success('Withdrawal completed successfully');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Failed to complete withdrawal';
      toast.error(message);
    },
  });
};

/**
 * Download laundry earning report (Excel)
 */
export const useDownloadLaundryReport = () => {
  return useMutation({
    mutationFn: async ({
      withdrawalId,
      laundryId,
      laundryName,
    }: {
      withdrawalId: string;
      laundryId: string;
      laundryName: string;
    }) => {
      const response = await api.get(
        `/admin/withdrawals/${withdrawalId}/laundry/${laundryId}/report`,
        {
          responseType: 'blob',
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${laundryName}-earnings.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return response.data;
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Failed to download report';
      toast.error(message);
    },
  });
};

export const useCancelWithdrawal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (withdrawalId: string) => {
      const response = await api.post(
        `/admin/withdrawals/${withdrawalId}/cancel`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['preWithdrawals'],
      });
      queryClient.invalidateQueries({
        queryKey: ['withdrawals'],
      });
      queryClient.invalidateQueries({
        queryKey: ['withdrawalById'],
      });
    },
  });
};