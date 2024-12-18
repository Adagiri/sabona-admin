export enum USER_TYPES {
    USER = "USER",
    VENDOR = "VENDOR",
    RIDER = "RIDER",
    ADMIN = "ADMIN"
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

export const STATUSES = {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE"
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
}

export type UserResponse = {
    data: User[]
}


export type UserCredentials = {
    phone: string,
    password: string
}

export type UserLoginResponse = {
    token: string
}


export type Order = {
    id: string,
    status: keyof typeof ORDER_STATUSES;
    createdAt: string,
    totalAmount: number,
}

export type OrdersResponse = { 
    data: Order[]
}