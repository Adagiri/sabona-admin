import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api-service';

export const useFetchAllLaundries = () => {
  return useQuery({
    queryKey: ['laundries'],
    queryFn: async () => {
      const response = await api.get('/admin/laundries');
      return response.data;
    },
  });
};

export const useFetchLaundryById = (laundryId: string) => {
  return useQuery({
    queryKey: ['laundry', laundryId],
    queryFn: async () => {
      const response = await api.get(`/admin/laundry/${laundryId}`);
      return response.data;
    },
    enabled: !!laundryId,
  });
};

export const useFetchLaundryServices = (laundryId: string) => {
  return useQuery({
    queryKey: ['laundry-services', laundryId],
    queryFn: async () => {
      const response = await api.get(`/admin/laundry/${laundryId}/services`);
      return response.data;
    },
    enabled: !!laundryId,
  });
};

export const useFetchLaundryServiceItems = (
  laundryId: string,
  serviceId: string
) => {
  return useQuery({
    queryKey: ['laundry-service-items', laundryId, serviceId],
    queryFn: async () => {
      const response = await api.get(
        `/admin/laundry/${laundryId}/service/${serviceId}/items`
      );
      return response.data;
    },
    enabled: !!laundryId && !!serviceId,
  });
};

export const useFetchCategories = () => {
  return useQuery({
    queryKey: ['laundry-categories'],
    queryFn: async () => {
      const response = await api.get('/admin/categories');
      return response.data;
    },
  });
};

export const useFetchCategoryById = (categoryId: string) => {
  return useQuery({
    queryKey: ['laundry-category', categoryId],
    queryFn: async () => {
      const response = await api.get(`/admin/category/${categoryId}`);
      return response.data;
    },
    enabled: !!categoryId,
  });
};

// Laundry Mutation Hooks

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
      queryClient.invalidateQueries({ queryKey: ['laundries'] });
    },
  });
};

export const useDeleteLaundry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (laundryId: string) => {
      const response = await api.delete(
        `/admin/laundry/${laundryId}/delete`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laundries'] });
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
        queryKey: ['laundry-services', variables.laundryId],
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
        queryKey: ['laundry-services', variables.laundryId],
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
        queryKey: ['laundry-services', variables.laundryId],
      });
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
          'laundry-service-items',
          variables.laundryId,
          variables.serviceId,
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
          'laundry-service-items',
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
          'laundry-service-items',
          variables.laundryId,
          variables.serviceId,
        ],
      });
    },
  });
};

// Category Management Hooks

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/admin/category/create', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laundry-categories'] });
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
      const response = await api.patch(
        `/admin/category/${categoryId}/edit`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laundry-categories'] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string) => {
      const response = await api.delete(
        `/admin/category/${categoryId}/delete`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laundry-categories'] });
    },
  });
};

// Reordering Hooks

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
        queryKey: ['laundry-services', variables.laundryId],
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
          'laundry-service-items',
          variables.laundryId,
          variables.serviceId,
        ],
      });
    },
  });
};
