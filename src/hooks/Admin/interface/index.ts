export enum USER_TYPES {
    USER = "USER",
    VENDOR = "VENDOR",
    RIDER = "RIDER",
    ADMIN = "ADMIN"
}
export interface FetchUsersParams {
    type: keyof typeof USER_TYPES;
    page?: number;
    limit?: number;
    column?: string;
    direction?: "ASC" | "DESC";
    dateFilter?: keyof Filter;
}

export enum USER_TYPES_APPLICATIONS {
    VENDOR = "VENDOR",
    RIDER = "RIDER",
}

export interface FetchApplicationsParams {
    type: keyof typeof USER_TYPES_APPLICATIONS;
    page?: number;
    limit?: number;
    column?: string;
    direction?: "ASC" | "DESC";
}

export type Filter = {
    Today: string,
    ByWeek: string,
    ByMonth: string,
    BySixMonths: string,
    ByYear: string,
}

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
    { value: ORDER_STATUSES.PENDING, status: "PENDING" },
    { value: ORDER_STATUSES.ACCEPTED, status: "ACCEPTED" },
    // {value: ORDER_STATUSES.REJECTED, status: "REJECTED"},
    { value: ORDER_STATUSES.CANCELLED, status: "CANCELLED" },
    { value: ORDER_STATUSES.IN_PROGRESS, status: "IN PROGRESS" },
    { value: ORDER_STATUSES.READY_FOR_PICKUP, status: "READY FOR PICKUP" },
    { value: ORDER_STATUSES.COMPLETED, status: "COMPLETED" },

]

export interface FetchOrdersParams {
    page?: number;
    limit?: number;
    column?: string;
    direction?: "ASC" | "DESC";
    type?: keyof typeof ORDER_STATUSES | null;
}

export const STATUSES = {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE"
}

export enum LEVELS {
    BASIC = "BASIC",
    LOYAL = "LOYAL",
    ELITE = "ELITE",
}

export type User = {
    id: string,
    firstName: string,
    lastName: string,
    type: keyof typeof USER_TYPES,
    email: string,
    phone: string,
    status: keyof typeof STATUSES;
    createdAt: string,
    level: LEVELS,
    medias: MediaFile[],
}

export type MediaFile = {
    id: number;
    location: string;
    status: string;
}

export type UserResponse = {
    data: User[],
    count: number,
}

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
    phone: string,
    password: string
}

export type UserLoginResponse = {
    token: string
}

export type Vendor = {
    phone: string
}

export type Laundry = {
    name: string,
    vendor: Vendor,
}

export type pickup = {
    rider: rider
    pickupAddress: string,
    pickupLat: string,
    pickupLong: string,

}

type rider = {
    firstName: string,
    lastName: string,
    phone: string,
}

export type Order = {
    id: string,
    status: keyof typeof ORDER_STATUSES;
    user: User,
    totalAmount: number,
    totalQuantity: number,
    laundry: Laundry,
    pickup: pickup,
    delivery: {
        rider: rider
    },
    coupon?: {
        code: string;
        id: string;
    }
}

export type OrdersResponse = {
    data: Order[],
    count: number
}

type userSettingCorrds = {
    lat: number,
    long: number
}

type coords = {
    id: string;
    settings: userSettingCorrds,
}

export type UserCoords = {
    data: coords[]
}

export interface OrderDetails {
    id: string;
    status: keyof typeof ORDER_STATUSES;
    totalAmount: number;
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
        }
    }[],
    laundry: {
        name: string;
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
}

export enum DISCOUNT_TYPE {
    FIXED = "FIXED",
    PERCENTAGE = "PERCENTAGE"

}
export interface CreateCouponRequest {
    code : string;
    name : string;
    type: DISCOUNT_TYPE;
    discount : number;
    maxDiscount?: number;
    minOrderAmount?:number;
    expiryDate:string;
    usageLimit?: number;
    singleUse: boolean;
    isActive:boolean;
    startDate?:string
}

export interface FetchCouponParams {
    page: number;
    limit: number;
    column?: string;
    direction?: "ASC" | "DESC";
}

