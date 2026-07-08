import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  notificationsEnabled: boolean;
  temperatureUnit: 'F' | 'C';
  toggleNotifications: () => void;
  setTemperatureUnit: (unit: 'F' | 'C') => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notificationsEnabled: true,
      temperatureUnit: 'F',
      toggleNotifications: () => set((s) => ({ notificationsEnabled: !s.notificationsEnabled })),
      setTemperatureUnit: (unit) => set({ temperatureUnit: unit }),
    }),
    {
      name: 'fits-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
