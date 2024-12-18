import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserData } from './interface/User';

export interface AuthState {
    isLoggedIn?: boolean;
    setIsLoggedIn: (isLoggedIn: boolean) => void;
    token?: string | null;
    setToken: (token: string) => void;
    user?: UserData;
    setUserData: (user: UserData) => void;
    clearToken: () => void;
    resetStore: () => void;
}

const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            isLoggedIn: false,
            token: null,
            user: undefined,

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

            resetStore: () => set({ isLoggedIn: false, token: null, user: undefined }),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => window.localStorage),
        }
    )
);

export default useAuthStore;
