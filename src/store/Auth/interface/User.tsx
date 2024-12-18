export interface UserData {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    dateOfBirth: string;
    status: string;
    imageUrl: string;
    addresses: Address[];
}

export interface Address {
    address: string;
    lat: number;
    long: number;
    label: string;
    isDefault?: boolean;
}
