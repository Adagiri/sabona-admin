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
