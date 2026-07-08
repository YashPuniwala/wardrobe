import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  isLoggedIn: boolean;
  hasCompletedQuiz: boolean;
  login: () => void;
  logout: () => void;
  completeQuiz: () => void;
  setHasCompletedQuiz: (completed: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      hasCompletedQuiz: false,
      login: () => set({ isLoggedIn: true }),
      logout: () => set({ isLoggedIn: false, hasCompletedQuiz: false }),
      completeQuiz: () => set({ hasCompletedQuiz: true }),
      setHasCompletedQuiz: (completed) => set({ hasCompletedQuiz: completed }),
    }),
    {
      name: 'fits-auth-v2',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
