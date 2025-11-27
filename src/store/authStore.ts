import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Device, DeviceType } from '../types';

interface AuthState {
  user: User | null;
  device: Device | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  setUser: (user: User | null) => void;
  setDevice: (device: Device | null) => void;
  setDeviceType: (type: DeviceType) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      device: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setDevice: (device) => set({ device }),
      setDeviceType: (type) => set((state) => ({
        device: state.device ? { ...state.device, type } : null
      })),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      logout: () => set({ user: null, device: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
