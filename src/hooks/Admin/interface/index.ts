export enum USER_TYPES {
  USER = 'USER',
  VENDOR = 'VENDOR',
  RIDER = 'RIDER',
  ADMIN = 'ADMIN',
}
export interface FetchUsersParams {
  type: keyof typeof USER_TYPES;
  page?: number;
  limit?: number;
  column?: string;
  direction?: 'ASC' | 'DESC';
  dateFilter?: keyof Filter;
}

export enum USER_TYPES_APPLICATIONS {
  VENDOR = 'VENDOR',
  RIDER = 'RIDER',
}

export interface FetchApplicationsParams {
  type: keyof typeof USER_TYPES_APPLICATIONS;
  page?: number;
  limit?: number;
  column?: string;
  direction?: 'ASC' | 'DESC';
}

export type Filter = {
  Today: string;
  ByWeek: string;
  ByMonth: string;
  BySixMonths: string;
  ByYear: string;
};

export enum ORDER_STATUSES {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  IN_PROGRESS = 'IN_PROGRESS',
  READY_FOR_PICKUP = 'READY_FOR_PICKUP',
  COMPLETED = 'COMPLETED',
}

export const ORDER_STATUSES_ARRAY = [
  { value: ORDER_STATUSES.PENDING, status: 'PENDING' },
  { value: ORDER_STATUSES.ACCEPTED, status: 'ACCEPTED' },
  // {value: ORDER_STATUSES.REJECTED, status: "REJECTED"},
  { value: ORDER_STATUSES.CANCELLED, status: 'CANCELLED' },
  { value: ORDER_STATUSES.IN_PROGRESS, status: 'IN PROGRESS' },
  { value: ORDER_STATUSES.READY_FOR_PICKUP, status: 'READY FOR PICKUP' },
  { value: ORDER_STATUSES.COMPLETED, status: 'COMPLETED' },
];

export interface FetchOrdersParams {
  page?: number;
  limit?: number;
  column?: string;
  direction?: 'ASC' | 'DESC';
  type?: keyof typeof ORDER_STATUSES | null;
  orderType?: 'REGISTERED_LAUNDRY' | 'CUSTOM_LAUNDRY';
}

export const STATUSES = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

export enum LEVELS {
  BASIC = 'BASIC',
  LOYAL = 'LOYAL',
  ELITE = 'ELITE',
}

// export type MediaFile = {
//     id: number;
//     location: string;
//     status: string;
// }

export type UserResponse = {
  data: User[];
  count: number;
};

export interface UploadImage {
  name: string;
  size: number;
  type: string;
  public: boolean;
}

export interface MediaId {
  id: number;
}

export type UserCredentials = {
  phone: string;
  password: string;
};

export type UserLoginResponse = {
  token: string;
};

export type Vendor = {
  phone: string;
};

export type Laundry = {
  name: string;
  vendor: Vendor;
};

export type pickup = {
  rider: rider;
  pickupAddress: string;
  pickupLat: string;
  pickupLong: string;
};

type rider = {
  firstName: string;
  lastName: string;
  phone: string;
};

export type Order = {
  id: string;
  status: keyof typeof ORDER_STATUSES;
  user: User;
  totalAmount: number;
  totalQuantity: number;
  laundry: Laundry;
  pickup: pickup;
  delivery: {
    rider: rider;
  };
  coupon?: {
    code: string;
    id: string;
  };
};

export type OrdersResponse = {
  data: Order[];
  count: number;
};

type userSettingCorrds = {
  lat: number;
  long: number;
};

type coords = {
  id: string;
  settings: userSettingCorrds;
};

export type UserCoords = {
  data: coords[];
};

export interface OrderDetails {
  // Basic order info
  id: string;
  status: keyof typeof ORDER_STATUSES;
  totalAmount: number;
  totalQuantity?: number; // Add this for item count
  createdAt: string; // Add this for order date
  updatedAt: string; // Add this for last update
  deliveryType?: string;
  orderNumber: number;
  // Customer information
  user: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
  };

  // Current service structure (keep as is)
  services: {
    id: string;
    laundryService: {
      id: string;
      name: string;
      description: string;
      laundryServiceItems: {
        id: string;
        name: string;
        price: number;
      }[];
    };
    // Add actual ordered items with quantities
    items?: {
      id: string;
      laundryServiceItemId: string;
      quantity: number;
      laundryServiceItem: {
        id: string;
        name: string;
        price: number;
      };
    }[];
  }[];

  // Current laundry structure (keep as is)
  laundry: {
    id: string;
    name: string;
    address?: string;
    vendor: {
      id: string;
      phone: string;
      firstName: string;
      lastName: string;
    };
    laundryService: {
      id: string;
      name: string;
      description: string;
      laundryServiceItems: {
        id: string;
        name: string;
        price: number;
      }[];
    }[];
  };

  // Pickup and delivery info
  pickup?: {
    pickupAddress: string;
    pickupDate: string;
    pickupTime: string;
    pickupLat?: number;
    pickupLong?: number;
    status?: string; // PENDING, ACCEPTED, PICKED_UP, DROPPED_AT_VENDOR
    rider?: {
      id: string;
      firstName: string;
      lastName: string;
      phone: string;
    };
  };

  delivery?: {
    deliveryAddress: string;
    deliveryDate?: string;
    deliveryType: string;
    deliveryLat?: number;
    deliveryLong?: number;
    status?: string; // PENDING, ACCEPTED, DELIVERED
    rider?: {
      id: string;
      firstName: string;
      lastName: string;
      phone: string;
    };
  };

  // Payment information
  paymentType?: string;
  paymentStatus?: string;
  paid?: boolean;
  baseAmount?: number;
  discountAmount?: number;
  paymentLink?: string;
  payTabsInvoiceUrl?: string;

  // Coupon info
  coupon?: {
    id: string;
    code: string;
    discount: number;
  };

  // Current tip structure (keep as is)
  tip: {
    id: string;
    amount: number;
    riderId: string;
    type: TIP_TYPE;
  }[];

  // Additional useful fields
  notes?: string;
  adminNotes?: string;
  cancelReason?: string;
}

export enum TIP_TYPE {
  RIDER_PICKUP = 'RIDER_PICKUP',
  RIDER_DELIVERY = 'RIDER_DELIVERY',
}

export enum DISCOUNT_TYPE {
  FIXED = 'FIXED',
  PERCENTAGE = 'PERCENTAGE',
}
export interface CreateCouponRequest {
  code: string;
  nameLocale: { en: string; ar: string };
  type: DISCOUNT_TYPE;
  discount: number;
  maxDiscount?: number;
  minOrderAmount?: number;
  expiryDate: string;
  usageLimit?: number;
  singleUse: boolean;
  isActive: boolean;
  startDate?: string;
}

export interface FetchCouponParams {
  page: number;
  limit: number;
  column?: string;
  direction?: 'ASC' | 'DESC';
}

export interface getRiderTipsParams {
  startDate: string;
  endDate: string;
}

// Based on your Prisma schema and backend responses
export interface Media {
  id: number;
  name: string;
  extension: string;
  type: MediaType;
  access: MediaAccess;
  size?: number;
  location?: string;
  path: string;
  thumbPath?: string;
  status: MediaStatus;
  meta?: any;
  userId?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  //   user?: UserData;
}

// Enums from your Prisma schema
export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
  ARCHIVE = 'ARCHIVE',
  OTHER = 'OTHER',
}

export enum MediaAccess {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

export enum MediaStatus {
  UPLOADING = 'UPLOADING',
  READY = 'READY',
  STALE = 'STALE',
}

// Simplified version for lists (what you currently have)
export type MediaFile = {
  id: number;
  location: string;
  status: string;
};

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  type: keyof typeof USER_TYPES;
  email: string;
  phone: string;
  status: keyof typeof STATUSES;
  createdAt: string;
  level: LEVELS;
  medias: Media[]; // Use the full Media interface instead of MediaFile
  settings?: UserSettings;
};

export interface UserSettings {
  laundryName?: string;
  lat?: number;
  long?: number;
  contactPhone?: string;
  isOnboardingCompleted?: boolean;
  isDocumentsUploaded?: boolean;
  address?: string;
}

export interface RiderDocumentDTO {
  id: number;
  name: string;
  status: string;
  uploadedAt: string;
  viewUrl: string | null;
}

export interface RiderDocumentsResponse {
  driverLicense: RiderDocumentDTO | null;
  hasAllDocuments: boolean;
  totalDocuments: number;
}

export interface UploadRiderDocumentRequest {
  driverLicenseDocId: string;
}

export interface FinalizeRiderDocumentRequest {
  documentType: string;
  uploadId: string;
}

export interface UploadRiderDocumentResponse {
  success: boolean;
  message: string;
  riderId: string;
}

export interface FinalizeRiderDocumentResponse {
  success: boolean;
  message: string;
  document: {
    id: number;
    type: string;
    status: string;
    path: string;
  };
}
// interface ApplicationDocument {
//   id: number;
//   name: string;
//   path: string;
//   type: string;
//   createdAt: string;
// }

// interface ApplicationDocumentsResponse {
//   vatNumberDoc?: ApplicationDocument;
//   businessCertDoc?: ApplicationDocument;
// }

// ==================== BROADCAST NOTIFICATION TYPES ====================

export enum NOTIFICATION_ACTION_TYPE {
  ORDERS = 'ORDERS',
  PROFILE = 'PROFILE',
  HOME = 'HOME',
  PROMOTIONS = 'PROMOTIONS',
}

export interface BroadcastNotificationRequest {
  titleEn: string;
  bodyEn: string;
  titleAr: string;
  bodyAr: string;
  actionType?: NOTIFICATION_ACTION_TYPE;
  route?: string;
  userTypes?: ('USER' | 'VENDOR' | 'RIDER')[];
  registrationStartDate?: string;
  registrationEndDate?: string;
  minOrderCount?: number;
  maxOrderCount?: number;
}

export interface BroadcastNotificationResponse {
  message: string;
  totalRecipients: number;
  notificationsSent: number;
}
