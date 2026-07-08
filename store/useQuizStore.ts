import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface QuizAnswer {
  questionId: string;
  selectedOptions: string[];
}

interface QuizState {
  answers: Record<string, string[]>;
  setAnswer: (questionId: string, option: string) => void;
  toggleAnswer: (questionId: string, option: string) => void;
  reset: () => void;
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set) => ({
      answers: {},
      setAnswer: (questionId, option) =>
        set((state) => ({ answers: { ...state.answers, [questionId]: [option] } })),
      toggleAnswer: (questionId, option) =>
        set((state) => {
          const current = state.answers[questionId] || [];
          const exists = current.includes(option);
          return {
            answers: {
              ...state.answers,
              [questionId]: exists ? current.filter((o) => o !== option) : [...current, option],
            },
          };
        }),
      reset: () => set({ answers: {} }),
    }),
    {
      name: 'fits-quiz',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
