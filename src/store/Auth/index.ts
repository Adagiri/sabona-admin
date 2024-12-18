import { create } from 'zustand';
import { UserData } from './interface/User';

export interface AuthState {
    isLoggedIn?: boolean;
    setIsLoggedIn: (isLoggedIn: boolean) => void;
    token?: string | null;
    setToken: (token: string) => void;
    user?: UserData,
    setUserData: (user: UserData) => void;
    clearToken: () => void;
}

const useAuthStore = create<AuthState>()(
    (set) => ({
        isLoggedIn: false,

        setIsLoggedIn: (isLoggedIn: boolean): void => {
            set({ isLoggedIn });
        },


        setToken: (token: string): void => {
            set({ token });
        },
        clearToken: () => set({ token: null }),

        setUserData: (user: UserData): void => {
            set({ user });
        },
    })
);


export default useAuthStore;
