import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Device, PairingRequest } from '../types';

interface DeviceState {
  linkedDevices: Device[];
  pairingRequests: PairingRequest[];
  isPairing: boolean;

  setLinkedDevices: (devices: Device[]) => void;
  addLinkedDevice: (device: Device) => void;
  removeLinkedDevice: (deviceId: string) => void;
  setPairingRequests: (requests: PairingRequest[]) => void;
  addPairingRequest: (request: PairingRequest) => void;
  updatePairingRequest: (requestId: string, status: PairingRequest['status']) => void;
  setIsPairing: (pairing: boolean) => void;
}

export const useDeviceStore = create<DeviceState>()(
  persist(
    (set) => ({
      linkedDevices: [],
      pairingRequests: [],
      isPairing: false,

      setLinkedDevices: (linkedDevices) => set({ linkedDevices }),

      addLinkedDevice: (device) => set((state) => ({
        linkedDevices: [...state.linkedDevices, device]
      })),

      removeLinkedDevice: (deviceId) => set((state) => ({
        linkedDevices: state.linkedDevices.filter((d) => d.id !== deviceId)
      })),

      setPairingRequests: (pairingRequests) => set({ pairingRequests }),

      addPairingRequest: (request) => set((state) => ({
        pairingRequests: [...state.pairingRequests, request]
      })),

      updatePairingRequest: (requestId, status) => set((state) => ({
        pairingRequests: state.pairingRequests.map((r) =>
          r.id === requestId ? { ...r, status } : r
        )
      })),

      setIsPairing: (isPairing) => set({ isPairing }),
    }),
    {
      name: 'device-storage',
    }
  )
);
