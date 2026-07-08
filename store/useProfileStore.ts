import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ProfileState {
  name: string;
  email: string;
  hasSeenIntro: boolean;
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  markIntroSeen: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      name: 'Alex',
      email: '',
      hasSeenIntro: false,
      setName: (name) => set({ name }),
      setEmail: (email) => set({ email }),
      markIntroSeen: () => set({ hasSeenIntro: true }),
    }),
    {
      name: 'fits-profile',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
