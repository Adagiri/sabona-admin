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
    medias: Media[];
}

export interface Media {
    id: number;
    url: string;
    type: string;
    public: boolean;
    userId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
    user: UserData;
}

export interface Address {
    address: string;
    lat: number;
    long: number;
    label: string;
    isDefault?: boolean;
}
