import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationsState {
  hasUnread: boolean;
  markRead: () => void;
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set) => ({
      hasUnread: true,
      markRead: () => set({ hasUnread: false }),
    }),
    {
      name: 'fits-notifications',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
