export const getOrderDetailsRoute = (
  orderId: string,
  orderType: 'REGISTERED_LAUNDRY' | 'CUSTOM_LAUNDRY',
  start?: string,
  end?: string
) => {
  if (orderType === 'CUSTOM_LAUNDRY') {
    return `/custom-order-details/${orderId}`;
  }

  // Regular order route with optional query params
  const params = start && end ? `/${start}&${end}` : '';
  return `/order-details/${orderId}${params}`;
};

export const navigateToOrderDetails = (
  navigate: any,
  orderId: string,
  orderType: 'REGISTERED_LAUNDRY' | 'CUSTOM_LAUNDRY',
  start?: string,
  end?: string
) => {
  const route = getOrderDetailsRoute(orderId, orderType, start, end);
  navigate(route);
};

export const getOrderTypeLabel = (
  orderType: 'REGISTERED_LAUNDRY' | 'CUSTOM_LAUNDRY'
): string => {
  return orderType === 'CUSTOM_LAUNDRY' ? 'Custom' : 'Regular';
};

export const getOrderTypeBadgeColor = (
  orderType: 'REGISTERED_LAUNDRY' | 'CUSTOM_LAUNDRY'
) => {
  return orderType === 'CUSTOM_LAUNDRY' ? 'secondary' : 'primary';
};
