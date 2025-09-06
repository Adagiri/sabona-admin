export interface CustomOrderCustomer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface CustomOrderPickup {
  pickupDate: string;
  pickupTime: string;
  pickupAddress: string;
  pickupLat?: number;
  pickupLong?: number;
}

export interface CustomOrderDelivery {
  deliveryAddress: string;
  deliveryType: 'NORMAL' | 'EXPRESS';
  deliveryLat?: number;
  deliveryLong?: number;
}

export interface CustomOrderRider {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  rating?: number;
  totalOrders?: number;
  currentLat?: number;
  currentLong?: number;
  isAvailable: boolean;
  distanceFromPickup?: number;
  estimatedArrival?: string;
}

export interface CustomOrderRiderOrder {
  id: string;
  type: 'RIDER_PICKUP' | 'RIDER_DELIVERY';
  status: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  completedAt?: string;
  rider: CustomOrderRider;
}

export interface CustomOrder {
  id: string;
  orderType: 'CUSTOM_LAUNDRY';

  // Custom laundry details
  customLaundryName: string;
  customLaundryDescription: string;
  customLaundryLat: number;
  customLaundryLong: number;
  customLaundryAddress?: string;

  // Order status and timing
  status:
    | 'PENDING'
    | 'ACCEPTED'
    | 'IN_PROGRESS'
    | 'READY_FOR_PICKUP'
    | 'COMPLETED'
    | 'CANCELLED';
  createdAt: string;
  updatedAt: string;

  // Pricing
  adminServiceCharge?: number;
  totalAmount?: number;
  estimatedVendorCost?: number;

  // Customer payment via PayTabs
  customerPaid: boolean;
  payTabsInvoiceId?: string;
  payTabsInvoiceUrl?: string;
  payTabsTransactionRef?: string;
  customerPaymentDate?: string;

  // Driver payment to vendor
  customVendorReceipt?: string;
  customVendorPaid?: number;
  customVendorName?: string;
  customPaymentMethod?: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'MOBILE_PAYMENT';

  // Related entities
  customer: CustomOrderCustomer;
  pickup: CustomOrderPickup;
  delivery: CustomOrderDelivery;
  riderOrders: CustomOrderRiderOrder[];

  // Additional fields
  notes?: string;
  cancelReason?: string;
  adminNotes?: string;
}

export interface CustomOrderStats {
  totalOrders: number;
  pendingPricing: number;
  awaitingDriver: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
  averageOrderValue: number;
  completionRate: number;
  averageProcessingTime: number;
  needsDriverAssignment: number;
  awaitingPayment: number;
  needsDeliveryAssignment: number;
}

export interface CustomOrderWorkflowStatus {
  orderId: string;
  currentStatus: string;
  nextActions: CustomOrderAction[];
  blockers: CustomOrderBlocker[];
  timeline: CustomOrderTimelineEvent[];
}

export interface CustomOrderAction {
  type:
    | 'SET_PRICING'
    | 'ASSIGN_DRIVER'
    | 'UPLOAD_RECEIPT'
    | 'SEND_INVOICE'
    | 'ASSIGN_DELIVERY_DRIVER';
  label: string;
  description: string;
  required: boolean;
  completable: boolean;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface CustomOrderBlocker {
  type: string;
  message: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
}

export interface CustomOrderTimelineEvent {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  actor?: {
    type: 'ADMIN' | 'CUSTOMER' | 'RIDER';
    name: string;
  };
  metadata?: Record<string, any>;
}

// ==================== API REQUEST/RESPONSE TYPES ====================

export interface UpdateCustomOrderPricingRequest {
  adminServiceCharge: number;
  totalAmount: number;
  estimatedVendorCost?: number;
  notes?: string;
}

export interface AssignDriverToCustomOrderRequest {
  riderId: string;
}

export interface UploadCustomOrderReceiptRequest {
  vendorName: string;
  amountPaid: number;
  paymentMethod: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'MOBILE_PAYMENT';
  notes?: string;
}

export interface MarkCustomOrderReadyRequest {
  deliveryRiderId?: string;
}

export interface CustomOrderSearchFilters {
  status?: string;
  customerName?: string;
  laundryName?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  riderId?: string;
  paymentStatus?: 'PAID' | 'UNPAID';
}

export interface CustomOrderExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  startDate?: string;
  endDate?: string;
  status?: string;
  includeCustomerData: boolean;
  includeFinancialData: boolean;
}

// ==================== FORM VALIDATION SCHEMAS ====================

export interface PricingFormData {
  adminServiceCharge: string;
  totalAmount: string;
  estimatedVendorCost: string;
  notes: string;
}

export interface ReceiptUploadFormData {
  receiptFile: File | null;
  vendorName: string;
  amountPaid: string;
  paymentMethod: string;
  notes: string;
}

export interface DriverAssignmentFormData {
  riderId: string;
  notes?: string;
}

// ==================== UI STATE TYPES ====================

export interface CustomOrdersPageState {
  selectedTab: number;
  searchTerm: string;
  selectedOrder: CustomOrder | null;
  dialogStates: {
    details: boolean;
    pricing: boolean;
    driverAssignment: boolean;
    receiptUpload: boolean;
  };
  loading: {
    orders: boolean;
    stats: boolean;
    updatePricing: boolean;
    assignDriver: boolean;
    uploadReceipt: boolean;
  };
}

export interface CustomOrderTableColumn {
  id:
    | keyof CustomOrder
    | 'actions'
    | 'customer'
    | 'laundry'
    | 'pricing'
    | 'nextAction';
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  format?: (value: any) => string;
  sortable?: boolean;
}

// ==================== ANALYTICS TYPES ====================

export interface CustomOrderAnalytics {
  overview: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    completionRate: number;
  };
  trends: {
    ordersOverTime: Array<{
      date: string;
      count: number;
      revenue: number;
    }>;
    statusDistribution: Array<{
      status: string;
      count: number;
      percentage: number;
    }>;
  };
  performance: {
    averageProcessingTime: number;
    averageDriverResponseTime: number;
    customerSatisfactionRate: number;
    onTimeDeliveryRate: number;
  };
  geographical: {
    popularAreas: Array<{
      area: string;
      orderCount: number;
      averageOrderValue: number;
    }>;
    driverCoverage: Array<{
      area: string;
      availableDrivers: number;
      averageResponseTime: number;
    }>;
  };
}

export default CustomOrder;
